// Frontend session management utility
export class SessionManager {
  private static readonly SESSION_KEY = 'session_id';
  private static readonly SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
  private static readonly CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds
  
  private static onSessionExpired: (() => void) | null = null;
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * Initialize session monitoring
   */
  static initialize(onExpired: () => void) {
    this.onSessionExpired = onExpired;
    this.startMonitoring();
  }

  /**
   * Start monitoring session expiry
   */
  private static startMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.checkSessionExpiry();
    }, this.CHECK_INTERVAL);
  }

  /**
   * Stop monitoring session expiry
   */
  static stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check if the session has expired based on local timestamp
   */
  private static checkSessionExpiry() {
    const sessionId = localStorage.getItem(this.SESSION_KEY);
    const loginTime = localStorage.getItem('login_time');

    if (!sessionId || !loginTime) {
      return;
    }

    const loginTimestamp = parseInt(loginTime);
    const currentTime = Date.now();
    const timeSinceLogin = currentTime - loginTimestamp;

    if (timeSinceLogin >= this.SESSION_TIMEOUT) {
      console.log('Session expired due to timeout');
      this.handleSessionExpired();
    }
  }

  /**
   * Handle session expiry
   */
  private static handleSessionExpired() {
    this.clearSession();
    if (this.onSessionExpired) {
      this.onSessionExpired();
    }
  }

  /**
   * Make an authenticated API call with automatic session expiry handling
   */
  static async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const sessionId = localStorage.getItem(this.SESSION_KEY);
    
    if (!sessionId) {
      throw new Error('No session found');
    }

    // Add session ID to the request
    const urlWithSession = url.includes('?') 
      ? `${url}&session_id=${sessionId}` 
      : `${url}?session_id=${sessionId}`;

    try {
      const response = await fetch(urlWithSession, options);

      // Check if the session has expired
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.detail?.includes('expired') || errorData.detail?.includes('Invalid session')) {
          console.log('Session expired detected from API response');
          this.handleSessionExpired();
          throw new Error('Session expired, please login again');
        }
      }

      return response;
    } catch (error) {
      // Network errors or other issues
      throw error;
    }
  }

  /**
   * Store session data
   */
  static setSession(sessionId: string) {
    localStorage.setItem(this.SESSION_KEY, sessionId);
    localStorage.setItem('login_time', Date.now().toString());
  }

  /**
   * Clear session data
   */
  static clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem('login_time');
    this.stopMonitoring();
  }

  /**
   * Get current session ID
   */
  static getSessionId(): string | null {
    return localStorage.getItem(this.SESSION_KEY);
  }

  /**
   * Check if user is logged in
   */
  static isLoggedIn(): boolean {
    const sessionId = localStorage.getItem(this.SESSION_KEY);
    const loginTime = localStorage.getItem('login_time');
    
    if (!sessionId || !loginTime) {
      return false;
    }

    const loginTimestamp = parseInt(loginTime);
    const currentTime = Date.now();
    const timeSinceLogin = currentTime - loginTimestamp;

    return timeSinceLogin < this.SESSION_TIMEOUT;
  }

  /**
   * Get remaining session time in milliseconds
   */
  static getRemainingTime(): number {
    const loginTime = localStorage.getItem('login_time');
    
    if (!loginTime) {
      return 0;
    }

    const loginTimestamp = parseInt(loginTime);
    const currentTime = Date.now();
    const timeSinceLogin = currentTime - loginTimestamp;
    const remaining = this.SESSION_TIMEOUT - timeSinceLogin;

    return Math.max(0, remaining);
  }

  /**
   * Format remaining time as a readable string
   */
  static getFormattedRemainingTime(): string {
    const remaining = this.getRemainingTime();
    const minutes = Math.floor(remaining / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
