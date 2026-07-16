import { useEffect, useCallback } from 'react';

import { PublicationMappingQuery } from '../graphiqlQuery/publicationMappingQuery';
import { PageQuery } from '../graphiqlQuery/pageQuery';
import { useAppDispatch } from '../store/connect';
import { setPageId } from '../store/page/pageSlice';

import getService from '../Services/getRequest';

const getConfiguration = () => window.getConfig?.() || { contentServiceUrl: '' };

export const usePageId = (pathName: string): void => {
    const dispatch = useAppDispatch()
    const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.href;

    const fetchPageData = useCallback(async (contentServiceUrl: string, pubId: string, pageUrl: string) => {
        const pageQuery = {
            query: PageQuery,
            variables: {
                namespaceId: 1,
                publicationId: pubId,
                url: pageUrl
            }
        }

        try {
            const response = await getService.getContentServiceData(contentServiceUrl, pageQuery);
            if (response?.status === 200 && response.data?.data?.page) {
                const { itemId, itemType } = response.data.data.page;
                const pageTcmId = `tcm_${pubId}-${itemId}-${itemType}`;
                dispatch(setPageId(pageTcmId))
                return true
            }
        } catch (error) {
            console.error(`Error fetching page details: ${pageUrl}`, error);
        }
        return false
    }, [dispatch])

    const getPublicationId = useCallback(async () => {
        const configuration = getConfiguration();
        if (!configuration.contentServiceUrl) return;

        const publicationQuery = {
            query: PublicationMappingQuery,
            variables: {
                "namespaceId": 1,
                "siteUrl": SITE_URL
            }
        }
        try {

            const response = await getService.getContentServiceData(configuration.contentServiceUrl, publicationQuery);

            if (response?.status === 200 && response.data?.data?.publicationMapping?.publicationId) {
                const pubId = response.data.data.publicationMapping.publicationId;

                let cleanedPathName = pathName;

                if (!cleanedPathName.startsWith('/')) {
                    cleanedPathName = '/' + cleanedPathName;
                }

                if (cleanedPathName !== '/' && !cleanedPathName.endsWith('.html')) {
                    cleanedPathName = cleanedPathName.replace(/\/$/, '');
                }

                let targetPageUrl = cleanedPathName.endsWith('.html') ? cleanedPathName : `${cleanedPathName}.html`;
                if (targetPageUrl === '/.html') targetPageUrl = '/index.html';

                const success = await fetchPageData(configuration.contentServiceUrl, pubId, targetPageUrl);

                if (!success) {
                    let fallbackPageUrl;

                    if (cleanedPathName === '/') {
                        fallbackPageUrl = '/index.html';
                    } else if (cleanedPathName.endsWith('.html')) {
                        fallbackPageUrl = cleanedPathName.replace(/\/[^\/]+\.html$/, '/index.html');
                    } else {
                        fallbackPageUrl = `${cleanedPathName}/index.html`;
                    }

                    await fetchPageData(configuration.contentServiceUrl, pubId, fallbackPageUrl);
                }
            }
        } catch (error) {
            console.error('Failed to fetch publication id:', error);
        }

    }, [pathName, SITE_URL, fetchPageData])

    useEffect(() => {
        getPublicationId()
    }, [getPublicationId])
}