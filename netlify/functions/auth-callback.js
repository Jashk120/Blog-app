import { verifyState } from './auth.js';

function response(body, statusCode = 200) {
  return new Response(body, {
    status: statusCode,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => {
    const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
    return entities[character];
  });
}

export default async function handler(request) {
  try {
    const params = new URL(request.url).searchParams;
    const state = verifyState(params.get('state'), process.env.OAUTH_STATE_SECRET);
    const code = params.get('code');
    if (!code) return response('Missing GitHub authorization code', 400);

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: state.redirectUri,
      }),
    });
    const token = await tokenResponse.json();
    if (!token.access_token) throw new Error(token.error_description || 'GitHub authorization failed');

    const userResponse = await fetch('https://api.github.com/user', {
      headers: { accept: 'application/vnd.github+json', authorization: `Bearer ${token.access_token}` },
    });
    const user = await userResponse.json();
    const allowedUsers = (process.env.GITHUB_ALLOWED_USERS || '')
      .split(',')
      .map(value => value.trim().toLowerCase())
      .filter(Boolean);
    if (!allowedUsers.includes(String(user.login || '').toLowerCase())) {
      throw new Error('This GitHub account is not authorized to use the CMS');
    }

    const message = JSON.stringify({ token: token.access_token, provider: 'github' });
    return response(`<!doctype html>
<script>
  const message = ${JSON.stringify(`authorization:github:success:${message}`)};
  const allowedOrigin = ${JSON.stringify(state.origin)};
  window.addEventListener('message', event => {
    if (event.origin === allowedOrigin && event.data === 'authorizing:github') {
      event.source.postMessage(message, allowedOrigin);
      window.close();
    }
  });
  if (window.opener) window.opener.postMessage('authorizing:github', allowedOrigin);
</script>
<p>Authentication complete. You can close this window.</p>`);
  } catch (error) {
    return response(`<p>Authentication failed: ${escapeHtml(error.message)}</p>`, 403);
  }
}
