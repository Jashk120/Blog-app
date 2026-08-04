import { createHmac, timingSafeEqual } from 'node:crypto';

const githubAuthorizeUrl = 'https://github.com/login/oauth/authorize';

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing Netlify environment variable: ${name}`);
  return value;
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function sign(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function redirect(location) {
  return new Response(null, { status: 302, headers: { location } });
}

function errorResponse(message, statusCode = 500) {
  return new Response(message, {
    status: statusCode,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

export default async function handler(request) {
  try {
    const origin = new URL(requiredEnv('OAUTH_ORIGIN')).origin;
    const clientId = requiredEnv('GITHUB_CLIENT_ID');
    const stateSecret = requiredEnv('OAUTH_STATE_SECRET');
    const redirectUri =
      process.env.GITHUB_REDIRECT_URI || `${origin}/.netlify/functions/auth-callback`;
    const state = encode({ origin, redirectUri, timestamp: Date.now() });
    const signedState = `${state}.${sign(state, stateSecret)}`;
    const url = new URL(githubAuthorizeUrl);

    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', 'repo,user');
    url.searchParams.set('state', signedState);

    return redirect(url.toString());
  } catch (error) {
    return errorResponse(error.message);
  }
}

export function verifyState(signedState, secret) {
  const [encoded, signature] = String(signedState || '').split('.');
  if (!encoded || !signature) throw new Error('Invalid OAuth state');

  const expected = sign(encoded, secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid OAuth state signature');
  }

  const state = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  if (Date.now() - state.timestamp > 10 * 60 * 1000) throw new Error('Expired OAuth state');
  return state;
}
