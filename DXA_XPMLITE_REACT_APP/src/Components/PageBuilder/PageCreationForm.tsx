import React, { useState, useEffect } from 'react'
import { Input, Select } from 'antd'
import { StarFilled } from '@ant-design/icons'

import { useAppDispatch, useAppSelector } from '../../store/connect';
import { setFormData, setSelectedPageSchema, setSelectedPageTemplate, setSelectedPageType } from '../../store/pageBuilder/pageBuilderSlice';
import formatTcmId from '../../utils/formatTcmId';

interface PageTemplates {
    label: string,
    value: string
}

interface PageTemplateProps {
    pageTemplate: any
    getPageTemplate: (tcmid: string) => void;
}

const mandatoryStarStyle: React.CSSProperties = {
    fontSize: '5px',
    verticalAlign: 'super',
    color: '#ff4d4f',
};

const fullWidthStyle: React.CSSProperties = {
    width: '100%',
};

const PageCreationForm: React.FC<PageTemplateProps> = ({ pageTemplate, getPageTemplate }) => {
    const dispatch = useAppDispatch()

    const { selectedPageSchema, selectedPageTemplate, pageTypes, selectedPageType, formData } = useAppSelector(state => state.pageBuilderReducer)
    const [templates, setTemplates] = useState<PageTemplates[]>([]);

    useEffect(() => {
        if (pageTypes && pageTypes.length !== 0) {
            const mappedTemplates = pageTypes.map((item) => ({
                label: item.Title,
                value: item.Id,
            }));
            setTemplates(mappedTemplates as PageTemplates[]);
        }
    }, [pageTypes])

    useEffect(() => {
        const activeTemplate = pageTemplate;
        if (activeTemplate) {
            if (activeTemplate.PageTemplate) {
                dispatch(setSelectedPageTemplate({
                    label: activeTemplate.PageTemplate.Title,
                    value: activeTemplate.PageTemplate.IdRef
                }))
            }
            if (activeTemplate.RegionSchema) {
                dispatch(setSelectedPageSchema({
                    label: pageTemplate.RegionSchema.Title,
                    value: pageTemplate.RegionSchema.IdRef
                }))
            }

        }
    }, [pageTemplate, dispatch])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        dispatch(setFormData({
            [name]: value
        }))
    }
    const handlePageTypeChange = (value: string, options: any) => {

        const tcmId = formatTcmId(value)
        const matchedTemplate = templates.find((item) => item.value === value);
        if (matchedTemplate) {
            getPageTemplate(tcmId);
            dispatch(setSelectedPageTemplate(matchedTemplate));
        }
        dispatch(setSelectedPageType({
            label: options?.label || '',
            value: options?.value || ''
        }));

    }
    return (
        <form className="page-creation-form" onSubmit={(e) => e.preventDefault()}>
            <div>
                <label>Name <StarFilled style={mandatoryStarStyle} /></label>
                <Input
                    type='text'
                    value={formData.pagename ?? 'New Page'}
                    name='pagename'
                    placeholder="Name"
                    onChange={handleInputChange}
                />
            </div>
            <div>
                <label>
                    File Name
                    <StarFilled style={mandatoryStarStyle} />
                </label>
                <Input
                    type="text"
                    name='filename'
                    value={formData.filename ?? ""}
                    placeholder="File Name"
                    addonAfter=".html"
                    onChange={handleInputChange}
                />
            </div>
            <div>
                <label>
                    Page Types
                    <StarFilled style={mandatoryStarStyle} />
                </label>
                <Select
                    placeholder='Page Types'
                    style={fullWidthStyle}
                    options={templates}
                    value={selectedPageType?.label || undefined}
                    data-template-id={selectedPageType?.value}
                    onChange={handlePageTypeChange}
                    disabled
                />
            </div>
            <div>
                <label>
                    Page Template
                </label>
                <Select
                    placeholder="Page Template"
                    style={fullWidthStyle}
                    value={selectedPageTemplate?.label || undefined}
                    disabled
                />
            </div>
            <div>
                <label>Page Schema:</label>
                <Select
                    placeholder="Select Schema"
                    style={fullWidthStyle}
                    value={selectedPageSchema?.label || undefined}
                    data-schema-id={selectedPageSchema?.value}
                    disabled
                />
            </div>
        </form>
    )
}

export default PageCreationForm