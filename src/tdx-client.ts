import { TdxConfig, LoginParams, AdminLoginParams } from "./types.js";

export class TdxClient {
  private config: TdxConfig;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: TdxConfig) {
    this.config = config;
  }

  /**
   * Authenticate with TDX and cache the JWT token.
   * Supports both username/password and BEID/WebServicesKey methods.
   */
  async authenticate(): Promise<void> {
    let url: string;
    let body: LoginParams | AdminLoginParams;

    if (this.config.authMethod === "loginadmin") {
      if (!this.config.beid || !this.config.webServicesKey) {
        throw new Error(
          "TDX_BEID and TDX_WEB_SERVICES_KEY are required for loginadmin auth method"
        );
      }
      url = `${this.config.baseUrl}/api/auth/loginadmin`;
      body = {
        BEID: this.config.beid,
        WebServicesKey: this.config.webServicesKey,
      };
    } else {
      if (!this.config.username || !this.config.password) {
        throw new Error(
          "TDX_USERNAME and TDX_PASSWORD are required for login auth method"
        );
      }
      url = `${this.config.baseUrl}/api/auth/login`;
      body = {
        username: this.config.username,
        password: this.config.password,
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `TDX authentication failed (${response.status}): ${text}`
      );
    }

    // TDX returns the JWT as a plain string (not JSON)
    this.token = await response.text();
    // Tokens expire 24 hours after issuance; refresh at 23 hours
    this.tokenExpiry = new Date(Date.now() + 23 * 60 * 60 * 1000);

    console.error("[tdx-mcp] Authenticated successfully");
  }

  /**
   * Ensure we have a valid token, re-authenticating if needed.
   */
  private async ensureAuth(): Promise<void> {
    if (!this.token || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  /**
   * Make an authenticated request to the TDX API.
   */
  async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    await this.ensureAuth();

    const url = `${this.config.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };

    const options: RequestInit = { method, headers };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`TDX API error (${response.status} ${method} ${path}): ${text}`);
    }

    // Some endpoints return empty responses
    const text = await response.text();
    if (!text) return undefined as T;

    return JSON.parse(text) as T;
  }

  /**
   * Convenience: GET request scoped to the configured app.
   */
  async get<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>("GET", `/api/${this.config.appId}${endpoint}`);
  }

  /**
   * Convenience: POST request scoped to the configured app.
   */
  async post<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", `/api/${this.config.appId}${endpoint}`, body);
  }

  /**
   * Convenience: PUT request scoped to the configured app.
   */
  async put<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", `/api/${this.config.appId}${endpoint}`, body);
  }

  /**
   * Convenience: PATCH request scoped to the configured app.
   */
  async patch<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", `/api/${this.config.appId}${endpoint}`, body);
  }

  /**
   * Convenience: DELETE request scoped to the configured app.
   */
  async delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>("DELETE", `/api/${this.config.appId}${endpoint}`);
  }
}
