import { useState } from 'react'
import { Button } from "antd";
import { DeleteOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "../../store/connect";
import { setModalTreeView } from '../../store/pageInfo/pageInfoSlice';

import Publish from "../Publish/Index"
import formatTcmId from "../../utils/formatTcmId";
import Loading from '../Loading';
import postService from "../../Services/postRequest";
import putService from '../../Services/putRquest';

interface PageInfoActionButtonsProps {
    deletePageComponent: () => void;
}

const PageInfoActionButtons = ({ deletePageComponent }: PageInfoActionButtonsProps) => {
    const dispatch = useAppDispatch()
    const { pageInfoData, selectedKeys, toggleModalTreeView } = useAppSelector(state => state.pageInfoReducer);
    const [isLoading, setLoading] = useState<boolean>(false);

    const updatePage = async () => {
        try {
            setLoading(true)

            const data = structuredClone(pageInfoData);
            if (!data) return;

            let pageId = formatTcmId(data.Id)
            let splitId = pageId.split("-");
            let id = "";
            if (data.LockInfo.LockType.includes("CheckedOut")) {
                splitId.splice(-1);
                id = splitId.join("-");
            } else {
                id = splitId.join("-");
            }
            //checkout page
            const checkoutPageResponse = await postService.checkout(id);
            if (checkoutPageResponse?.status !== 200) return;
            if (!data.LockInfo.LockType.includes("CheckedOut")) {
                data.Id = `${data.Id}-v0`;
            }
            //Update page
            const pageResponse = await putService.updatePublishPage(data);
            if (pageResponse?.status !== 200) return;

            const checkinData = {
                "RemovePermanentLock": true
            }
            //Checkin Page
            await postService.postRequest(`${id}-v0/checkIn`, checkinData);

        } catch (error) {
            console.error("Error updating page:", error);
        }
        finally {
            setLoading(false)
        }
    }
    const toggleFolderStructure = () => {
        if (selectedKeys.key !== null) {
            dispatch(setModalTreeView(!toggleModalTreeView))
        }
    };

    const isPlusDisabled = selectedKeys.key === null ||
        selectedKeys.constraints?.numberItemsExist === selectedKeys.constraints?.maxOccurance;

    const isDeleteDisabled = selectedKeys.key === null || selectedKeys.type !== "ComponentPresentation";

    return (
        <>
            {isLoading && <Loading />}
            <Publish />
            <Button
                className="drawer-btn"
                type="default"
                size='middle'
                icon={<SaveOutlined style={{ fontSize: 18 }} />}
                onClick={updatePage}>
            </Button>
            <Button 
                disabled={isPlusDisabled} 
                className="drawer-btn" 
                type="default" 
                size="middle" 
                icon={<PlusOutlined style={{ fontSize: 18 }} />} 
                onClick={toggleFolderStructure}
            />
            <Button 
                disabled={isDeleteDisabled} 
                className="drawer-btn" 
                type="default" 
                size='middle' 
                icon={<DeleteOutlined style={{ fontSize: 18 }} />} 
                onClick={deletePageComponent}
            />
        </>
    )
}

export default PageInfoActionButtons
