import { createAsyncThunk } from "@reduxjs/toolkit";
import getService from "../../Services/getRequest";

export const fetchPageInfoData = createAsyncThunk<any, string>("pageInfo/fetchPageInfoData", async (pageId, { rejectWithValue }) => {
    try {
        const responseData = await getService.getItems(pageId);
        return responseData?.data
    } catch (error: any) {
        console.error(`Error fetching page info data for ID: ${pageId}`, error);
        return rejectWithValue(error?.response?.data || "Failed to fetch page info details");
    }
});

export const fetchComponentTemplatesData = createAsyncThunk<any, string>("pageInfo/fetchComponentTemplatesData", async (selectedComponentSchemaId, { rejectWithValue }) => {
    try {
        const response = await getService.getComponentTemplates(selectedComponentSchemaId)
        return response?.data
    } catch (error: any) {
        console.error(`Error fetching component templates for Schema ID: ${selectedComponentSchemaId}`, error);
        return rejectWithValue(error?.response?.data || "Failed to fetch component templates mapping rules");
    }
})