import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Alert, Button, ConfigProvider, Flex, Steps, theme } from 'antd';

import { useAppDispatch, useAppSelector } from '../../store/connect';
import { togglePageBuilder } from '../../store/page/pageSlice';
import { setErrorMessage, setLoading, setPageTypeList } from '../../store/pageBuilder/pageBuilderSlice';

import postService from '../../Services/postRequest';
import getService from '../../Services/getRequest';
import PageTemplate, { TridionItemPayload } from './PageTemplate';
import PageCreationForm from './PageCreationForm';
import PageType from './PageType';
import formatTcmId from '../../utils/formatTcmId';
import PublishContainer from '../Publish/PublishContainer';
import axios from 'axios';
import { ComponentPresentation } from '../../model/PageInfoModel';

interface IPageTypeImages {
    PublicationID: string;
    Path: string;
    PageTitle: string;
}

interface PageTemplate {
    Id: string;
    Title: string;
    Regions: Region[];
}

interface Region {
    ComponentPresentations?: ComponentPresentation[];
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
    const { pageTypes, structureGroupIds, pageTypeId, formData, errorMessage, isLoading } = useAppSelector(state => state.pageBuilderReducer)
    const { selectedPublishingTarget, publishToCurrentPublication, selectedChildPublications, isLoading:publishLoading } = useAppSelector(state => state.publishReducer)

    const [isCreatingPage, setIsCreatingPage] = useState<boolean>(false)
    const [current, setCurrent] = useState(0);
    const [pageContainer, setPageContainer] = useState<any | null>(null)
    const [pageTemplate, setPageTemplate] = useState<PageTemplate | null>(null)
    const [savedPage, setSavePage] = useState<any | null>(null)
    const [isPublishable, setPublishable] = useState<boolean>(false)

    const filterPageTypeImage = useCallback((pageTypeImages: IPageTypeImages[], pageTitle: string, publicationId: string): string | undefined => {
        const filteredData = pageTypeImages.find(item => item.PageTitle === pageTitle && item.PublicationID === publicationId)
        return filteredData?.Path
    }, [])

    const getContainerData = useCallback(async (): Promise<void> => {
        if (!structureGroupIds.home) return;
        try {
            const response = await getService.getPageContainerData(structureGroupIds.home as string)
            setPageContainer(response.data)
        } catch (error) {
            console.error('Failed to get Container Data:', error);
        } finally {
            dispatch(setLoading(false))
        }
    }, [structureGroupIds.home, dispatch]);

