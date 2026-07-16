import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import dayjs, { Dayjs } from "dayjs";
import { fetchChildPublications, fetchTargetTypes } from "./publishAction";

interface DataType {
    name: string,
    Id: string
    key: string;
}

interface IParentPublication {
    key: string,
    name: string,
    Id: string
}

interface AdditionalSettingsProps {
    [linkedItems: string]: number;
}

interface PublishState {
    parentPublication: IParentPublication;
    childPublications: DataType[];
    selectedChildPublications: string[];
    selectedPublishingTarget: string[];
    publishingSchedule: number;
    publishPriority: string;
    publishToCurrentPublication: boolean;
    publishDate: Dayjs | null;
    additionalSettings: AdditionalSettingsProps;
    targetTypes: DataType[];
    isLoading: boolean
}


const initialState: PublishState = {
    parentPublication: { key: "", name: "", Id: "" },
    childPublications: [],
    selectedChildPublications: [],
    selectedPublishingTarget: [],
    publishingSchedule: 1,
    publishPriority: "Normal",
    publishToCurrentPublication: true,
    publishDate: dayjs(),
    additionalSettings: {
        linkedItems: 1,
        itemsInProgress: 1,
        overridePriority: 1,
    },
    targetTypes: [],
    isLoading: false
}


const publishSlice = createSlice({
    name: "publish",
    initialState,
    reducers: {
        setChildPublications: (state, action: PayloadAction<DataType[]>) => {
            state.childPublications = action.payload
        },
        setSelectedChildPublications: (state, action: PayloadAction<string[]>) => {
            state.selectedChildPublications = action.payload
        },
        setSelectedPublishingTarget: (state, action: PayloadAction<string[]>) => {
            state.selectedPublishingTarget = action.payload
        },
        setPublishingSchedule: (state, action: PayloadAction<number>) => {
            state.publishingSchedule = action.payload
        },
        setPublishPriority: (state, action: PayloadAction<string>) => {
            state.publishPriority = action.payload
        },
        setCurrentPublicationToPublishing: (state, action: PayloadAction<boolean>) => {
            state.publishToCurrentPublication = action.payload
        },
        setPublishDate: (state, action: PayloadAction<Dayjs | null>) => {
            state.publishDate = action.payload
        },
        setAdditionalSettings: (state, action: PayloadAction<AdditionalSettingsProps>) => {
            state.additionalSettings = action.payload
        },
        setTargetTypes: (state, action: PayloadAction<DataType[]>) => {
            state.targetTypes = action.payload
        },
        setParentPublication: (state, action: PayloadAction<IParentPublication>) => {
            state.parentPublication = action.payload
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        }
    },
    extraReducers(builder) {
        builder
            .addCase(fetchTargetTypes.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchTargetTypes.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload) {
                    state.targetTypes = action.payload.publicationTarget;
                    state.parentPublication = action.payload.parentPublication;
                }
            })
            .addCase(fetchTargetTypes.rejected, (state) => {
                state.isLoading = false;
            });

        builder
            .addCase(fetchChildPublications.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchChildPublications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.childPublications = action.payload || [];
            })
            .addCase(fetchChildPublications.rejected, (state) => {
                state.isLoading = false;
            });
    },
})

export const {
    setChildPublications,
    setSelectedChildPublications,
    setSelectedPublishingTarget,
    setPublishingSchedule,
    setPublishPriority,
    setCurrentPublicationToPublishing,
    setPublishDate,
    setAdditionalSettings,
    setTargetTypes,
    setParentPublication,
    setLoading
} = publishSlice.actions;

export default publishSlice.reducer