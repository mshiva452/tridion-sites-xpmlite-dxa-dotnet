import React, { useState, useEffect } from 'react'
import { Typography, Table, Flex, Spin } from 'antd';
import { ColumnsType } from 'antd/es/table';

import { Icon, Icons } from '../../resources/icons';
import { format } from 'date-fns';
import { ShowElipsis } from '../ShowElipsis';
import { LoadingOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/connect';
import { setSelectedComponentRowKeys, setSelectedComponentTemplate } from '../../store/pageInfo/pageInfoSlice';
import { fetchComponentTemplatesData } from '../../store/pageInfo/pageinfoActions';
import { DataNode } from '../../model/PageModel';

import formatTcmId from '../../utils/formatTcmId';
import getService from '../../Services/getRequest';
import NoItems from './NoItems';

const { Text } = Typography;
const columns: ColumnsType = [
    {
        title: 'NAME',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, value: any) => {
            return (
                text !== undefined &&
                <Flex align='center' style={{ gap: 10 }}>
                    {value.icon}{<Text style={{ width: 250 }} ellipsis={{ tooltip: text }}>{text}</Text>}
                </Flex>
            )
        },
        responsive: ['sm'],
    },
    {
        title: 'STATUS',
        dataIndex: 'status',
        key: 'status',
    },
    {
        title: 'SCHEMA',
        dataIndex: 'schema',
        key: 'schema',
    },
    {
        title: 'DATE MODIFIED',
        dataIndex: 'date',
        key: 'date',
    },
];

interface FolderItemsProps {
    selectedItemId: string;
}
const FolderItems = ({ selectedItemId }: FolderItemsProps) => {
    const dispatch = useAppDispatch()
    const { selectedComponentRowKeys } = useAppSelector(state => state.pageInfoReducer)
    const [folderData, setFolderData] = useState<DataNode[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false)
    const [orgItems, setOrgItems] = useState<{ title: string, idRef: string }>({ title: "", idRef: "" })

    useEffect(() => {
        if (selectedItemId) {
            getSelctedFolderData(selectedItemId)
        }
    }, [selectedItemId])

    const getSelctedFolderData = async (itemId: string) => {
        setLoading(true)
        try {
            // Run both initial API requests in parallel or sequentially under a single loading state wrapper
            const parentResponse = await getService.getItems(itemId);
            if (parentResponse?.data) {
                setOrgItems({
                    title: parentResponse.data.Title,
                    idRef: parentResponse.data.LocationInfo.OrganizationalItem.IdRef
                });
            }

            const response = await getService.getFolderItems(itemId);
            if (response?.data) {
                const filteredData = response.data.filter((item: any) =>
                    item.hasOwnProperty("Data")
                        ? (item.Data.$type === "Folder" || item.Data.$type === "Component")
                        : (item.$type === "Folder" || item.$type === "Component")
                )

                const filteredOrgData = filteredData?.map((items: any) => {
                    const type = items.hasOwnProperty("Data") ? items.Data.$type : items.$type;
                    const title = items.hasOwnProperty("Data") ? items.Data.Title : items.Title;
                    const status = items.hasOwnProperty("IsPublishedInContext") ? items.IsPublishedInContext : "";
                    const schema = items.hasOwnProperty("Schema") ? items.Schema.Title : "";
                    const date = items.hasOwnProperty("Data") ? items.Data.VersionInfo.RevisionDate : items.VersionInfo.RevisionDate;
                    const schemaId = items.hasOwnProperty("Schema") ? items.Schema.IdRef : "";
                    return {
                        key: items.Id,
                        id: items.Id,
                        type: type,
                        icon: Icons[type as keyof Icon],
                        name: <ShowElipsis title={title as string} />,
                        status: status ? Icons["Published"] : "",
                        schema: schema,
                        schemaId: schemaId,
                        date: format(new Date(date), 'MM/dd/yyyy hh:mm aa')
                    }
                })
                setFolderData(filteredOrgData as any)
            }
        } catch (error) {
            console.error("Error fetching folder data:", error);
        } finally {
            setLoading(false)
        }
    }
    const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRows: any) => {
        dispatch(setSelectedComponentRowKeys(newSelectedRowKeys))
        if (selectedRows.length !== 0) {
            const selectedComponentSchemaId = formatTcmId(selectedRows[selectedRows.length - 1].schemaId)
            dispatch(fetchComponentTemplatesData(selectedComponentSchemaId))
        } else {
            dispatch(setSelectedComponentTemplate([]))
        }

    };
    const getChildNodes = async (key: string) => {
        const tcmId = formatTcmId(key)
        getSelctedFolderData(tcmId);
    }

    const rowSelectionEmpty = () => {
        dispatch(setSelectedComponentRowKeys([]))
        dispatch(setSelectedComponentTemplate([]))
    }

    const rowSelection = {
        selectedRowKeys: selectedComponentRowKeys,
        onSelectNone: rowSelectionEmpty,
        onChange: onSelectChange,
        getCheckboxProps: (record: any) => ({
            disabled: record.type !== 'Component',
            name: record.name,
        }),
    };
    return (
        folderData.length !== 0 ?
            <Table
                title={() =>
                    <Flex align='center' style={{ gap: 5, }} onClick={() => getChildNodes(orgItems.idRef)}>
                        <svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" className="treeViewIcon" style={{ width: 16, height: 16 }}>
                            <path d="M3.11006 4.2343L6.23425 1.11009C6.38103 0.963305 6.61897 0.963305 6.76575 1.11009L9.88994 4.2343C10.0367 4.38108 10.0367 4.61902 9.88994 4.7658L9.62422 5.03152C9.47744 5.1783 9.2395 5.1783 9.09275 5.03152L7.0625 3.0013V13.875H12.2492C12.2985 13.875 12.3473 13.8847 12.3928 13.9035C12.4383 13.9224 12.4796 13.95 12.5144 13.9848L12.8894 14.3598C13.1257 14.5961 12.9583 15 12.6242 15H6.6875C6.27328 15 5.9375 14.6642 5.9375 14.25V3.0013L3.90728 5.03149C3.7605 5.17827 3.52256 5.17827 3.37581 5.03149L3.11009 4.76577C2.96331 4.61902 2.96331 4.38108 3.11006 4.2343Z"></path>
                        </svg>
                        <svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 13" className="treeViewIcon" style={{ width: 16, height: 16 }}>
                            <path d="M7.94 1.94l-1.214.808A1.5 1.5 0 0 1 5.894 3H0V1.4A1.4 1.4 0 0 1 1.4 0h4.186a1 1 0 0 1 .707.293l1.646 1.646zM9.65 2H14.6A1.4 1.4 0 0 1 16 3.4v8.2a1.4 1.4 0 0 1-1.4 1.4H1.4A1.4 1.4 0 0 1 0 11.6V4h5.894a2.5 2.5 0 0 0 1.387-.42L9.651 2z" fill="#ffb238"></path>
                        </svg>
                        <span>{orgItems.title}</span>
                    </Flex>
                }
                className='folderData'
                showHeader
                dataSource={folderData}
                pagination={false}
                rowSelection={rowSelection}
                columns={columns as any}
                loading={{ indicator: <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin={isLoading} />} />, spinning: isLoading }}
                style={{ color: "rgba(0, 0, 0, 0.88)", minHeight: "56vh", height: "90%" }}
                scroll={{ y: "48vh", }}
                onRow={() => {
                    return {
                        onDoubleClick: (event) => {
                            const key = event.currentTarget.dataset.rowKey
                            getChildNodes(key)
                        }
                    }
                }}
            />
            :
            <NoItems />
    )
}

export default FolderItems