    useEffect(() => {

        if (!pageTypes || pageTypes.length === 0) return;

        dispatch(setLoading(true))
        dispatch(setErrorMessage(null))
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
            getContainerData()
        } else {
            dispatch(setLoading(false))

        }

    }, [pageTypes, structureGroupIds.home, filterPageTypeImage, getContainerData, dispatch])

    const cloneComponents = useCallback(async (componentId: string, locationInfo: string, componentTitle: string) => {
        const cloneUrl = `${componentId}/copy/${locationInfo}?makeUnique=true`;
        const pageName = formData.pagename || "New Page";
        return await postService.cloneComponent(cloneUrl, pageName, componentTitle);
    }, [formData.pagename])

    const cloneRegionComponents = useCallback(async (response: any): Promise<Region[]> => {
        if (!response?.data?.Regions) return [];

        return Promise.all(response.data.Regions.map(async (region: any) => {
            if (!region.ComponentPresentations) {
                return region
            }

            const ComponentPresentations = await Promise.all(
                region.ComponentPresentations.map(async (presentation: any) => {
                    const cleanTcmId = formatTcmId(presentation.Component.IdRef);
                    const componentResponse = await getService.getItems(cleanTcmId);
                    if (componentResponse?.status !== 200 || !componentResponse.data) {
                        return presentation
                    }

                    const locationInfo = formatTcmId(componentResponse.data.LocationInfo?.OrganizationalItem?.IdRef);
                    //Clone Component
                    const copyResponse = await cloneComponents(cleanTcmId, locationInfo, componentResponse.data.Title);
                    if (copyResponse?.status !== 200 || !copyResponse.data) {
                        return presentation;
                    }
                    /// Promote component to OwningRepository
                    try {
                        await postService.postRequest(`${formatTcmId(copyResponse?.data.Id)}/promote`, {
                            DestinationRepositoryId: componentResponse.data.BluePrintInfo.OwningRepository.IdRef,
                            Instruction: {
                                Mode: "FailOnError",
                                Recursive: true
                            }
                        })
                    } catch (error) {
                        console.error("Failed to promote component", error);
                        return presentation;
                    }


                    return {
                        ...presentation,
                        Component: {
                            ...presentation.Component,
                            IdRef: copyResponse.data.Id,
                            Title: copyResponse.data.Title,
                        },
                    };

                })
            )
            return {
                ...region,
                ComponentPresentations: ComponentPresentations
            }
        }))
    },[cloneComponents])

    const loadPageTemplate = useCallback(async (tcmId: string): Promise<void> => {
        setIsCreatingPage(true)
        try {
            const response = await getService.getItems(tcmId);
            if (response?.data) {
                const updatedRegions = await cloneRegionComponents(response)
                const instantiatedTemplate = { ...response.data, Regions: updatedRegions };
                setPageTemplate(instantiatedTemplate);
            }
        } catch (error) {
            console.error('Failed To fetch page templates:', error);
            if (axios.isAxiosError(error)) {
                dispatch(setErrorMessage(error.response?.data?.message));
            }
        }
        finally {
            setIsCreatingPage(false);
        }
    }, [dispatch, cloneRegionComponents])

    const createPageByPageTypes = async (): Promise<void> => {
        if (!pageTemplate || !pageContainer) return;
        dispatch(setLoading(true))

        const templateCopy = JSON.parse(JSON.stringify(pageTemplate));
        templateCopy.Id = 'tcm:0-0-0';
        templateCopy.FileName = formData.filename;
        templateCopy.Title = formData.pagename;
        templateCopy.LocationInfo = pageContainer.LocationInfo;

        try {
            const response = await postService.savePage(templateCopy)
            if (response?.data) {
                setSavePage(response.data)
            }
        } catch (error) {
            dispatch(setErrorMessage("Failed to Create the Page"))
            console.error('Failed to Create the Page:', error);
            handlePrevStep()
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleNextStep = async (): Promise<void> => {
        // console.log(current)       
        if (current === 1 && !formData.filename) {
            //message.warning('Please enter valid pagename and filename')
            dispatch(setErrorMessage("Please enter valid Title and File Name"))
            return;
        }
        if (current === 1 && pageTypeId && formData.filename) {
            dispatch(setErrorMessage(null))
            const formattedTcmId = formatTcmId(pageTypeId);
            await loadPageTemplate(formattedTcmId);
        }
        if (current === 2) {
            dispatch(setErrorMessage(null))
            await createPageByPageTypes();

        }
        setCurrent((prev) => prev + 1);
        dispatch(setErrorMessage(null))
    };

    const handlePrevStep = (): void => {
        setCurrent((prev) => Math.max(prev - 1, 0));
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
            content: <PageTemplate pageTemplate={[pageTemplate] as TridionItemPayload[]} />
        },
        {
            title: "Publish",
            content: <PublishContainer isPublishable={isPublishable} pageIdToPublish={savedPage?.Id} />
        }
    ], [pageTemplate, isPublishable, savedPage]);

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
    const showLoading = isCreatingPage || isLoading;
    return (
        <ConfigProvider theme={antdThemeConfig}>
            {
                <>
                    <Steps current={current} items={stepItems} />
                    <div style={contentStyle}>
                        {steps[current].content}
                    </div>
                    {errorMessage !== null && <Alert message={errorMessage} type="error" />}
                    <Flex justify='flex-end' align='flex-end' gap={5} style={{ marginTop: 10, marginBottom: 50 }}>
                        {current > 0 && (
                            <Button onClick={handlePrevStep}>
                                Previous
                            </Button>
                        )}
                        {current < steps.length - 1 && (
                            <Button loading={showLoading} type="primary" onClick={handleNextStep} disabled={pageTypeId === null}>
                                Next
                            </Button>
                        )}
                        {
                            current === steps.length - 1 && (
                                <Button
                                    onClick={() => setPublishable(true)}
                                    type='primary'
                                    disabled={isPublishDisabled}
                                    loading={publishLoading}
                                >
                                    Publish
                                </Button>
                            )
                        }
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