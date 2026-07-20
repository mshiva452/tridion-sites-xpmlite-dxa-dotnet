import axios from "axios";
import Cookies from 'js-cookie';

const configuration = window.getConfig();

export const refreshAccessToken = async (): Promise<string | null> => {
    const refresh_token =  Cookies.get('refresh_token');

    if(!refresh_token){
        return null
    }
    const data = {
        refresh_token:refresh_token,
        grant_type:"refresh_token",
        client_id:configuration.client_id,
        redirect_uri:configuration.redirect_uri
    }

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    try {
        const response = await axios.post(`${configuration.authorization_baseurl}/token`, data, { headers });

        if (response.status === 200 && response.data?.access_token) {
            const { access_token, refresh_token:newRefreshToken, expires_in } = response.data;

            const now = Date.now();
            const accessTokenExpiryTime = new Date(now + (expires_in * 1000));
            const finalRefreshToken = newRefreshToken || refresh_token;
            const refreshTokenExpiryTime = new Date(now + (expires_in * 1000 * 4));
            
            Cookies.set('access_token', access_token, { expires: accessTokenExpiryTime, secure: true, sameSite: "strict", path:"/" });
            Cookies.set('refresh_token', finalRefreshToken, { expires: refreshTokenExpiryTime, secure: true, sameSite: "strict" });
            return access_token
        }
        return null
    } catch (error) {

        console.error("Failed to refresh access token:", error);
        return null
    }
}