import { DatePicker, DatePickerProps, Radio, RadioChangeEvent, Table, TableProps } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { useAppDispatch, useAppSelector } from "../../store/connect";
import { setPublishDate, setPublishingSchedule, setSelectedPublishingTarget } from "../../store/publish/publishSlice";
interface DataType {
    name: string,
    Id: string
    key: string;
}
const targetTypesColumns: TableProps<DataType>['columns'] = [
    {
        title: 'TARGET TYPE',
        dataIndex: 'name',
        key: 'name',
        onCell: (record) => ({
            children: <span>{record.name}</span>
        })
    }
]
const publishingScheduleStyle: React.CSSProperties = { 
    display: "flex", 
    flexDirection: "column", 
    marginBottom: 5 
}
const PublicationTargetTypes = () => {
    const dispatch = useAppDispatch()
    const { publishDate, publishingSchedule, targetTypes } = useAppSelector(state => state.publishReducer);

    const handlePublishingSchedule = (e: RadioChangeEvent) => {
        dispatch(setPublishingSchedule(e.target.value))
    };
    const handleDateChange: DatePickerProps['onChange'] = (date) => {
        if (date !== null) {
            dispatch(setPublishDate(date as Dayjs))
        }
    };
    const targetSelection = {
        onChange: (selectedRowKeys: React.Key[]) => {
            dispatch(setSelectedPublishingTarget([...selectedRowKeys] as string[]))
        }
    };
    return (
        <div className="publicationTargetType" >
            <h3 className="publishTargetHeading">Select one or more target types to publish to:</h3>
            <Table
                bordered={true}
                columns={targetTypesColumns}
                dataSource={targetTypes}
                pagination={false}
                rowSelection={{
                    ...targetSelection
                }}
                style={{ height: 300, background: "none", }}
                rowClassName="publicationTargetRow"
            />
            <Radio.Group onChange={handlePublishingSchedule} style={publishingScheduleStyle} value={publishingSchedule}>
                <Radio value={1}>Publish immediately</Radio>
                <Radio value={2}>Publish later</Radio>
            </Radio.Group>
            <DatePicker
                disabled={publishingSchedule !== 2}
                onChange={handleDateChange}
                defaultValue={dayjs(publishDate)}
                format="MM/DD/YYYY hh:mm"
                showTime={{ defaultValue: dayjs(publishDate, 'hh:mm') }}
                style={{ width: "100%" }}
            />
        </div>
    )
}

export default PublicationTargetTypes
