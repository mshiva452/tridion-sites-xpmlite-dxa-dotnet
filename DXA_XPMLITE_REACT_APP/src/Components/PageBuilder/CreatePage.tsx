import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Button, ConfigProvider, Flex, Steps, message, theme } from 'antd';

import { useAppDispatch, useAppSelector } from '../../store/connect';
import { togglePageBuilder } from '../../store/page/pageSlice';
import { setLoading, setPageTypeList } from '../../store/pageBuilder/pageBuilderSlice';

import postService from '../../Services/postRequest';
import getService from '../../Services/getRequest';
import PageTemplate from './PageTemplate';
import PageCreationForm from './PageCreationForm';
import PageType from './PageType';
import Loading from '../Loading';
import formatTcmId from '../../utils/formatTcmId';
import PublishContainer from '../Publish/PublishContainer';

interface IPageTypeImages {
    PublicationID: string;
    Path: string;
    PageTitle: string;
}

const antdThemeConfig = {
    components: {
        Button: {
            colorPrimary: '#007373',
            colorPrimaryBg: '#007373',
            colorPrimaryActive: '#007373',
            colorPrimaryHover: '#007373',
            colorPrimaryBorderHover: '#007373',
        },
    },
};

const CreatePage = () => {

    const dispatch = useAppDispatch();
    const { token } = theme.useToken();

    const { showPageBuilder } = useAppSelector(state => state.pageReducer);
    const { pageTypes, structureGroupIds, pageTypeId, formData } = useAppSelector(state => state.pageBuilderReducer)
    const { selectedPublishingTarget, publishToCurrentPublication, selectedChildPublications } = useAppSelector(state => state.publishReducer)

    //const [isLoading, setLoading] = useState<boolean>(false)
    const [showPageCreationLoading, setPageCreationLoading] = useState<boolean>(false)
    const [current, setCurrent] = useState(0);
    const [pageContainerData, setPageContainerData] = useState<any>([])
    const [pageTemplate, setPageTemplate] = useState<any>([])
    const [savedPageData, setSavePageData] = useState<any>([])
    const [isPublishable, setPublishable] = useState<boolean>(false)

    const filterPageTypeImage = useCallback((pageTypeImages: IPageTypeImages[], pageTitle: string, publicationId: string): string | undefined => {
        const filteredData = pageTypeImages.find(item => item.PageTitle === pageTitle && item.PublicationID === publicationId)
        return filteredData?.Path
    }, [])

    const getContainerData = useCallback(async (): Promise<void> => {
        if (!structureGroupIds.home) return;
        try {
            const response = await getService.getPageContainerData(structureGroupIds.home as string)
            setPageContainerData([response.data])
        } catch (error) {
            console.error('Failed to capture Tridion container bounds mapping structures:', error);
        } finally {
            dispatch(setLoading(false))
        }
    }, [structureGroupIds.home, dispatch]);

    useEffect(() => {
        if (!pageTypes || pageTypes.length === 0) return;

        dispatch(setLoading(true))
        const pageTypeImages = window.getPageTypeImages?.() || [];

        const filteredPageTypes = pageTypes.map((item: any) => {
            const uriParts = item.Id?.split(':')?.[1]?.split('-');
            const publicationId = uriParts?.[0] || '';
            return {
                title: item.Title,
                itemId: item.Id,
                Image: filterPageTypeImage(pageTypeImages, item.Title, publicationId) || ""
            }
        })
        dispatch(setPageTypeList(filteredPageTypes))
        if (structureGroupIds.home !== null) {
             dispatch(setLoading(true))
            getContainerData()
        } else {
            dispatch(setLoading(false))
        }

    }, [pageTypes, structureGroupIds.home, filterPageTypeImage, getContainerData, dispatch])

    const cloneComponents = async (componentId: string, locationInfo: string, componentTitle: string) => {
        const cloneUrl = `${componentId}/copy/${locationInfo}?makeUnique=true`;
        const pageName = formData.pagename ?? "New Page";
        return await postService.cloneComponent(cloneUrl, pageName, componentTitle);
    }

    const copyComponents = async (response: any): Promise<any[]> => {
        if (!response?.data?.Regions) return [];

        return await Promise.all(response.data.Regions.map(async (region: any) => {
            if (region.ComponentPresentations) {
                region.ComponentPresentations = await Promise.all(
                    region.ComponentPresentations.map(async (presentation: any) => {
                        const cleanTcmId = formatTcmId(presentation.Component.IdRef);
                        const componentResponse = await getService.getItems(cleanTcmId);
                        if (componentResponse?.status === 200 && componentResponse.data) {
                            const locationInfo = formatTcmId(componentResponse.data.LocationInfo?.OrganizationalItem?.IdRef || '');
                            const copyResponse = await cloneComponents(cleanTcmId, locationInfo, componentResponse.data.Title);

                            if (copyResponse?.status === 200 && copyResponse.data) {
                                return {
                                    ...presentation,
                                    Component: {
                                        ...presentation.Component,
                                        IdRef: copyResponse.data.Id,
                                        Title: copyResponse.data.Title,
                                    },
                                };
                            }
                        }
                        return presentation
                    })
                );
            }
            return region;
        }))
    }

    const loadPageTemplate = async (tcmId: string): Promise<void> => {
        setPageCreationLoading(true)
        try {
            const response = await getService.getItems(tcmId);
            if (response?.data) {
                const updatedRegions = await copyComponents(response)
                const instantiatedTemplate = { ...response.data, Regions: updatedRegions };
                setPageTemplate([instantiatedTemplate]);
            }
        } catch (error) {
            console.error('Failed processing underlying nested Component copies:', error);
        }
        finally {
            setPageCreationLoading(false);
        }
    }

    const createPageByPageTypes = async (): Promise<void> => {
        if (pageTemplate.length === 0 || pageContainerData.length === 0) return;
        dispatch(setLoading(true))

        const templateCopy = JSON.parse(JSON.stringify(pageTemplate[0]));
        templateCopy.Id = 'tcm:0-0-0';
        templateCopy.FileName = formData.filename;
        templateCopy.Title = formData.pagename;
        templateCopy.LocationInfo = pageContainerData[0].LocationInfo;

        try {
            const response = await postService.savePage(templateCopy)
            if (response?.data) {
                setSavePageData([response.data])
            }
        } catch (error) {
            console.error('Failed updating system Page layouts across remote content core nodes:', error);
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleNextStep = async (): Promise<void> => {
        // console.log(current)       
        if (current === 1 && !formData.filename) {
            message.warning('Please enter valid pagename and filename')
            return;
        }
        if (current === 1 && pageTypeId && formData.filename) {
            const formattedTcmId = formatTcmId(pageTypeId);
            await loadPageTemplate(formattedTcmId);
        }
        if (current === 2) {
            await createPageByPageTypes();
        }
        setCurrent((prev) => prev + 1);
    };

    const handlePrevStep = (): void => {
        setCurrent((prev) => prev - 1);
    };

    const handlePageCreationDone = (): void => {
        dispatch(togglePageBuilder(!showPageBuilder))
    }

    const steps = useMemo(() => [
        {
            title: 'Select Page Type',
            content: <PageType />,
        },
        {
            title: "Page Details",
            content: <PageCreationForm pageTemplate={pageTemplate} getPageTemplate={loadPageTemplate} />
        },
        {
            title: 'Create Page',
            content: <PageTemplate pageTemplate={pageTemplate} />
        },
        {
            title: "Publish",
            content: <PublishContainer isPublishable={isPublishable} pageIdToPublish={savedPageData[0]?.Id} />
        }
    ], [pageTemplate, isPublishable, savedPageData]);

    const stepItems = useMemo(() => steps.map((s) => ({ key: s.title, title: s.title })), [steps]);

    const contentStyle = useMemo((): React.CSSProperties => ({
        textAlign: 'center',
        color: token.colorTextTertiary,
        backgroundColor: token.colorFillAlter,
        borderRadius: token.borderRadiusLG,
        border: `1px dashed ${token.colorBorder}`,
        marginTop: 16,
    }), [token]);

    const isPublishDisabled = selectedPublishingTarget.length === 0 || (!publishToCurrentPublication && selectedChildPublications.length === 0);

    return (
        <ConfigProvider theme={antdThemeConfig}>
            {
                showPageCreationLoading ? <Loading /> :
                    <>
                        <Steps current={current} items={stepItems} />
                        <div style={contentStyle}>
                            {steps[current].content}
                        </div>
                        <Flex justify='flex-end' align='flex-end' gap={5} style={{ marginTop: 10, marginBottom: 50 }}>
                            {current < steps.length - 1 && (
                                <Button type="primary" onClick={handleNextStep} disabled={pageTypeId === null}>
                                    Next
                                </Button>
                            )}
                            {
                                current === steps.length - 1 && (
                                    <Button
                                        onClick={() => setPublishable(true)}
                                        type='primary'
                                        disabled={isPublishDisabled}
                                    >
                                        Publish
                                    </Button>
                                )
                            }
                            {current > 0 && (
                                <Button onClick={handlePrevStep}>
                                    Previous
                                </Button>
                            )}
                            {current === steps.length - 2 && (
                                <Flex gap={5}>
                                    <Button onClick={handlePageCreationDone}>
                                        Cancel
                                    </Button>
                                </Flex>
                            )}
                        </Flex>
                    </>
            }
        </ConfigProvider>
    )
}

export default CreatePage;