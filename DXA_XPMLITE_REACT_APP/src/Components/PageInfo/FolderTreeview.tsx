import { useState, useEffect} from "react";
import { Modal, ConfigProvider, Row, Col, TreeProps, Tree } from "antd";
import { DownOutlined, LoadingOutlined } from "@ant-design/icons";

import { Icon, Icons } from "../../resources/icons";
import { ShowElipsis } from "../ShowElipsis";
import { useAppDispatch, useAppSelector } from "../../store/connect";
import { setModalTreeView } from "../../store/pageInfo/pageInfoSlice";
import { DataNode } from "../../model/PageModel";

import getService from "../../Services/getRequest";
import FolderTreeviewActionButtons from "./FolderTreeviewActionButtons";
import FolderItems from "./FolderItems";
import ComponentTemplates from "./ComponentTemplates";
import formatTcmId from "../../utils/formatTcmId";
import { PageInfo } from "../../model/PageInfoModel";

interface FolderProps{
    updatePageData:(data:PageInfo) => void;
}

const { DirectoryTree } = Tree;
const FolderTreeview = ({updatePageData}:FolderProps) => {
    const dispatch = useAppDispatch()
    const {selectedKeys, toggleModalTreeView, componentTemplates} = useAppSelector(state => state.pageInfoReducer);
    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string>();
    const [isLoading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true)
       const organizationalContentFolderId = formatTcmId(selectedKeys.key as string) //import.meta.env.VITE_CONTENT_FOLDER_ID;
       getFolderTreeview(organizationalContentFolderId as string)
    }, [])

    const getFolderTreeview = async (contentFolderId:string) => {
        const treeStructureData = await getService.getOrganizationalStructure(contentFolderId);
        const parsedTreeData = await traverse([treeStructureData.data as any])
        setTreeData(parsedTreeData);
        setLoading(false)
    }
    const traverse = (data:any):any => {
        if (Array.isArray(data) && data.length !== 0) {
            return data.filter((items: any) => {
                if (items.hasOwnProperty("DataType")) {
                    if (items["DataType"] !== "Schema" && items["DataType"] !== "Component" && items["DataType"] !== "BusinessProcessType" && items["DataType"] !== "Category" && items["DataType"] !== "StructureGroup" && items["DataType"] !== "ExternalCategory") {
                        return true
                    }
                } else if (items.hasOwnProperty("$type")) {
                    if (items["DataType"] !== "Schema" && items["DataType"] !== "Component" && items["DataType"] !== "BusinessProcessType" && items["DataType"] !== "Category" && items["DataType"] !== "StructureGroup" && items["DataType"] !== "ExternalCategory") {
                        return true
                    }
                }
                return false
            }).map((item: any) => {
                if (item.hasOwnProperty("IdRef")) {
                    let icon = item["DataType"] !== undefined ? item["DataType"] : item["DisplayName"]
                    let title = item["DisplayName"] === "Content Management" ? "Publication" : item["DisplayName"]
                    return {
                        title: <ShowElipsis title={title} />,
                        id: item["IdRef"],
                        key: item["IdRef"],
                        icon:Icons[icon as keyof Icon],
                        //  isLeaf: !Array.isArray(item.Children) && item.Children.length !== 0,
                        isLeaf: false,
                        children: Array.isArray(item.Children) ? traverse(item.Children) : []
                    }
                } else {
                    let icon = item["$type"]
                    return {
                        title:<ShowElipsis title={item["Title"] as string} />,
                        id: item["Id"],
                        key: item["Id"],
                        icon: Icons[icon as keyof Icon],
                        //  isLeaf: !Array.isArray(item.Children) && item.Children.length !== 0,
                        isLeaf: false,
                        children: Array.isArray(item.Children) ? traverse(item.Children) : []
                    } 
                }
            });
        }
    }
    const onSelect: TreeProps['onSelect'] = ([], info) => {
       // console.log(selectedKeys)
        const selectedTcmId = info.node.key?.toString();
        const tcmid = formatTcmId(selectedTcmId);
        setSelectedItemId(tcmid)
    };

    const handleCancel = () => {       
        if (selectedKeys.key !== null) {
            dispatch(setModalTreeView(!toggleModalTreeView))
        }
    }
  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            wireframe: true,
            sizePopupArrow: 16,
            zIndexPopupBase: 1000,
          },
        },
      }}>
        <Modal
            title="Select an item"
            open={toggleModalTreeView}
            width={"80vw"}
            centered={true}
            styles={{body:{padding:0}}}
            destroyOnClose={true}
            footer={
                <FolderTreeviewActionButtons 
                    updatePageData={updatePageData}
                    handleCancel={handleCancel}
                />
            }
            closable={true}
            onCancel={handleCancel}
        >
            <Row>
                <Col span={7} className="treeViewFolderStructure">
                    {
                       isLoading? 
                       <LoadingOutlined spin/> :
                            treeData.length !== 0 ?
                            <DirectoryTree
                                style={{ height: "56vh", overflowY: "auto" }}
                                showIcon
                                onSelect={onSelect}
                                treeData={treeData}
                                switcherIcon={<DownOutlined style={{ fontSize: "11px" }} />}
                            /> : null
                    }
                </Col>
                <Col span={17} className="folderStructure">
                    <FolderItems selectedItemId={selectedItemId as string} />
                    { componentTemplates.length!==0 ? <ComponentTemplates /> : null}                  
                </Col>
            </Row>
        </Modal>
    </ConfigProvider>
  );
};

export default FolderTreeview;
