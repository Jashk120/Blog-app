# CMS OAuth Setup

The CMS edits this repository (`Jashk120/Blog-app`) through the GitHub backend.
The OAuth functions require these Netlify environment variables:

```text
GITHUB_CLIENT_ID=<GitHub OAuth app client ID>
GITHUB_CLIENT_SECRET=<GitHub OAuth app client secret>
GITHUB_ALLOWED_USERS=Jashk120
OAUTH_ORIGIN=https://jayesh-kathale.netlify.app
OAUTH_STATE_SECRET=<random secret, at least 32 characters>
GITHUB_REDIRECT_URI=https://jayesh-kathale.netlify.app/.netlify/functions/auth-callback
```

Set the GitHub OAuth app callback URL to the value of `GITHUB_REDIRECT_URI`.
Keep the client secret and state secret in Netlify only. The allowed GitHub users
must also have write access to `Jashk120/Blog-app`.
