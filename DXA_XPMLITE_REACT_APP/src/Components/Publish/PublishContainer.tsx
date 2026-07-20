import { useState, useEffect } from "react";
import { ConfigProvider, Tabs } from "antd";
import type { TabsProps } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { useAppDispatch, useAppSelector } from "../../store/connect";
import { setLoading, setPublishDate } from "../../store/publish/publishSlice";
import AdditionalSettings from "./AdditionalSettings";
import General from "./General";
import Loading from "../Loading";
import formatTcmId from "../../utils/formatTcmId";
import getService from "../../Services/getRequest";
import postService from "../../Services/postRequest";
import { IPublishData } from "../../model/PageModel";

interface IPublishProps {
	isPublishable: boolean;
	pageIdToPublish?: string
}
const themeStyle = {
	Tabs: {
		itemSelectedColor: "#007373",
		itemHoverColor: "#007373",
		inkBarColor: "#007373",
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
		colorPrimaryHover: "#007373",
	},
	Radio: {
		colorBorder: "#9199ad",
		colorPrimary: "#007373",
		colorPrimaryHover: "#007373",
	},
	Table: {
		headerColor: "#5e667a",
		fontWeightStrong: 400,
		colorBgContainer: "#fff",
		cellPaddingInline: 10,
		cellPaddingBlock: 10,
	},
}
const PublishContainer = ({ isPublishable, pageIdToPublish }: IPublishProps) => {
	const {
		selectedChildPublications,
		selectedPublishingTarget,
		publishingSchedule,
		publishPriority,
		publishToCurrentPublication,
		publishDate,
		additionalSettings,
		isLoading
	} = useAppSelector((state) => state.publishReducer);
	const { pageId } = useAppSelector(state => state.pageReducer)
	const dispatch = useAppDispatch();
	const currentDate = new Date();
	const formatDate = dayjs(currentDate);
	const [publishStatus, setPublishStatus] = useState<string>();

	useEffect(() => {
		publishPage();
		dispatch(setPublishDate(formatDate));
	}, [isPublishable]);

	const publishPage = async () => {
		const pageTcmId = pageIdToPublish ? pageIdToPublish : pageId?.split("_").join(":")
		if (selectedPublishingTarget.length !== 0) {
			dispatch(setLoading(true))
			const publishData = {
				Ids: [pageTcmId],
				Priority: publishPriority,
				TargetIdsOrPurposes: selectedPublishingTarget,
				PublishInstruction: {
					ResolveInstruction: {
						IncludeChildPublications: false,
						IncludeComponentLinks:
							additionalSettings["linkedItems"] === 2 ? false : true,
						IncludeCurrentPublication: publishToCurrentPublication,
						IncludeDynamicVersion:
							additionalSettings["overridePriority"] === 2 ? true : false,
						IncludeWorkflow:
							additionalSettings["itemsInProgress"] === 2 ? true : false,
						PublishInChildPublications: selectedChildPublications,
						PublishNewContent: true,
					},
				},
			} as IPublishData;
			if (publishingSchedule === 2 && publishDate !== null) {
				const dateInUtc = publishDate["$d" as keyof Dayjs] as any;
				publishData.PublishInstruction["DeployAt"] = dateInUtc.toISOString();
			}
			try {
				const publishResponse = await postService.publish(publishData);
				if (publishResponse?.status === 202) {
					const publishQueueId = formatTcmId(publishResponse.data.PublishTransactionIds[0]);
					const publishStatusResponse = await getPagePublishStatus(publishQueueId);
					setPublishStatus(publishStatusResponse.data.State)
					if (!publishStatusResponse.data.IsCompleted && publishStatusResponse.data.State !== "Success") {
						const timeInterval = setInterval(async () => {
							const response = await getPagePublishStatus(publishQueueId);
							setPublishStatus(response.data.State)
							if (response.data.IsCompleted && response.data.State === "Success") {
								clearInterval(timeInterval);
								dispatch(setLoading(false))
								//window.location.reload();
								const publishedPageId = publishStatusResponse.data.Items[0].IdRef.split(":").join("_")
								const publishedPageUrl = await getService.getPublishedPageUrl(publishedPageId)
								window.open(publishedPageUrl.data[0].Uri, "_self")
							} else if (response.data.IsCompleted && response.data.State === "Failed") {
								clearInterval(timeInterval);
								dispatch(setLoading(false))
							}
							else if (publishStatusResponse.data.State === "ScheduledForDeployment") {
								clearInterval(timeInterval);
							}
						}, 3000);
					} else if (publishStatusResponse.data.State === "ScheduledForDeployment") {
						dispatch(setLoading(false))
					}
				}
			} catch (err) {
				console.log(err);
				dispatch(setLoading(false))
			}
		}
	};
	const getPagePublishStatus = async (id: string) => {
		const tcmid = id;
		const publishStatusResponse = await getService.getPublishStatus(tcmid);
		return publishStatusResponse;
	};
	const items: TabsProps["items"] = [
		{
			key: "1",
			label: "General ",
			children: <General />,
		},
		{
			key: "2",
			label: "Additional Settings",
			children: <AdditionalSettings />,
		},
	];
	return (
		<ConfigProvider theme={{ components: themeStyle }}>
			<div style={{ padding: "0px 10px", textAlign: "left" }}>
				{isLoading ? <Loading status={publishStatus} /> : null}
				<Tabs defaultActiveKey="1" items={items} />
			</div>
		</ConfigProvider>
	);
};

export default PublishContainer;
