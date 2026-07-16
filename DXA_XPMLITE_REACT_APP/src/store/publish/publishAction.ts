import { createAsyncThunk } from "@reduxjs/toolkit";
import getService from "../../Services/getRequest";
import formatTcmId from "../../utils/formatTcmId";
interface IChildPublication {
    Id: string;
    Title: string;
}

interface IMappedPublication {
    key: string;
    name: string;
    Id: string;
}

interface IFetchTargetTypesResponse {
    parentPublication: IMappedPublication;
    publicationTarget: IMappedPublication[];
}

export const fetchTargetTypes = createAsyncThunk<IFetchTargetTypesResponse | undefined, string>("publish/fetchTargetTypes", async (pageId, { dispatch, rejectWithValue }) => {
    try {
        const response = await getService.getItems(pageId);
        const owningRepositoryId = response.data?.BluePrintInfo?.OwningRepository?.IdRef;

        if (!owningRepositoryId) {
            return rejectWithValue("Owning repository ID missing from item blueprint data.");
        }

        const pubId = formatTcmId(owningRepositoryId);
        const publicationResponse = await getService.getItems(pubId);

        if (publicationResponse?.status === 200 && publicationResponse.data) {
            const businessProcessTypeId = formatTcmId(publicationResponse.data.BusinessProcessType?.IdRef || "");
            const publishingTargetTypes = await getService.getPublishableTargetTypes(businessProcessTypeId);

            const publicationTarget = (publishingTargetTypes?.data || []).map((item: Record<string, unknown>) => ({
                key: item.Id,
                name: item.Title,
                Id: item.Id
            }));

            const parentPublication = {
                key: publicationResponse.data.Id,
                name: publicationResponse.data.Title,
                Id: publicationResponse.data.Id
            };

            if (publicationResponse.data.HasChildren) {
                dispatch(fetchChildPublications(pubId));
            }
            return { parentPublication, publicationTarget };
        }
    } catch (error: any) {
        console.error("Error fetching publication target layout structures:", error);
        return rejectWithValue(error?.response?.data || "Failed to fetch target types");
    }
})

export const fetchChildPublications = createAsyncThunk<IMappedPublication[], string>("publish/fetchChildPublications", async (pubId, { rejectWithValue }) => {
    try {
        const childPublicationsResponse = await getService.getChildPublications(pubId);
        return (childPublicationsResponse.data || []).map((item: IChildPublication) => ({
            key: item.Id,
            name: item.Title,
            Id: item.Id,
        }));
    } catch (error: any) {
        console.error(`Error fetching child publications for ${pubId}:`, error);
        return rejectWithValue(error?.response?.data || "Failed to fetch child publications");
    }
})