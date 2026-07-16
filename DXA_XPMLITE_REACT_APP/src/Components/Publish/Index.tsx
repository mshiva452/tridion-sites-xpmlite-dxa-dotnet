import { useState } from 'react'
import { Button, ConfigProvider, Modal } from 'antd';

import { useAppSelector } from '../../store/connect';
import PublishContainer from './PublishContainer';

const themeStyle = {
    Tabs: {
        itemSelectedColor: "#007373",
        itemHoverColor: "#007373",
        inkBarColor: "#007373"
    },
    Modal: {
        wireframe: true,

    },
    Button: {
        colorPrimary: "#007373",
        colorPrimaryBg: "#007373",
        colorPrimaryActive: "#007373",
        colorPrimaryHover: "#007373",
        colorPrimaryBorderHover: "#007373",
    },
    Checkbox: {
        colorBorder: "#9199ad",
        colorPrimary: "#007373",
        colorPrimaryHover: "#007373"
    },
    Radio: {
        colorBorder: "#9199ad",
        colorPrimary: "#007373",
        colorPrimaryHover: "#007373"
    },
    Table: {
        headerColor: "#5e667a",
        fontWeightStrong: 400,
        colorBgContainer: "#fff",
        cellPaddingInline: 10,
        cellPaddingBlock: 10
    }
}
const Publish = () => {
    const { selectedPublishingTarget, publishToCurrentPublication, selectedChildPublications } = useAppSelector(state => state.publishReducer)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPublishable, setPublishable] = useState<boolean>(false)
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <ConfigProvider theme={{ components: themeStyle }}>
            <Button
                style={{ fontVariant: "normal" }}
                onClick={showModal}
                className="drawer-btn"
                type="default"
                size='middle'
                // icon={<GlobalOutlined style={{ fontSize: 15 }} className='treeViewIcon' />}
                title='Publish'
            >
                Publish
            </Button>
            <Modal
                centered
                title="Publish"
                open={isModalOpen}
                closable={true}
                onCancel={handleCancel}
                footer={
                    [
                        <Button key={1} onClick={() => setPublishable(true)} type='primary' disabled={selectedPublishingTarget.length === 0 || (publishToCurrentPublication === false && selectedChildPublications.length === 0)}>Publish</Button>,
                        <Button key={2} onClick={handleCancel}>Cancel</Button>
                    ]
                }
                width={{
                    xs: "95%",
                    sm: "90%",
                    md: 700,
                    lg: 800,
                    xl: 1000,
                }}
                styles={{
                    content: {
                        display: "flex",
                        flexDirection: "column",
                        maxHeight: "90vh",
                    },
                    body: {
                        maxHeight: "calc(100vh - 220px)",
                        overflowY: "auto",
                        padding:"10px 20px"
                    },
                }}
            >
                <PublishContainer isPublishable={isPublishable} />
            </Modal>
        </ConfigProvider>

    )
}

export default Publish