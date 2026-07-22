import { useEffect, useState } from 'react';
import { Button, List, Popover, Flex } from "antd";

import { Icon, Icons } from "../../resources/icons";
import { useAppSelector } from '../../store/connect';

import getService from "../../Services/getRequest";
import formatTcmId from '../../utils/formatTcmId';
import { PageInfo } from '../../model/PageInfoModel';

interface ActionButtonsProps {
    updatePageData: (jsonData: PageInfo) => void;
    handleCancel: () => void;
}

const FolderTreeviewActionButtons = ({ updatePageData, handleCancel }: ActionButtonsProps) => {
    const { selectedKeys, selectedComponentTemplate, selectedComponentRowKeys, pageInfoData, updatedComponentTemplate } = useAppSelector(state => state.pageInfoReducer);
    const [isItemAllowed, setAllowedItem] = useState<boolean>(true);

    useEffect(() => {
        if (!selectedKeys || selectedComponentRowKeys.length === 0) {
            setAllowedItem(true);
            return;
        }
        const typeConstraints = selectedKeys.constraints?.typeConstraint || [];

        if (typeConstraints.length !== 0 && updatedComponentTemplate !== undefined) {
            const constraints = typeConstraints.filter((item: any) => item.BasedOnComponentTemplate?.IdRef === updatedComponentTemplate.value);

            if (constraints.length !== 0) {
                setAllowedItem(selectedComponentTemplate.length === 0 || updatedComponentTemplate === undefined);
            } else {
                setAllowedItem(true);
            }
        } else {
            setAllowedItem(false);
        }
    }, [selectedKeys, selectedComponentTemplate, selectedComponentRowKeys, updatedComponentTemplate]);

    const updatePageByComponents = async () => {
        if (!selectedKeys || selectedComponentRowKeys.length === 0) return;

        const key = selectedComponentRowKeys[0] as string;
        const tcmid = formatTcmId(key);

        try {
            const componentResponse = await getService.getItems(tcmid);
            if (componentResponse.status === 200) {
                const jsonData = structuredClone(pageInfoData);

                if (jsonData && jsonData.Regions) {
                    const componentTemplate = {
                        Title: updatedComponentTemplate !== undefined
                            ? (updatedComponentTemplate.label as string)
                            : (selectedComponentTemplate.length !== 0 ? selectedComponentTemplate[0].Title as string : "tcm:0-0-0"),
                        IdRef: updatedComponentTemplate !== undefined
                            ? (updatedComponentTemplate.value as string)
                            : (selectedComponentTemplate.length !== 0 ? selectedComponentTemplate[0].IdRef as string : "tcm:0-0-0")
                    };

                    const structuralTitle = componentResponse.data?.Title ||
                        componentResponse.data?.Component?.Title ||
                        `Component (${selectedComponentRowKeys[0]})`;

                    const newComponentPresentation = {
                        "$type": "ComponentPresentation",
                        "Component": {
                            "$type": "Link",
                            "IdRef": selectedComponentRowKeys[0].toString(),
                            "Title": structuralTitle
                        },
                        "ComponentTemplate": {
                            "$type": "Link",
                            "Title": componentTemplate.Title,
                            "IdRef": componentTemplate.IdRef
                        },
                        "Conditions": []
                    };


                    const insertComponentDeep = (regions: any[]): boolean => {
                        if (!regions) return false;

                        for (let i = 0; i < regions.length; i++) {
                            const region = regions[i];

                            const isMatch = region.RegionSchema?.IdRef === selectedKeys.key ||
                                region.RegionName === selectedKeys.key;

                            if (isMatch) {
                                if (!region.ComponentPresentations) {
                                    region.ComponentPresentations = [];
                                }
                                region.ComponentPresentations.push(newComponentPresentation);
                                return true;
                            }

                            if (region.Regions && insertComponentDeep(region.Regions)) {
                                return true;
                            }
                        }
                        return false;
                    };

                    const isInserted = insertComponentDeep(jsonData.Regions);

                    if (isInserted && typeof updatePageData === "function") {
                        updatePageData(jsonData);
                    } else if (!isInserted) {
                        console.warn(`Could not find a valid matching layout block container for: ${selectedKeys.key}`);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to update page components:", error);
        }
    };

    const content = (
        <div className="w-auto">
            <List>
                {selectedKeys?.constraints?.maxOccurance !== undefined && selectedKeys.constraints.maxOccurance > 1 ? (
                    <List.Item>
                        <List.Item.Meta title={`Items you can still select : ${selectedKeys.constraints.maxOccurance - selectedKeys.constraints.numberItemsExist}`} />
                    </List.Item>
                ) : null}
                <List.Item>
                    <Flex vertical>
                        <p className="mb-0 fw-bold">Allowed schemas and templates:</p>
                        {selectedKeys?.constraints?.typeConstraint?.map((item: any, index: number) => {
                            const itemKey = item.BasedOnSchema?.IdRef || item.BasedOnComponentTemplate?.IdRef || index;
                            if (item.hasOwnProperty("BasedOnSchema") && item.hasOwnProperty("BasedOnComponentTemplate")) {
                                return (
                                    <Flex align="center" gap="small" className="mb-1" key={itemKey}>
                                        <p className="mb-0">{Icons["Schema" as keyof Icon]} </p>
                                        <Flex gap="small" className="mb-0">
                                            {item.BasedOnSchema.Title} +
                                            <Flex align="center" gap="small" className="mb-1">
                                                {Icons["Component Template" as keyof Icon]} {item.BasedOnComponentTemplate.Title}
                                            </Flex>
                                        </Flex>
                                    </Flex>
                                );
                            } else if (item.hasOwnProperty("BasedOnComponentTemplate")) {
                                return (
                                    <Flex align="center" gap="small" className="mb-1" key={itemKey}>
                                        <p className="mb-0">{Icons["Component Template" as keyof Icon]} </p>
                                        <p className="mb-0">{item.BasedOnComponentTemplate.Title}</p>
                                    </Flex>
                                );
                            } else if (item.hasOwnProperty("BasedOnSchema")) {
                                return (
                                    <Flex align="center" gap="small" className="mb-1" key={itemKey}>
                                        <p className="mb-0">{Icons["Component Template" as keyof Icon]} </p>
                                        <p className="mb-0">{item.BasedOnSchema.Title}</p>
                                    </Flex>
                                );
                            }
                            return null;
                        })}
                    </Flex>
                </List.Item>
            </List>
        </div>
    );

    return (
        <>
            {selectedKeys !== undefined && selectedKeys.constraints?.typeConstraint?.length !== 0 ? (
                <Popover content={content} trigger="click">
                    <Button type="default">Show constraints</Button>
                </Popover>
            ) : null}
            <Button disabled={isItemAllowed} onClick={updatePageByComponents}>
                Insert
            </Button>
            <Button onClick={handleCancel}>Done</Button>
        </>
    );
};

export default FolderTreeviewActionButtons;