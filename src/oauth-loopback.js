/**
 * OAuth 2.0 Loopback Server for Gmail API
 * 
 * Implements the authorization code flow using localhost for desktop apps
 * No server required - runs locally for the OAuth redirect
 * 
 * RFC 8252: OAuth 2.0 for Native Apps
 */

import http from 'http';

export class OAuthLoopback {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.port = 8888;
    this.server = null;
    this.authCode = null;
    this.resolve = null;
  }

  /**
   * Start the loopback server and open Google OAuth consent screen
   * Returns a promise that resolves when user grants access
   */
  async startAuthFlow() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;

      // Create HTTP server to receive OAuth callback
      this.server = http.createServer((req, res) => {
        const url = new URL(req.url, `http://localhost:${this.port}`);

        if (url.pathname === '/callback') {
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');

          if (error) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(`<h1>Authorization Failed</h1><p>${error}</p>`);
            reject(new Error(`OAuth error: ${error}`));
          } else if (code) {
            this.authCode = code;

            // Send success response to browser
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <h1>✅ Authorization Successful</h1>
              <p>You can close this window and return to Calm.</p>
              <script>window.close();</script>
            `);

            // Close server and resolve with code
            this.server.close();
            resolve(code);
          } else {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('<h1>No authorization code received</h1>');
            reject(new Error('No authorization code received'));
          }
        } else {
          res.writeHead(404);
          res.end('Not found');
        }
      });

      this.server.listen(this.port, 'localhost', () => {
        console.log(`OAuth callback server listening on http://localhost:${this.port}`);
        this._openBrowser();
      });

      this.server.on('error', reject);
    });
  }

  /**
   * Open Google OAuth consent screen in default browser
   */
  _openBrowser() {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.send'
    ];

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: `http://localhost:${this.port}/callback`,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline', // Request refresh token
      prompt: 'consent' // Force consent screen
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

    // Open in browser (platform-specific)
    const { exec } = require('child_process');
    const platform = process.platform;

    if (platform === 'darwin') {
      exec(`open "${authUrl}"`);
    } else if (platform === 'win32') {
      exec(`start "${authUrl}"`);
    } else if (platform === 'linux') {
      exec(`xdg-open "${authUrl}"`);
    } else {
      console.log(`Please visit: ${authUrl}`);
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code) {
    const tokenUrl = 'https://oauth2.googleapis.com/token';

    const body = new URLSearchParams({
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: `http://localhost:${this.port}/callback`,
      grant_type: 'authorization_code'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokens = await response.json();
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type
    };
  }

  /**
   * Refresh an expired access token
   */
  async refreshAccessToken(refreshToken) {
    const tokenUrl = 'https://oauth2.googleapis.com/token';

    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokens = await response.json();
    return {
      accessToken: tokens.access_token,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type
    };
  }

  /**
   * Shutdown the server
   */
  shutdown() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}

/**
 * TokenManager - Handles secure token storage and refresh
 */
export class TokenManager {
  constructor(storage) {
    this.storage = storage; // IndexedDB or localStorage adapter
  }

  /**
   * Save tokens securely
   */
  async saveTokens(tokens) {
    const saved = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + (tokens.expiresIn * 1000)
    };

    await this.storage.set('oauth_tokens', saved);
    return saved;
  }

  /**
   * Get current access token, refreshing if expired
   */
  async getAccessToken(refreshFn) {
    const tokens = await this.storage.get('oauth_tokens');

    if (!tokens) {
      throw new Error('No tokens found. Please authorize first.');
    }

    // Check if token is expired (refresh 5 minutes before actual expiry)
    const expiryBuffer = 5 * 60 * 1000;
    if (Date.now() > tokens.expiresAt - expiryBuffer) {
      console.log('Access token expired, refreshing...');
      const newTokens = await refreshFn(tokens.refreshToken);
      await this.saveTokens({ ...newTokens, refreshToken: tokens.refreshToken });
      return newTokens.accessToken;
    }

    return tokens.accessToken;
  }

  /**
   * Clear tokens (logout)
   */
  async clearTokens() {
    await this.storage.delete('oauth_tokens');
  }

  /**
   * Check if user is authorized
   */
  async isAuthorized() {
    const tokens = await this.storage.get('oauth_tokens');
    return !!tokens;
  }
}
