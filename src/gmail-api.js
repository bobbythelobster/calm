/**
 * Gmail API Client
 * 
 * Lightweight wrapper around Gmail API v1
 * Handles common operations: list emails, fetch message, send, manage labels
 */

export class GmailAPI {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://www.googleapis.com/gmail/v1/users/me';
  }

  /**
   * Set new access token (after refresh)
   */
  setAccessToken(accessToken) {
    this.accessToken = accessToken;
  }

  /**
   * Get request headers with OAuth token
   */
  _headers() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Make authenticated API request
   */
  async _request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: this._headers(),
      ...options
    });

    if (response.status === 401) {
      throw new Error('Unauthorized: Token expired or invalid');
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gmail API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * List messages in inbox
   */
  async listMessages(options = {}) {
    const query = options.query || 'in:inbox';
    const maxResults = options.maxResults || 10;

    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults,
      pageToken: options.pageToken || ''
    });

    return this._request(`/messages?${params}`);
  }

  /**
   * Get full message details
   */
  async getMessage(messageId) {
    return this._request(`/messages/${messageId}`);
  }

  /**
   * Get message with parsed content
   */
  async getMessageParsed(messageId) {
    const message = await this.getMessage(messageId);
    return this._parseMessage(message);
  }

  /**
   * Parse email from raw format
   */
  _parseMessage(message) {
    const headers = message.payload.headers || [];
    const headerMap = {};

    headers.forEach(header => {
      headerMap[header.name.toLowerCase()] = header.value;
    });

    return {
      id: message.id,
      threadId: message.threadId,
      labels: message.labelIds || [],
      subject: headerMap.subject || '(no subject)',
      from: headerMap.from || '',
      to: headerMap.to || '',
      date: headerMap.date || '',
      snippet: message.snippet || '',
      body: this._extractBody(message.payload),
      internalDate: message.internalDate,
      sizeEstimate: message.sizeEstimate
    };
  }

  /**
   * Extract email body from message payload
   */
  _extractBody(payload) {
    // Simple body extraction - can be enhanced with MIME parsing
    if (payload.body && payload.body.data) {
      return this._decodeBase64(payload.body.data);
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
          if (part.body && part.body.data) {
            return this._decodeBase64(part.body.data);
          }
        }
      }
    }

    return '(no body)';
  }

  /**
   * Decode base64url encoded string
   */
  _decodeBase64(encoded) {
    try {
      // Convert base64url to base64
      const base64 = encoded
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      // Decode base64 to string
      return atob(base64);
    } catch (e) {
      console.error('Failed to decode base64:', e);
      return encoded;
    }
  }

  /**
   * Search messages
   */
  async search(query, options = {}) {
    const params = new URLSearchParams({
      q: query,
      maxResults: options.maxResults || 10
    });

    return this._request(`/messages?${params}`);
  }

  /**
   * Get all labels
   */
  async getLabels() {
    return this._request('/labels');
  }

  /**
   * Create a label
   */
  async createLabel(name, labelListVisibility = 'labelShow') {
    const body = JSON.stringify({
      name,
      labelListVisibility
    });

    return this._request('/labels', {
      method: 'POST',
      body
    });
  }

  /**
   * Modify message labels
   */
  async modifyMessage(messageId, addLabels = [], removeLabels = []) {
    const body = JSON.stringify({
      addLabelIds: addLabels,
      removeLabelIds: removeLabels
    });

    return this._request(`/messages/${messageId}/modify`, {
      method: 'POST',
      body
    });
  }

  /**
   * Archive message (remove from inbox)
   */
  async archiveMessage(messageId) {
    return this.modifyMessage(messageId, [], ['INBOX']);
  }

  /**
   * Mark as spam
   */
  async spamMessage(messageId) {
    return this.modifyMessage(messageId, ['SPAM'], ['INBOX', 'UNREAD']);
  }

  /**
   * Delete message permanently
   */
  async deleteMessage(messageId) {
    return this._request(`/messages/${messageId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId) {
    return this.modifyMessage(messageId, [], ['UNREAD']);
  }

  /**
   * Mark message as unread
   */
  async markAsUnread(messageId) {
    return this.modifyMessage(messageId, ['UNREAD'], []);
  }

  /**
   * Send an email
   */
  async sendMessage(to, subject, body, options = {}) {
    const headers = [
      `From: ${options.from || 'me'}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'MIME-Version: 1.0'
    ];

    const email = `${headers.join('\r\n')}\r\n\r\n${body}`;
    const encoded = this._encodeBase64(email);

    const payload = JSON.stringify({
      raw: encoded,
      threadId: options.threadId
    });

    return this._request('/messages/send', {
      method: 'POST',
      body: payload
    });
  }

  /**
   * Encode string to base64url
   */
  _encodeBase64(str) {
    const encoded = btoa(unescape(encodeURIComponent(str)));
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Get user profile
   */
  async getProfile() {
    return this._request('/profile');
  }

  /**
   * Watch for changes (requires push notifications setup)
   */
  async watch() {
    return this._request('/watch', {
      method: 'POST',
      body: JSON.stringify({
        labelIds: ['INBOX']
      })
    });
  }
}
