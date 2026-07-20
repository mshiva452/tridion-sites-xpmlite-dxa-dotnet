import { useCallback, useEffect } from 'react';
import { Modal } from 'antd';

import { useAppDispatch, useAppSelector } from '../../store/connect';
import { togglePageBuilder } from '../../store/page/pageSlice';
import { setStructureIds } from '../../store/pageBuilder/pageBuilderSlice';
import { fetchPageTypes } from '../../store/pageBuilder/pageBuilderActions';

import getService from '../../Services/getRequest';
import formatTcmId from '../../utils/formatTcmId';
import CreatePage from './CreatePage';

const PageBuilder = () => {
    const dispatch = useAppDispatch();

    const { structureGroupIds } = useAppSelector(state => state.pageBuilderReducer);
    const { showPageBuilder, pageId } = useAppSelector(state => state.pageReducer);

    const getStructureGroupItems = useCallback(async (): Promise<void> => {
        if (!pageId || (structureGroupIds?.home && structureGroupIds?.pageTypes)) return;

        try {
            const uriBody = pageId.split('_')?.[1];
            if (!uriBody) return;

            const publicationId = uriBody?.split("-")?.[0];
            const namespaceId = 1;

            const targetRootId = `tcm_0-${publicationId}-${namespaceId}`;
            const homeResponse = await getService.getFolderItems(targetRootId);

            if (homeResponse?.status === 200 && Array.isArray(homeResponse.data)) {
                const homeItem = homeResponse.data.find(
                    (item: any) => item.$type === 'StructureGroup' && item.Title?.toLowerCase() === 'home'
                );

                if (homeItem?.Id) {
                    const homeTcmId = formatTcmId(homeItem.Id);
                    const pageTypesResponse = await getService.getFolderItems(homeTcmId);

                    if (pageTypesResponse?.status === 200 && Array.isArray(pageTypesResponse.data)) {
                        const pageTypeItem = pageTypesResponse.data.find(
                            (item: any) => item.$type === 'StructureGroup' && item.Title?.toLowerCase() === '_page types'
                        );

                        if (pageTypeItem?.Id) {
                            const pageTcmId = formatTcmId(pageTypeItem.Id);

                            dispatch(fetchPageTypes(pageTcmId));
                            dispatch(
                                setStructureIds({
                                    ...structureGroupIds,
                                    home: homeItem.Id,
                                    pageTypes: pageTcmId
                                })
                            );
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch Page Types:', error);
        }
    }, [pageId, structureGroupIds, dispatch]);

    useEffect(() => {
        if (pageId) {
            getStructureGroupItems();
        }
    }, [pageId, getStructureGroupItems]);

    const handleModalToggle = (): void => {
        dispatch(togglePageBuilder(!showPageBuilder));
    };

    return (
        <Modal
            title="Start with a template"
            width={"80%"}
            open={showPageBuilder}
            onOk={handleModalToggle}
            onCancel={handleModalToggle}
            destroyOnHidden
            maskClosable={false}
            centered
            footer={<></>}
        >
            <CreatePage />
        </Modal>
    );
};

export default PageBuilder;