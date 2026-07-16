import formatTcmId from "../utils/formatTcmId";
import getItems from "./getRequest";
import postServices from "./postRequest";
import putServices from "./putRquest";
// Component Page
export const checkout = async <P>(tcmid: P) => {
    const checkoutResponse = await postServices.checkout(`${tcmid}/checkOut`);
    // console.log(checkoutResponse);
    if (checkoutResponse && checkoutResponse.status === 200) {
        return checkoutResponse
    }
}

//Save Page
export const updatePublishPage = async <T extends { Id: string }>(pageData: T) => {
    const updatedPageData = pageData;
    const pageid = updatedPageData.Id as string;
    const tcmid = formatTcmId(pageid)
    const pageResponse = await putServices.putRequest(tcmid, updatedPageData);
    if (pageResponse.status === 200) {
        return pageResponse;
    }
}

//Publish component
export const publish = async <T>(publishData: T) => {
    const publishResponse = await postServices.publish(publishData);
    if (publishResponse && publishResponse.status === 202) {
        return publishResponse;
    }
}

//Publish Status
export const getPublishStatus = async (tcmId: string) => {
    const publishStatus = await getItems.getItems(tcmId)
    return publishStatus;
}