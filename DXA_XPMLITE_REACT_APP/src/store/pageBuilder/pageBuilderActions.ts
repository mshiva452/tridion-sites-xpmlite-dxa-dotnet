import { createAsyncThunk } from "@reduxjs/toolkit";
import getService from "../../Services/getRequest";

export const fetchPageTypes = createAsyncThunk<any, string>("pageInfo/fetchPageTypes", async (id, { rejectWithValue }) => {
    try {
        const response = await getService.getFolderItems(id);
        return response?.data
    } catch (error: any) {
        console.error(`Error fetching page types for ID: ${id}`, error);
        return rejectWithValue(error?.response?.data || "Failed to fetch page types");
    }
})