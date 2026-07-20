import axios from "axios";
import qs from 'qs';
import Cookies from 'js-cookie';

import { OAuth } from "../model/PageModel";

const configuration = window.getConfig();

export const generateAccessToken = async (authData: OAuth): Promise<any> => {

    const data = qs.stringify(authData);
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    try {
        const response = await axios.post(`${configuration.authorization_baseurl}/token`, data, { headers })
        if (response.status === 200 && response.data) {
            const { access_token, refresh_token, expires_in } = response.data;
            
            const now = Date.now();
            const accessTokenExpiryTime = new Date(now + (expires_in * 1000));
            const refreshTokenExpiryTime = new Date(now + (expires_in * 1000 * 4));

            Cookies.set('access_token', access_token, { expires: accessTokenExpiryTime, secure: true, sameSite: "strict", path: "/" });
            if(refresh_token){
                Cookies.set('refresh_token', refresh_token, { expires: refreshTokenExpiryTime, secure: true, sameSite: "strict" });
            }
            return response.data
        }
        throw new Error("Invalid token");
    } catch (error) {
        console.error("Token generation failed:", error);
        return error
    }
}