import { Checkbox, Flex, RadioChangeEvent, Table, TableProps } from "antd";

import { setCurrentPublicationToPublishing, setSelectedChildPublications } from "../../store/publish/publishSlice";
import { useAppDispatch, useAppSelector } from "../../store/connect";

interface DataType {
    name: string,
    Id: string
    key: string;
}
const childPublicationsColumns: TableProps<DataType>['columns'] = [
    {
        title: 'CHILD PUBLICATION',
        dataIndex: 'name',
        key: 'name',
        onCell:(record) => ({           
            children:<Flex align="center" gap={5} style={{border:"1px solid red"}}>
                <svg  version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" className="treeViewIcon">
                    <path d="M8 0C3.58203 0 0 3.581 0 8c0 4.41803 3.58203 8 8 8 4.419 0 8-3.58197 8-8 0-4.419-3.581-8-8-8zm4.01501 10.16003S10.84406 12.68903 10 13c-.39697.146-.52295 1.11401-1 2l.03601-1.63995c.06702-.93702-.37299-2.42102-.36798-2.88105.00201-.37-1.26398-.48095-1.279-1.10595-.00903-.36805.06-.55701.11701-.93006C6 8 5.57501 6.651 4.948 6.23303c-.01795-.01202-.11695.93-.11695.93l-.276-1.099c-.289-.15601-.182-.43604-.36303-1.34302-.06598-.333-.63-.34198-.87201-.58197-.24897-.24805.83001-1.065 1.10504-1.279C5.057 2.36903 6 1 9 1l-.79596 1.86102 1.5-.65002c.557.11004.958.273 1.34998.53503.044.029-.081.39899.01501.49298-.37598.19-.72998.34699-1.05902.54499-.19397.117-.39899.26904-.51495.45703-.20404.32898-.51502 1.12298-.91101 1.03796-.06702-.01495-.13703-.02295-.206-.034l-.078.62702-.52301.40698.11597-.93097s-.47596.01001-.68897.339c-.48602.752-.07 1.127.01099 1.302 0 0 1.64398.15002 2.32599.29199C9.61902 7.297 10 7 11 8c.32703.32703 1.08502 1.56 1.19904 1.95001.02496.08801-.175.13404-.18403.21002z"></path>
                </svg>
                {record.name}
            </Flex>
        })
    }
]
const PublicationList = () => {
    const dispatch = useAppDispatch();
    const { publishToCurrentPublication, childPublications, parentPublication } = useAppSelector(state => state.publishReducer)
    const childPublicationsSelection = {
        onChange: (selectedRowKeys: React.Key[]) => {
            dispatch(setSelectedChildPublications(selectedRowKeys as string[]));
        }
    };
    const handleCurrentPublicationPublishing = (e: RadioChangeEvent) => {
        dispatch(setCurrentPublicationToPublishing(e.target.checked));
    }
    return (
        <div className="publicationList">
            <h3 className="publishTargetHeading">Publish items in publications:</h3>
            <div style={{ marginLeft: 14, padding: "5px 0px" }}>                    
                <Checkbox style={{display:"flex", alignItems:"center"}} type="checkbox" onChange={handleCurrentPublicationPublishing} name={parentPublication.name} checked={publishToCurrentPublication ? true : false}>
                    <Flex gap={6} align="center">
                        <svg  version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" className="treeViewIcon">
                            <path d="M8 0C3.58203 0 0 3.581 0 8c0 4.41803 3.58203 8 8 8 4.419 0 8-3.58197 8-8 0-4.419-3.581-8-8-8zm4.01501 10.16003S10.84406 12.68903 10 13c-.39697.146-.52295 1.11401-1 2l.03601-1.63995c.06702-.93702-.37299-2.42102-.36798-2.88105.00201-.37-1.26398-.48095-1.279-1.10595-.00903-.36805.06-.55701.11701-.93006C6 8 5.57501 6.651 4.948 6.23303c-.01795-.01202-.11695.93-.11695.93l-.276-1.099c-.289-.15601-.182-.43604-.36303-1.34302-.06598-.333-.63-.34198-.87201-.58197-.24897-.24805.83001-1.065 1.10504-1.279C5.057 2.36903 6 1 9 1l-.79596 1.86102 1.5-.65002c.557.11004.958.273 1.34998.53503.044.029-.081.39899.01501.49298-.37598.19-.72998.34699-1.05902.54499-.19397.117-.39899.26904-.51495.45703-.20404.32898-.51502 1.12298-.91101 1.03796-.06702-.01495-.13703-.02295-.206-.034l-.078.62702-.52301.40698.11597-.93097s-.47596.01001-.68897.339c-.48602.752-.07 1.127.01099 1.302 0 0 1.64398.15002 2.32599.29199C9.61902 7.297 10 7 11 8c.32703.32703 1.08502 1.56 1.19904 1.95001.02496.08801-.175.13404-.18403.21002z">
                            </path>
                        </svg>
                        <span>{parentPublication.name}</span>
                    </Flex>
                </Checkbox>
            </div>
            {
                childPublications.length!==0 ? 
                <Table                        
                    bordered={true}
                    columns={childPublicationsColumns}
                    dataSource={childPublications}
                    pagination={false}
                    rowSelection={{
                        ...childPublicationsSelection
                    }}
                    style={{ height: 300, background: "none" }}
                    rowClassName="publicationTargetRow"
                /> : null
            }        
        </div>
    )
}

export default PublicationList
