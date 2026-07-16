import { configureStore } from "@reduxjs/toolkit";
import publishSlice from "./publish/publishSlice";
import pageInfoSlice from "./pageInfo/pageInfoSlice";
import pageSlice from "./page/pageSlice";
import pageBuilderSlice from "./pageBuilder/pageBuilderSlice";

export const store = configureStore({
    reducer:{
        pageReducer:pageSlice,
        publishReducer:publishSlice,
        pageInfoReducer:pageInfoSlice,
        pageBuilderReducer:pageBuilderSlice
    },
    middleware:(getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck:false
        })
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch