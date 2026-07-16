import axios from "axios";
import Cookies from 'js-cookie';

import { refreshAccessToken } from "./refreshAccessToken";

const configuration = window.getConfig();

const axiosClient = axios.create({
    baseURL: configuration.openapi_baseurl,
    headers: {
        "Content-type": "application/json"
    }
});

axiosClient.interceptors.request.use((config) => {
    const ACCESS_TOKEN = Cookies.get('access_token');
    if (ACCESS_TOKEN) {
        config.headers["Authorization"] = `Bearer ${ACCESS_TOKEN}`;
    }
    return config

}, (error) => Promise.reject(error))

let refreshPromise: Promise<string | null> | null = null;

axiosClient.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = Cookies.get("refresh_token");

        if (refreshToken) {
            try {
                if (!refreshPromise) {
                    refreshPromise = refreshAccessToken().finally(() => {
                        refreshPromise = null;
                    })
                }
                const access_token = await refreshPromise;
                if (access_token) {
                    originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
                    return axiosClient(originalRequest);
                }
            } catch (refreshError) {
                return Promise.reject(originalRequest)
            }
        }

        const alreadyTriedReload = sessionStorage.getItem('auth_reload_attempt');
        if (!alreadyTriedReload) {
            sessionStorage.setItem('auth_reload_attempt', 'true');
            window.location.reload();
            return new Promise(() => { 
                
            });
        } else {
            sessionStorage.removeItem('auth_reload_attempt');
            console.error("Session expired. User is unauthenticated.");
        }
    }
    return Promise.reject(error)
})

export default axiosClient;