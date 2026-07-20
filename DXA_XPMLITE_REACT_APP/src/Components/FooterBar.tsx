import React, { useState, useEffect } from 'react';
import { Button, Flex } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';

import { useAppDispatch, useAppSelector } from '../store/connect';
import { togglePageBuilder, togglePageInfo } from '../store/page/pageSlice';
import Publish from './Publish/Index';
import OAuth from './OAuth';

const configuration = window.getConfig?.() || {
    experience_space_url: '',
};

const flexContainerStyle: React.CSSProperties = {
    marginLeft: '20px',
    color: '#fff',
};

const authFlexContainerStyle: React.CSSProperties = {
    position: 'relative',
    marginRight: 10,
};

const whiteIconStyle: React.CSSProperties = {
    fontSize: 18,
    color: '#fff',
};

const pageInfoButtonStyle: React.CSSProperties = {
    background: 'transparent',
    color: '#fff',
};

const FooterBar: React.FC = () => {
    const dispatch = useAppDispatch()
    const { showPageBuilder, showPageInfo, pageId } = useAppSelector(state => state.pageReducer)

    const [authorization, setAuthorization] = useState<boolean>(false);

    useEffect(() => {
        const accessToken = Cookies.get('access_token');
        setAuthorization(!!accessToken);
    }, [])

    const updateAuthorization = (isAuthorized: boolean): void => {
        setAuthorization(isAuthorized)
    }
    const handleTogglePageBuilder = (): void => {
        dispatch(togglePageBuilder(!showPageBuilder))
    }
    const handleTogglePageInfo = (): void => {
        dispatch(togglePageInfo(!showPageInfo))
    }

    const handleRefresh = (): void => {
        window.location.reload()
    }

    const handleNavigateToExperienceSpace = (): void => {
        if (!pageId) return;
        const formattedTcmUri = pageId.split('_').join(':');
        const targetExperienceUrl = `${configuration.experience_space_url}/page?item=${formattedTcmUri}`;

        window.open(targetExperienceUrl, '_blank');
    }
    return (
        <Flex align='center' justify='flex-start' style={flexContainerStyle}>
            {
                authorization &&
                <Flex align='center' className="auth_status" style={authFlexContainerStyle}>
                    <Button variant='outlined' color='danger' style={pageInfoButtonStyle} className="pageinfo" onClick={handleTogglePageInfo} title='Page Info'>Page Info</Button>
                    <Publish />
                    <Button className="createPage" onClick={handleTogglePageBuilder} title='Create Page'>Create Page</Button>
                    <Button className="exp-space" icon={<LinkOutlined style={whiteIconStyle} className='treeViewIcon' />} onClick={handleNavigateToExperienceSpace} title='Experience Space'></Button>
                    <Button
                        className="refresh"
                        onClick={handleRefresh}
                        icon={
                            <svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" className="treeViewIcon">
                                <path d="M15.613 0h-.323a.387.387 0 00-.387.387v3.569A8 8 0 00.01 7.596C0 7.817.177 8 .397 8H.72c.205 0 .376-.16.386-.364a6.903 6.903 0 0113.032-2.797h-3.686a.387.387 0 00-.387.387v.322c0 .214.173.387.387.387h5.16A.387.387 0 0016 5.548V.388A.387.387 0 0015.613 0zm-.01 8h-.323a.386.386 0 00-.386.364A6.902 6.902 0 018 14.904a6.907 6.907 0 01-6.139-3.743h3.687a.387.387 0 00.387-.387v-.322a.387.387 0 00-.387-.387H.388a.387.387 0 00-.388.387v5.16c0 .215.173.388.387.388H.71a.387.387 0 00.387-.387v-3.569a8 8 0 0014.893-3.64.386.386 0 00-.387-.404z"></path>
                            </svg>
                        }
                        title='Refresh'
                    >
                    </Button>
                </Flex>
            }
            <OAuth authorization={authorization} updateAuthorization={updateAuthorization} />
        </Flex>
    )
}

export default FooterBar
