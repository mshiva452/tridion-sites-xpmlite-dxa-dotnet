import { useEffect, useMemo, useState } from 'react';
import { Flex, Select } from "antd";

import { useAppDispatch, useAppSelector } from '../../store/connect';
import { setSelectedComponentTemplate, setUpdatedComponentTemplate } from '../../store/pageInfo/pageInfoSlice';
import { IComponentTemplate } from '../../model/PageModel';

const ComponentTemplates = () => {
    const dispatch = useAppDispatch()
    const { selectedComponentTemplate, selectedComponentRowKeys, selectedKeys, componentTemplates, updatedComponentTemplate } = useAppSelector(state => state.pageInfoReducer);
    const constraints = selectedKeys?.constraints;
    const [allowSelectedItems, setAllowSelectedItems] = useState<boolean>(false)

    const allowedComponentTemplate = useMemo(() => {
        const templatesToMap = (constraints?.typeConstraint && constraints.typeConstraint.length !== 0) ? selectedComponentTemplate : componentTemplates;

        return templatesToMap?.map((item: any) => ({
            value: item.IdRef,
            label: item.Title
        })) || [];
    }, [constraints?.typeConstraint, selectedComponentTemplate, componentTemplates]);

    useEffect(() => {
        const filteredTemplates = componentTemplates?.filter((template: any) => {
            return constraints?.typeConstraint?.some(
                (constraint: any) => constraint.BasedOnComponentTemplate?.IdRef === template.IdRef
            );
        }) || [];
        dispatch(setSelectedComponentTemplate(filteredTemplates));

        if (filteredTemplates.length !== 0) {
            const defaultOption = {
                label: filteredTemplates[0].Title,
                value: filteredTemplates[0].IdRef
            } as IComponentTemplate;
            dispatch(setUpdatedComponentTemplate(defaultOption));
        }

        const hasConstraints = constraints?.typeConstraint && constraints.typeConstraint.length !== 0;
        if (hasConstraints && filteredTemplates.length !== 0) {
            setAllowSelectedItems(false);
        } else {
            const isAllowed = selectedComponentRowKeys?.length === 0 && componentTemplates?.length === 0;
            setAllowSelectedItems(isAllowed);
        }
    }, [componentTemplates, constraints?.typeConstraint, selectedComponentRowKeys?.length, dispatch]);

    const handleChange = (_value: any, option: any) => {
        dispatch(setUpdatedComponentTemplate(option));
    };

    const selectValue = updatedComponentTemplate?.label ?? "None";

    return (
        <Flex align='center' justify='flex-end' className='w-100 gap-2' style={{ marginTop: 10 }}>
            <label>
                Component Template
            </label>

            <Select
                style={{ width: 200 }}
                onChange={handleChange}
                value={selectValue}
                defaultValue={selectValue}
                disabled={allowSelectedItems}
                options={allowedComponentTemplate}
            />
        </Flex>
    )
}

export default ComponentTemplates