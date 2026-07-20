import { useState } from 'react';
import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import OAuth2Login from 'react-simple-oauth2-login';
import Cookies from 'js-cookie';

import { generateAccessToken } from '../oauth/generateAccessToken';

interface IAuthProps {
    authorization: boolean,
    updateAuthorization: (isAuthorized: boolean) => void;
}

const configuration = window.getConfig?.() || {
    client_id: '',
    redirect_uri: '',
    authorization_baseurl: '',
};


const logoutIconStyle: React.CSSProperties = {
    fontSize: 15,
    transform: 'rotate(270deg)',
    color: '#fff',
};

//const configuration = window.getConfig();
const OAuth: React.FC<IAuthProps> = ({ authorization, updateAuthorization }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleLogout = () => {
        Cookies.remove('access_token')
        updateAuthorization(false)
        window.location.reload();
    }
    const handleSuccess = async (response: Record<string, any>): Promise<void> => {
        const authorizationCode = response.code;
        const authData = {
            code: authorizationCode,
            client_id: configuration.client_id,
            grant_type: "authorization_code",
            redirect_uri: configuration.redirect_uri
        };

        try {
            setIsLoading(true);
            const tokenResponse = await generateAccessToken(authData);
            if (tokenResponse?.access_token) {
                updateAuthorization(true);
                window.location.reload();
            } else {
                console.error('Failed to obtain access token.');
            }
        } catch (error) {
            console.error('Failed to generate token:', error);
        } finally {
            setIsLoading(false);
        }
    }
    const handleFailure = (error: unknown): void => {
        console.error('OAuth Login Failure:', error);
    }

    return (
        authorization ?
            <Button
                className="loginStatus"
                onClick={handleLogout}
                icon={<LogoutOutlined style={logoutIconStyle} className='treeViewIcon' />}
                variant='outlined'
            />
            :
            <OAuth2Login
                authorizationUrl={`${configuration.authorization_baseurl}/authorize`}
                responseType="code"
                clientId={configuration.client_id}
                redirectUri={configuration.redirect_uri}
                scope="openid profile role forwarded offline_access"
                onSuccess={handleSuccess}
                onFailure={handleFailure}
                buttonText={isLoading ? 'Loading...' : 'CM Login'}
                className="login-btn"
            />
    )
}

export default OAuth