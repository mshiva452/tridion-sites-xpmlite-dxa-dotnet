import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { fetchPageTypes } from "./pageBuilderActions";

export interface FormData {
    [key: string]: string | null;
}

export interface PageTypes{
    title:string;
    itemId:string;
    Image:string
}

export interface PageTemplates {
    label: string | null,
    value: string | null
}

interface StructureGroupIds {
  home: string | null;
  pageTypes: string | null;
}

interface PageBuilderState{
    isLoading:boolean;
    pageTypes:Record<string, unknown>[];
    structureGroupIds:StructureGroupIds;
    pageTypeList:PageTypes[];
    pageTypeId:string | null;
    selectedPageSchema:PageTemplates;
    selectedPageTemplate:PageTemplates;
    selectedPageType:PageTemplates;
    formData:FormData
}

const initialState:PageBuilderState={
    isLoading:true,
    pageTypes:[],
    structureGroupIds:{home:null, pageTypes:null},
    pageTypeList:[],
    pageTypeId:null,
    selectedPageSchema:{label:null, value:null},
    selectedPageTemplate:{label:null, value:null},
    selectedPageType:{label:null, value:null},
    formData:{ pagename: "New Page", filename: null}
}
const pageBuilderSlice = createSlice({
    name:"pageBuilder",
    initialState,
    reducers:{
        setStructureIds : (state, action: PayloadAction<StructureGroupIds>) => {
            state.structureGroupIds = action.payload
        },
        setPageTypeList: (state, action: PayloadAction<PageTypes[]>) => {
            state.pageTypeList = action.payload
        },
        setPageTypeId: (state, action: PayloadAction<string | null>) => {
            state.pageTypeId = action.payload
        },
        setSelectedPageSchema: (state, action: PayloadAction<PageTemplates>) => {
            state.selectedPageSchema = action.payload
        },
        setSelectedPageTemplate: (state, action: PayloadAction<PageTemplates>) => {
            state.selectedPageTemplate = action.payload
        },
        setSelectedPageType: (state, action: PayloadAction<PageTemplates>) => {
            state.selectedPageType = action.payload
        },
        setFormData: (state, action: PayloadAction<FormData>) => {
            state.formData = action.payload
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        }
    },
    extraReducers(builder) {
        builder.addCase(fetchPageTypes.pending, (state) => {
         state.isLoading = true
        })
        builder.addCase(fetchPageTypes.fulfilled, (state, action) => {
         state.pageTypes = action.payload || [];
         state.isLoading = false
        })
        builder.addCase(fetchPageTypes.rejected, (state) => {
            state.isLoading = false
        }) 
     },
})

export const {
        setStructureIds, 
        setPageTypeList, 
        setPageTypeId, 
        setSelectedPageSchema, 
        setSelectedPageTemplate, 
        setSelectedPageType, 
        setFormData, 
        setLoading
    } = pageBuilderSlice.actions;
    
export default pageBuilderSlice.reducer
