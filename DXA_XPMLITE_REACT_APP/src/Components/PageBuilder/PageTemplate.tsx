import React, { useState, useEffect } from 'react'
import { Col, Row, Tree } from 'antd';
import { DataNode } from 'antd/es/tree';

import { Icon, Icons } from '../../resources/icons';
import { useAppSelector } from '../../store/connect';

export interface TridionItemPayload {
    $type?: string;
    Title?: string;
    RegionName?: string;
    Id?: string;
    RegionSchema?: {
        IdRef: string;
    };
    Regions?: TridionItemPayload[];
    ComponentPresentations?: Array<{
        $type?: string;
        Component: {
            Title: string;
            IdRef: string;
        };
    }>;
}
interface PageTemplateProps {
    pageTemplate: TridionItemPayload[];
}
const { DirectoryTree } = Tree;

const PageTemplate: React.FC<PageTemplateProps> = ({ pageTemplate }) => {
    const { formData } = useAppSelector(state => state.pageBuilderReducer)
    const [treeData, setTreeData] = useState<DataNode[]>([])
    const [expandKeys, setExpandKeys] = useState<string[]>([])

    const getChildComponents = (componentPresentations: any[]): DataNode[] => {
        return (componentPresentations || []).map((item) => {
            const componentType = item.$type || '';
            return {
                title: item.Component?.Title || 'Untitled Component',
                key: item.Component?.IdRef,
                isLeaf: true, // Core Component leaves should be marked as structural true leaves
                icon: Icons[componentType as keyof Icon],
                children: [],
            };
        });
    };

    const constructTreeData = (itemsList: TridionItemPayload[], trackingKeys: string[]): DataNode[] => {
        return (itemsList || []).map((item) => {
            const isPage = item.$type === 'Page';
            const title = isPage
                ? (formData.pagename ?? 'New Page')
                : (item.Title ?? item.RegionName ?? 'Unnamed Region');

            const id = item.Id ?? item.RegionSchema?.IdRef ?? Math.random().toString();

            // Collect structural tracking expansion keys safely
            trackingKeys.push(id);

            const hasChildrenRegions = item.Regions && item.Regions.length !== 0;

            return {
                title: title as React.ReactNode,
                key: id,
                isLeaf: false,
                icon: isPage ? (
                    <svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" className="treeViewIcon">
                        <path fillRule="evenodd" clipRule="evenodd" d="M15 15H1V3h14v12zm1-13.857C16 .51 15.552 0 15 0H1C.448 0 0 .51 0 1.143v13.714C0 15.49.448 16 1 16h14c.552 0 1-.51 1-1.143V1.143zM12 9a4 4 0 10-8 0 4 4 0 008 0zm-1.504.94v.606c0 .404-.457.852-.912 1.089-.065.033-.115.034-.159.035-.103.001-.173.003-.317.416h-.14a5.294 5.294 0 00-.06-.674 4.294 4.294 0 01-.025-.18.599.599 0 00-.332-.477c-.354-.173-.486-.52-.539-.872-.02-.135-.005-.278.01-.42.008-.079.016-.158.018-.235.004-.166.003-.334.002-.507l-.001-.239.288.019c.288.018.584.036.88.06.046.003.1.035.13.073.07.083.138.168.206.254.118.147.236.295.364.432.07.076.204.131.308.13.208-.001.239.09.288.233.013.038.027.08.047.125.012.027-.008.051-.027.075-.014.02-.03.038-.03.057zM7.629 8.44c-.274-.312-.467-.596-.245-1.056.1-.208.204-.282.382-.318.12-.023.248-.023.371-.012.232.02.351-.091.443-.292a.863.863 0 01.26-.296c.12-.095.249-.179.384-.267.058-.038.118-.077.178-.118a1.925 1.925 0 01-.056-.044A.297.297 0 009.293 6c-1.055-.53-2.642-.27-3.49.57-.14.139-.141.334.018.457.154.12.23.265.223.459-.002.082-.002.166 0 .25v.12c.512.052.863.352 1.213.649.206.175.41.35.647.472l.033-.022.027-.018a5.532 5.532 0 01-.099-.157 2.433 2.433 0 00-.236-.339z" />
                    </svg>
                ) : (
                    <svg data-test="icon svg" version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" className="treeViewIcon">
                        <path d="M16 12v2a2 2 0 01-1.85 1.995L14 16h-2v-2h2v-2h2zM2 12v2h2v2H2a2 2 0 01-1.995-1.85L0 14v-2h2zm8 2v2H6v-2h4zm6-8v4h-2V6h2zM2 6v4H0V6h2zm2-6v2H2v2H0V2A2 2 0 011.85.005L2 0h2zm10 0a2 2 0 011.995 1.85L16 2v2h-2V2h-2V0h2zm-4 0v2H6V0h4z" />
                    </svg>
                ),
                children: hasChildrenRegions
                    ? constructTreeData(item.Regions!, trackingKeys)
                    : getChildComponents(item.ComponentPresentations || []),
            };
        });
    };

    useEffect(() => {
        const trackingKeysList: string[] = [];
        const generatedTreeNodes = constructTreeData(pageTemplate, trackingKeysList);

        setTreeData(generatedTreeNodes);

        if (trackingKeysList.length !== 0) {
            setExpandKeys(Array.from(new Set(trackingKeysList)));
        }
    }, [pageTemplate, formData.pagename]);

    return (
        <Row>
            <Col span={12}>
                {
                    treeData.length !== 0 &&
                    <DirectoryTree
                        switcherIcon={false}
                        autoExpandParent
                        defaultExpandParent
                        defaultExpandAll
                        defaultExpandedKeys={expandKeys}
                        treeData={treeData}
                        blockNode
                        showIcon
                    />
                }
            </Col>
        </Row>
    )
}

export default PageTemplate