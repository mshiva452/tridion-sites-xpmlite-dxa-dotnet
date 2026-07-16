import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { fetchComponentTemplatesData, fetchPageInfoData } from "./pageinfoActions";
import { DataNode, SelectedComponentTemplate, SelectedKeys } from "../../model/PageModel";
import { PageInfo } from "../../model/PageInfoModel";

export interface ComponentTemplates {
    IdRef: string;
    Link: string;
    Title: string;
}
export interface ComponentTemplate {
    label: string | null,
    value: string | null
}
interface PageInfoState {
    isLoading: boolean;
    toggleModalTreeView: boolean;
    componentPresentation: DataNode[];
    selectedKeys: SelectedKeys;
    expandkeys: string[];
    selectedComponentRowKeys: React.Key[];
    selectedComponentTemplate: SelectedComponentTemplate[],
    pageInfoData: PageInfo | null,
    componentTemplates: ComponentTemplates[],
    updatedComponentTemplate: ComponentTemplate,
    errorLoading: string | null
}

const initialState: PageInfoState = {
    isLoading: false,
    toggleModalTreeView: false,
    componentPresentation: [],
    selectedKeys: { title: null, key: null, type: null },
    expandkeys: [],
    selectedComponentRowKeys: [],
    selectedComponentTemplate: [],
    pageInfoData: null,
    componentTemplates: [],
    updatedComponentTemplate: { label: null, value: null },
    errorLoading: null
}

const pageInfoSlice = createSlice({
    name: "pageInfo",
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        },
        setModalTreeView: (state, action: PayloadAction<boolean>) => {
            state.toggleModalTreeView = action.payload
        },
        setComponentPresentation: (state, action: PayloadAction<DataNode[]>) => {
            state.componentPresentation = action.payload
        },
        setSelectedKeys: (state, action: PayloadAction<SelectedKeys>) => {
            state.selectedKeys = action.payload
        },
        setExpandKeys: (state, action: PayloadAction<string[]>) => {
            state.expandkeys = action.payload
        },
        setSelectedComponentRowKeys: (state, action: PayloadAction<React.Key[]>) => {
            state.selectedComponentRowKeys = action.payload
        },
        setSelectedComponentTemplate: (state, action: PayloadAction<SelectedComponentTemplate[]>) => {
            state.selectedComponentTemplate = action.payload
        },
        updatePageInfodata: (state, action: PayloadAction<any>) => {
            state.pageInfoData = { ...action.payload };
        },
        setComponentTemplates: (state, action: PayloadAction<ComponentTemplates[]>) => {
            state.componentTemplates = action.payload
        },
        setUpdatedComponentTemplate: (state, action: PayloadAction<ComponentTemplate>) => {
            const { label, value } = action.payload;
            state.updatedComponentTemplate = { label, value };
        }
    },
    extraReducers(builder) {
        builder           
            .addCase(fetchPageInfoData.pending, (state) => {
                state.isLoading = true;
                state.errorLoading = null;
            })
            .addCase(fetchPageInfoData.fulfilled, (state, action) => {
                state.pageInfoData = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchPageInfoData.rejected, (state, action) => {
                state.errorLoading = (action.payload as string) || "Failed to fetch page info data";
                state.isLoading = false;
            })
           
            .addCase(fetchComponentTemplatesData.fulfilled, (state, action) => {
                state.componentTemplates = action.payload || [];
            })
            .addCase(fetchComponentTemplatesData.rejected, (state, action) => {
                state.errorLoading = (action.payload as string) || "Failed to fetch component templates";
            });
    },
})

export const {
    setModalTreeView,
    setComponentPresentation,
    setSelectedKeys,
    setExpandKeys,
    setSelectedComponentRowKeys,
    setSelectedComponentTemplate,
    updatePageInfodata,
    setLoading,
    setComponentTemplates,
    setUpdatedComponentTemplate
} = pageInfoSlice.actions;

export default pageInfoSlice.reducer