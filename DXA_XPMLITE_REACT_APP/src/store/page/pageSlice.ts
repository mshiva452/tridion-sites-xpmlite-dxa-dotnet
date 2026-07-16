import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface InitialsState {
    pageId: string | null;
    showPageInfo: boolean;
    showPageBuilder: boolean
}

const initialState: InitialsState = {
    pageId: null,
    showPageInfo: false,
    showPageBuilder: false
}

const pageSlice = createSlice({
    name: "page",
    initialState,
    reducers: {
        setPageId: (state, action: PayloadAction<string>) => {
            state.pageId = action.payload
        },
        togglePageInfo: (state, action: PayloadAction<boolean>) => {
            state.showPageInfo = action.payload
        },
        togglePageBuilder: (state, action: PayloadAction<boolean>) => {
            state.showPageBuilder = action.payload
        }
    }
})

export const { togglePageInfo, togglePageBuilder, setPageId } = pageSlice.actions;

export default pageSlice.reducer