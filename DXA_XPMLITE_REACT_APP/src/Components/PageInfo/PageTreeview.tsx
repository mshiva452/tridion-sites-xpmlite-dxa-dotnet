import { Alert, ConfigProvider, Flex, Space, Spin, Tree } from "antd";
import { useEffect, useCallback } from "react";
import { LoadingOutlined } from "@ant-design/icons";

import { ShowElipsis } from "../ShowElipsis";
import { useAppDispatch, useAppSelector } from "../../store/connect";
import { setComponentPresentation, setExpandKeys, setSelectedKeys, updatePageInfodata } from "../../store/pageInfo/pageInfoSlice";
import { DataNode, SelectedKeys } from "../../model/PageModel";

import getService from "../../Services/getRequest";
import FolderTreeview from "./FolderTreeview";
import PageInfoActionButtons from "./PageInfoActionButtons";
import formatTcmId from "../../utils/formatTcmId";
import { PageInfo } from "../../model/PageInfoModel";
import { ComponentPresentationConstraint, NestedRegion, RegionDefinition } from "../../model/PageSchemaModel";

const { DirectoryTree } = Tree;

const loadingContentainerStyle: React.CSSProperties = {
    marginTop: 50,
    width: "100%",
    minHeight: "150px"
};

const PageTreeview = () => {
    const dispatch = useAppDispatch();
    const { pageId } = useAppSelector(state => state.pageReducer);
    const { isLoading, toggleModalTreeView, componentPresentation, selectedKeys, expandkeys, pageInfoData, errorLoading } = useAppSelector(state => state.pageInfoReducer);

    const getPageSchema = useCallback(async (schemaId: string) => {
        try {
            const response = await getService.getItems(schemaId);
            return response.data.RegionDefinition as RegionDefinition;
        } catch (err) {
            console.error(`Failed to fetch schema data for ID: ${schemaId}`, err);
            return null;
        }
    }, []);

    const updatePageData = useCallback(async (data: PageInfo) => {
        dispatch(updatePageInfodata(data));
        const pageSchemaId = formatTcmId(data.RegionSchema.IdRef);
        const localExpandKeys: string[] = [data.Id];

        const constructTreeData = async (regions: any[], currentSchemaId: string): Promise<any[]> => {
            if (!regions || regions.length === 0) return [];

            let pageSchema: RegionDefinition | null = null;
            try {
                pageSchema = await getPageSchema(currentSchemaId);
            } catch (err) {
                console.error(`Schema resolution failure for target ID: ${currentSchemaId}`, err);
            }

            const nodes = await Promise.all(regions.map(async (region: any, index: number) => {
                const constraints = pageSchema?.NestedRegions?.filter((item: NestedRegion) => item.RegionName === region.RegionName) || [];

                const currentRegionKey = region.RegionSchema?.IdRef || region.RegionName || `region_node_${index}`;
                localExpandKeys.push(currentRegionKey);

                const firstConstraint = constraints[0]?.RegionSchema?.ExpandedData?.RegionDefinition?.ComponentPresentationConstraints?.[0];
                const maxOccurs = firstConstraint?.MaxOccurs;
                const minOccurs = firstConstraint?.MinOccurs;

                const componentPresentationsLength = region?.ComponentPresentations?.length || 0;
                const limit = maxOccurs !== undefined && maxOccurs !== -1 ? `(${componentPresentationsLength}/${maxOccurs})` : `(${componentPresentationsLength})`;

                const schemaTypeConstraints = constraints[0]?.RegionSchema?.ExpandedData?.RegionDefinition?.ComponentPresentationConstraints?.filter(
                    (item: ComponentPresentationConstraint) => item.$type === "TypeConstraint"
                ) || [];

                const componentChildren = region?.ComponentPresentations?.map((component: any, idx: number) => {

                    const componentTitle = component.Component?.Title || 
                                           component.Component?.Name || 
                                           component.ComponentTemplate?.Title || 
                                           `Component (${component.Component?.IdRef || idx})`;
                    return {
                        type: component.$type || "ComponentPresentation",
                        id: component.Component?.IdRef,
                        title: <ShowElipsis title={componentTitle} />,
                        key: `${component.Component?.IdRef || 'new'}_${region.RegionSchema?.IdRef || region.RegionName || 'region'}_${idx}`,
                        icon: (
                            <svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" className="treeViewIcon">
                                <path d="M16 5v10.589a.421.421 0 0 1-.428.411H.428A.421.421 0 0 1 0 15.589V5h16zM.208 4L3.368.158A.433.433 0 0 1 3.702 0H12.3c.132 0 .253.058.335.158L15.796 4H.207z" fill="#758099"></path>
                            </svg>
                        ),
                        isLeaf: true
                    };
                }) || [];

                const nextSchemaId = region.RegionSchema?.IdRef
                    ? formatTcmId(region.RegionSchema.IdRef)
                    : constraints[0]?.RegionSchema?.IdRef
                        ? formatTcmId(constraints[0].RegionSchema.IdRef)
                        : currentSchemaId;

                const childRegionNodes = await constructTreeData(region.Regions || [], nextSchemaId);
                
                return {
                    type: region.$type || "EmbeddedRegion",
                    title: `${region?.RegionName} ${limit}`,
                    key: currentRegionKey,
                    id: region.RegionSchema?.IdRef || region.RegionName,
                    maxOccurrenceConstraint: maxOccurs,
                    minOccurrenceConstraint: minOccurs,
                    typeConstraint: schemaTypeConstraints,
                    schemaTitle: "schemaConstraintsTitle",
                    isLeaf: false,
                    icon: (
                        <svg data-test="icon svg" version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" className="treeViewIcon">
                            <path d="M16 12v2a2 2 0 01-1.85 1.995L14 16h-2v-2h2v-2h2zM2 12v2h2v2H2a2 2 0 01-1.995-1.85L0 14v-2h2zm8 2v2H6v-2h4zm6-8v4h-2V6h2zM2 6v4H0V6h2zm2-6v2H2v2H0V2A2 2 0 011.85.005L2 0h2zm10 0a2 2 0 011.995 1.85L16 2v2h-2V2h-2V0h2zm-4 0v2H6V0h4z"></path>
                        </svg>
                    ),

                    children: [...childRegionNodes, ...componentChildren]
                };
            }));

            return nodes;
        };

        const treeChildren = await constructTreeData(data.Regions || [], pageSchemaId);

        const pagedata: DataNode = {
            title: data.Title as string,
            type: data.$type as string,
            id: data.Id as string,
            key: data.Id as string,
            icon: (
                <svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" className="treeViewIcon">
                    <path fillRule="evenodd" clipRule="evenodd" d="M15 15H1V3h14v12zm1-13.857C16 .51 15.552 0 15 0H1C.448 0 0 .51 0 1.143v13.714C0 15.49.448 16 1 16h14c.552 0 1-.51 1-1.143V1.143zM12 9a4 4 0 10-8 0 4 4 0 008 0zm-1.504.94v.606c0 .404-.457.852-.912 1.089-.065.033-.115.034-.159.035-.103.001-.173.003-.317.416h-.14a5.294 5.294 0 00-.06-.674 4.294 4.294 0 01-.025-.18.599.599 0 00-.332-.477c-.354-.173-.486-.52-.539-.872-.02-.135-.005-.278.01-.42.008-.079.016-.158.018-.235.004-.166.003-.334.002-.507l-.001-.239.288.019c.288.018.584.036.88.06.046.003.1.035.13.073.07.083.138.168.206.254.118.147.236.295.364.432.07.076.204.131.308.13.208-.001.239.09.288.233.013.038.027.08.047.125.012.027-.008.051-.027.075-.014.02-.03.038-.03.057zM7.629 8.44c-.274-.312-.467-.596-.245-1.056.1-.208.204-.282.382-.318.12-.023.248-.023.371-.012.232.02.351-.091.443-.292a.863.863 0 01.26-.296c.12-.095.249-.179.384-.267.058-.038.118-.077.178-.118a1.925 1.925 0 01-.056-.044A.297.297 0 009.293 6c-1.055-.53-2.642-.27-3.49.57-.14.139-.141.334.018.457.154.12.23.265.223.459-.002.082-.002.166 0 .25v.12c.512.052.863.352 1.213.649.206.175.41.35.647.472l.033-.022.027-.018a5.532 5.532 0 01-.099-.157 2.433 2.433 0 00-.236-.339z"></path>
                </svg>
            ),
            isLeaf: false,
            children: treeChildren
        };

        const uniqueKeys = [...new Set(localExpandKeys)];
        dispatch(setExpandKeys(uniqueKeys));
        dispatch(setComponentPresentation([pagedata]));
    }, [dispatch, getPageSchema]);

    useEffect(() => {
        if (pageInfoData && Object.prototype.hasOwnProperty.call(pageInfoData, "$type")) {
            updatePageData(pageInfoData);
        }
    }, [pageId, JSON.stringify(pageInfoData), updatePageData]);

    const highlightComponent = (info: any, region: string) => {
        const dataRegionElements = document.querySelectorAll<HTMLElement>(`[${region}]`);
        dataRegionElements.forEach((element) => {
            const attributeName = element.getAttribute(region);
            if (info.node.type === "ComponentPresentation" && info.node.id === attributeName) {
                element.classList.add("highlight-section");
                window.requestAnimationFrame(() => element.scrollIntoView({ behavior: "smooth" }));
            } else {
                element.classList.remove("highlight-section");
            }
        });
    };

    const highlightRegion = (info: any, region: string) => {
        const dataRegionElements = document.querySelectorAll<HTMLElement>(`[${region}]`);
        dataRegionElements.forEach((element) => {
            const attributeName = element.getAttribute(region);
            if (info.node.type === "EmbeddedRegion" && info.node.title?.includes(attributeName)) {
                element.classList.add("highlight-section");
                window.requestAnimationFrame(() => element.scrollIntoView({ behavior: "smooth" }));
            } else {
                element.classList.remove("highlight-section");
            }
        });
    };

    const findRegionDeep = (regions: any[], targetId: string): any | null => {
        if (!regions) return null;
        for (const region of regions) {
            if (region.RegionSchema?.IdRef === targetId || region.RegionName === targetId) return region;
            if (region.Regions) {
                const found = findRegionDeep(region.Regions, targetId);
                if (found) return found;
            }
        }
        return null;
    };

    const getRegion = (selectedKeysValue: React.Key[], info: any) => {
        highlightRegion(info, "data-region");
        highlightComponent(info, "data-component-id");

        const selectedItemId = selectedKeysValue[0] as string;
        const targetNode = info.selectedNodes[0];

        if (!targetNode) return;

        if (targetNode.type !== "ComponentPresentation") {
            const filterRegion = findRegionDeep(pageInfoData?.Regions || [], selectedItemId);
            if (filterRegion) {
                const selectedNode = {
                    title: targetNode.title,
                    key: selectedItemId,
                    type: targetNode.type,
                    schemaTitle: targetNode.schemaTitle,
                    constraints: {
                        maxOccurance: targetNode.maxOccurrenceConstraint,
                        minOccurance: targetNode.minOccurrenceConstraint,
                        numberItemsExist: filterRegion.ComponentPresentations?.length || 0,
                        typeConstraint: targetNode.typeConstraint
                    }
                };
                dispatch(setSelectedKeys(selectedNode as SelectedKeys));
            }
        } else {
            const selectedNode = {
                title: targetNode.title,
                key: selectedItemId,
                type: targetNode.type,
                schemaTitle: targetNode.schemaTitle,
                constraints: {}
            };
            dispatch(setSelectedKeys(selectedNode as SelectedKeys));
        }
    };

    const deletePageComponent = () => {
        if (!selectedKeys?.key) return;

        const splitKey = selectedKeys.key.split("_");
        const compId = splitKey[0];
        const targetRegionId = splitKey[1];
        const position = parseInt(splitKey[2], 10);

        const dataClone = JSON.parse(JSON.stringify(pageInfoData));

        const removeComponentDeep = (regions: any[]): boolean => {
            if (!regions) return false;
            for (let i = 0; i < regions.length; i++) {
                const region = regions[i];
                if ((region.RegionSchema?.IdRef === targetRegionId || region.RegionName === targetRegionId) && region.ComponentPresentations) {
                    region.ComponentPresentations = region.ComponentPresentations.filter(
                        (cp: any, idx: number) => cp.Component?.IdRef !== compId || idx !== position
                    );
                    return true;
                }
                if (region.Regions && removeComponentDeep(region.Regions)) {
                    return true;
                }
            }
            return false;
        };

        removeComponentDeep(dataClone.Regions || []);
        updatePageData(dataClone);
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Tree: {
                        nodeSelectedBg: '#e6f7ff',
                        directoryNodeSelectedBg: "#00737321"
                    }
                }
            }}
        >
            <div className="drawer-btn-group">
                <PageInfoActionButtons deletePageComponent={deletePageComponent} />
            </div>
            {isLoading ? (
                <Flex align="center" justify="center" vertical style={loadingContentainerStyle}>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: "#00737321" }} spin />} tip="Loading Tree View..." />
                </Flex>
            ) : (
                <div className="ant-tree-group">
                    {expandkeys.length !== 0 && componentPresentation.length !== 0 ? (
                        <DirectoryTree
                            switcherIcon={false}
                            autoExpandParent={true}
                            defaultExpandParent={true}
                            defaultExpandAll={true}
                            expandedKeys={expandkeys} 
                            style={{ width: "100%" }}
                            blockNode
                            showIcon
                            onSelect={getRegion}
                            treeData={componentPresentation}
                        />
                    ) : (
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Alert message={errorLoading || "No data available"} type="error" />
                        </Space>
                    )}
                    {toggleModalTreeView && (
                        <FolderTreeview updatePageData={updatePageData} />
                    )}
                </div>
            )}
        </ConfigProvider>
    );
};

export default PageTreeview;