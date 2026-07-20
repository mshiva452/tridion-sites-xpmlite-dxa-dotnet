import React from "react";

import FooterBar from "./Components/FooterBar";
import PageBuilder from "./Components/PageBuilder/Index";
import PageDrawer from "./Components/PageInfo/PageDrawer";
import { usePageId } from './hooks/usePageId';
import { useAppSelector } from './store/connect';
import "./App.css";

const isStaging = String(window.getConfig().staging).toLowerCase() === "true"

const App:React.FC = () => {
    const {showPageBuilder, showPageInfo,pageId} = useAppSelector(state => state.pageReducer)
    const pathName = window.location.pathname;
    usePageId(pathName);
    const hasValidPage = pageId !== undefined && pageId !== null;
    if (!isStaging) {
        return 
    }
    return (
        <div id="tridion-bar" className="fixed-bottom">
            { showPageInfo && hasValidPage && <PageDrawer /> }
            { showPageBuilder && hasValidPage && <PageBuilder /> }
            <FooterBar />
        </div>
    )
}

export default App
