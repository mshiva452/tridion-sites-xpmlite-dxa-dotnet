declare global {
  function getConfig(): any;
}

export class AuthService {
  private siteUrl: string;
  private config: any;
  private clientId: string;
  private scope: string;
  private headers: Record<string, string>;
  private _oauthWindow: Window | null;
  private _oauthInterval: number | null;

  constructor() {
    this.siteUrl = window.location.origin;
    this.config = typeof getConfig === "function" ? getConfig() : {}

    this.clientId = this.config.client_id || "";
    this.scope = "openid profile role forwarded offline_access";

    this.headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "accept": "application/json"
    };

    this._oauthWindow = null;
    this._oauthInterval = null;
  }

  getCookie(cookieName: string): string | null {
    const cookies: Record<string, string> = {};
    const cookiePairs = document.cookie.split(";");

    cookiePairs.forEach(item => {
      const splitIndex = item.indexOf("=");
      if (splitIndex === -1) return;

      const key = item.substring(0, splitIndex).trim();
      const value = item.substring(splitIndex + 1);
      cookies[key] = value;
    });

    return cookies[cookieName] || null;
  }

  logout() {
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  private saveTokens(tokenData: { access_token: string; refresh_token: string; expires_in: number }): void {
    const currentTime = new Date();
    const expiresIn = tokenData.expires_in;

    const accessExpiry = new Date(currentTime.getTime());
    accessExpiry.setMinutes(accessExpiry.getMinutes() + expiresIn / 60);

    const refreshExpiry = new Date(currentTime.getTime() + (1000 * expiresIn));

    document.cookie = `access_token=${tokenData.access_token}; expires=${accessExpiry.toUTCString()}; Secure; SameSite=Strict; path=/; domain=${window.location.origin}`;
    document.cookie = `refresh_token=${tokenData.refresh_token}; expires=${refreshExpiry.toUTCString()}; path=/`;

    window.setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  private async fetchTokenExchange(bodyParams: Record<string, string>): Promise<void> {
    const options = {
      method: "POST",
      headers: this.headers,
      body: new URLSearchParams(bodyParams)
    };

    try {
      const response = await fetch(`${this.config.authorization_baseurl}/token`, options);
      if (!response.ok) throw new Error(`Token transaction failed with status: ${response.status}`);

      const data = await response.json();
      this.saveTokens(data);
    } catch (error) {
      console.error("Critical error handling token:", error);
    }
  }

  private async getTokenFrmRefreshToken(refreshToken: string): Promise<void> {
    if (!refreshToken) return;

    const data = {
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      client_id: this.clientId,
      redirect_uri: this.siteUrl
    };

    await this.fetchTokenExchange(data);
  }

  async login() {
    const loginStatusEl = document.querySelector(".loginStatus");
    const loginText = loginStatusEl ? loginStatusEl.textContent.trim() : "";

    if (loginText === "Logout") {
      this.logout();
      window.location.reload();
      return;
    }

    const hasAccessToken = document.cookie.includes("access_token");
    const hasRefreshToken = document.cookie.includes("refresh_token");

    if (!hasAccessToken && hasRefreshToken) {
      const refreshToken = this.getCookie("refresh_token");
      if (refreshToken) {
        await this.getTokenFrmRefreshToken(refreshToken);
        return;
      }
    }

    const authPath = `${this.config.authorization_baseurl}/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${encodeURIComponent(this.siteUrl)}&scope=${encodeURIComponent(this.scope)}`;

    this.authorize({
      path: authPath,
      callback: async (authWindow: Window) => {
        try {
          const urlParams = new URLSearchParams(authWindow.location.search);
          const authorizationCode = urlParams.get('code');
          if (!authorizationCode) return;

          const data = {
            code: authorizationCode,
            grant_type: "authorization_code",
            client_id: this.clientId,
            redirect_uri: this.siteUrl
          };

          await this.fetchTokenExchange(data);
        } catch (err) {
          console.error("Failed to authorize:", err);
        }
      }
    });
  }
  authorize(options: { path: string; windowName?: string; windowOptions?: string; callback?: (win: Window) => void }): void {
    const windowName = options.windowName || 'ConnectWithOAuth';
    const windowOptions = options.windowOptions || 'location=0,status=0,width=800,height=400';
    const fallbackCallback = () => {
      window.setTimeout(() => { window.location.reload(); }, 2000);
    };
    const callback = options.callback || fallbackCallback;

    this._oauthWindow = window.open(options.path, windowName, windowOptions);

    if (this._oauthInterval) clearInterval(this._oauthInterval);

    this._oauthInterval = window.setInterval(() => {
      let isSameOrigin = false;

      try {
        if (this._oauthWindow && this._oauthWindow.location && this._oauthWindow.location.href) {
          isSameOrigin = true;
        }
      } catch (crossOriginSecurityException) {
        isSameOrigin = false;
      }

      if (isSameOrigin && this._oauthWindow?.location.href.includes(this.siteUrl) && this._oauthInterval) {
        clearInterval(this._oauthInterval);
        callback(this._oauthWindow);
        this._oauthWindow.close();
        return;
      }

      if ((!this._oauthWindow || this._oauthWindow.closed) && this._oauthInterval) {
        clearInterval(this._oauthInterval);
      }
    }, 1000);
  }
}