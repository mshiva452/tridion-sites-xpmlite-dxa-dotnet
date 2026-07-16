// apiClient.ts
import { AuthService } from "./auth";

export class ApiClient {
    private auth: AuthService;
    private config: any;
    private headers: Record<string, string>;
    private binaryCache = new Map<string, string>();
    constructor(authInstance: AuthService) {
        this.auth = authInstance;
        // Fetch global config safely
        this.config = typeof getConfig === "function" ? getConfig() : {};
        this.headers = {
            "Content-Type": "application/json",
            "accept": "application/json",
        };
    }

    private authHeader(options: RequestInit, token: string | null): void {
        options.credentials = "include";
        if (token) {
            options.headers = {
                ...options.headers,
                "Authorization": `Bearer ${token}`
            };
        }
    }

    private async getAccessToken(): Promise<string | null> {
        const cookies = document.cookie;
        if (!cookies) {
            console.warn("Failed to authorize.");
            return null;
        }

        if (cookies.includes("access_token")) {
            return typeof this.auth.getCookie === "function" ? this.auth.getCookie("access_token") : null;
        } else if (cookies.includes("refresh_token")) {
            const refreshToken = typeof this.auth.getCookie === "function" ? this.auth.getCookie("refresh_token") : null;
            if (!refreshToken) return null;
            const response = await this.getTokenFrmRefreshToken(refreshToken);
            return response ? response.access_token : null;
        } else {
            window.location.reload();
            return null
        }
    }

    private async getTokenFrmRefreshToken(refreshToken: string): Promise<any> {
        if (!refreshToken) return null;
        const clientId = typeof getConfig === "function" ? getConfig() : {};

        const params = new URLSearchParams({
            refresh_token: refreshToken,
            grant_type: "refresh_token",
            client_id: clientId.client_id,
            redirect_uri: window.location.origin
        });

        const options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "accept": "application/json",
            },
            body: params
        };

        try {
            const response = await fetch(`${this.config.authorization_baseurl}/token`, options);
            const data = await response.json();

            const currentTime = new Date();
            const accessTokenExpiryTime = new Date(currentTime.getTime() + (data.expires_in / 60) * 60000);
            const refreshTokenExpiryTime = new Date(currentTime.getTime() + 1000 * data.expires_in);

            document.cookie = `access_token=${data.access_token}; expires=${accessTokenExpiryTime.toUTCString()}; path=/`;
            document.cookie = `refresh_token=${data.refresh_token}; expires=${refreshTokenExpiryTime.toUTCString()}; path=/`;
            return data;
        } catch (error) {
            console.error("Failed to refresh access token:", error);
            return null;
        }
    }

    async sendRequest(url: string, options: RequestInit = {}, responseType: 'json' | 'blob' = 'json'): Promise<any> {
        const token = await this.getAccessToken();
        const requestOptions: RequestInit = {
            ...options,
            headers: { ...this.headers, ...options.headers }
        };
        this.authHeader(requestOptions, token);

        try {
            const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
            const targetUrl = isAbsoluteUrl ? url : (this.config.openapi_baseurl + url);
            const response = await fetch(targetUrl, requestOptions);
            if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);

            if (responseType === 'blob') {
                return await response.blob();
            }

            return await response.json();
        } catch (error) {
            console.error(`Transaction failure targeting endpoint [${url}]:`, error);
            throw error;
        }
    }

    async getRequest(url: string): Promise<any> {
        return this.sendRequest(url, { method: 'GET' });
    }

    async getBinaryContent(absoluteUrl: string): Promise<string> {
        if (!absoluteUrl) return "";

        if (this.binaryCache.has(absoluteUrl)) {
            return this.binaryCache.get(absoluteUrl)!;
        }

        try {
            const imageBlob: Blob = await this.sendRequest(absoluteUrl, { method: 'GET', headers: { "accept": "image/*" } },
                'blob'
            );
            const objectUrl = URL.createObjectURL(imageBlob);
            this.binaryCache.set(absoluteUrl, objectUrl);
            return objectUrl
        } catch (error) {
            console.error(`Failed to download protected binary asset:`, error);
            return "";
        }
    }
    clearBinaryCache(): void {
        this.binaryCache.forEach((objectUrl) => {
            URL.revokeObjectURL(objectUrl);
        });
        this.binaryCache.clear();
    }

    async postService(url: string, data: any): Promise<any> {
        return this.sendRequest(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async putService(url: string, data: any): Promise<any> {
        return this.sendRequest(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
}