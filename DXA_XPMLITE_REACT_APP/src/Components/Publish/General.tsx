import { useEffect } from "react";
import { ConfigProvider, Flex } from "antd";

import { useAppDispatch, useAppSelector } from "../../store/connect";
import { fetchTargetTypes } from "../../store/publish/publishAction";

import PublicationList from "./PublicationList";
import PublicationTargetTypes from "./PublicationTargetTypes";

const General = () => {
	const { pageId } = useAppSelector(state => state.pageReducer);
	const dispatch = useAppDispatch();

	useEffect(() => {
		if(pageId!==null){
			getTargetTypes();
		}
	}, []);

	const getTargetTypes = async () => {
		dispatch(fetchTargetTypes(pageId as string))
	};
  return (
    <Flex justify="flex-start">
		<ConfigProvider
			theme={{
				components: {
					Table: {
						headerBg: "none",
						rowHoverBg: "rgba(0,115,115,.13)",
						rowSelectedBg: "rgba(0,115,115,.13)",
						rowSelectedHoverBg: "rgba(0,115,115,.13)",
					},
				},
				}}
			>
			<PublicationTargetTypes />
			<PublicationList />
		</ConfigProvider>
    </Flex>
  );
};

export default General;
