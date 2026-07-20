import { useEffect } from 'react'
import { Drawer } from "antd";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "../../store/connect";
import { togglePageInfo } from "../../store/page/pageSlice";
import { fetchPageInfoData } from "../../store/pageInfo/pageinfoActions";
import PageTreeview from "./PageTreeview";

const PageDrawer = () => {
  const dispatch = useAppDispatch()
  const { showPageInfo, pageId } = useAppSelector(state => state.pageReducer);
  const handleClose = () => {
    dispatch(togglePageInfo(!showPageInfo))
  };
  useEffect(() => {
    if (showPageInfo && pageId) {
      dispatch(fetchPageInfoData(pageId as string))
    }
  }, [pageId, showPageInfo, dispatch]);

  return (
    <Drawer
      title="Page"
      placement="left"
      onClose={handleClose}
      open={showPageInfo}
      width={360}
      maskClosable={true}
      styles={{ body: { padding: "10px 0" } }}
      destroyOnHidden={true}
      mask={false}
      closeIcon={showPageInfo ? <CloseOutlined /> : <MenuOutlined />}
    >
      {pageId ? <PageTreeview /> : null}
    </Drawer>
  );
};

export default PageDrawer;
