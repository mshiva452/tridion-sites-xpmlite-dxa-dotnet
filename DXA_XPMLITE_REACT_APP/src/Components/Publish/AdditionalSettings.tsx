import { Radio, RadioChangeEvent, Select } from "antd";

import { useAppDispatch, useAppSelector } from "../../store/connect";
import { setAdditionalSettings, setPublishPriority } from "../../store/publish/publishSlice";

interface AdditionalSettings{
    [linkedItems:string]:number
}

const AdditionalSettings = () => {
    const dispatch = useAppDispatch()
    const {publishPriority, additionalSettings} = useAppSelector(state => state.publishReducer)
    const handleRadioChange =  (e: RadioChangeEvent) => {
        const settings = {...additionalSettings} 
        const mergeSettings = {...settings, [e.target.name as string] :  e.target.value as number}
        dispatch(setAdditionalSettings(mergeSettings));
    }

    const handlePriority = (value:string) => {
        dispatch(setPublishPriority(value));
    }
    return (
        <div>
            <div>
                <div className="additional-publish-settings-heading">Dependent items</div>
                <Radio.Group className="additional-settings-radio-group" name="linkedItems" value={additionalSettings['linkedItems']} onChange={handleRadioChange}>
                    <Radio name="linkedItems" value={1}>Also publish or republish all items that link to items you are publishing</Radio>
                    <Radio name="linkedItems" value={2}>Do not publish or republish any items that link to items you are publishing</Radio>
                </Radio.Group>
            </div>
            <div>
                <div className="additional-publish-settings-heading">Items in progress</div>
                <Radio.Group className="additional-settings-radio-group" name="itemsInProgress" value={additionalSettings['itemsInProgress']} onChange={handleRadioChange}>
                    <Radio name="itemsInProgress" value={1}>Only publish the checked-in versions of items</Radio>
                    <Radio name="itemsInProgress" value={2}>Publish the checked-out or in-workflow versions of items if available</Radio>
                </Radio.Group>
            </div>
            <div>
                <div className="additional-publish-settings-heading">Publishing priority</div>
                <Radio.Group className="additional-settings-radio-group" name="overridePriority" value={additionalSettings['overridePriority']} onChange={handleRadioChange}>
                    <Radio name="overridePriority" value={1}>Apply publish priority set on target type</Radio>
                    <Radio name="overridePriority" value={2}>Override publish priority</Radio>
                </Radio.Group> 
                <Select 
                    style={{width:200}}
                    defaultValue="Normal" 
                    onChange={handlePriority}
                    value={publishPriority}
                    disabled={additionalSettings['overridePriority']===1 ? true : false}
                    options={[
                        {
                            value:"Low", label:"Low"
                        },
                        {
                            value:"Normal", label:"Normal"
                        },
                        {
                            value:"High", label:"High"
                        }
                    ]}
                /> 
            </div>
        </div>
    )
}

export default AdditionalSettings