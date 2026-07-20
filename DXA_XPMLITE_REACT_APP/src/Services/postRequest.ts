import dayjs from "dayjs"
import axiosClient from "../oauth/apiClient";
import formatTcmId from "../utils/formatTcmId";
import putService from "./putRquest";
import { AxiosResponse } from "axios";

const postService = {
    postRequest : async <T>(url: string, data: T): Promise<AxiosResponse> => {
        return await axiosClient.post(`/items/${url}`, data);
    },
    // checkout item
    checkout: async (tcmId: string): Promise<AxiosResponse | undefined> => {
        const checkoutResponse = await postService.postRequest(`${tcmId}/checkOut`, {});
        if (checkoutResponse.status === 200) {
            return checkoutResponse
        }
    },
    savePage: async <T>(data: T): Promise<AxiosResponse> => {
        return await axiosClient.post( `/items?autoCheckIn=true`, data)
    },
    cloneComponent: async (query: string, pageName: string, componentTitle: string): Promise<AxiosResponse | undefined> => {
        const response  = await axiosClient.post(`/items/${query}`);
        
        if (response?.status === 200 && response.data?.Id) {
            const targetId = formatTcmId(response.data.Id);
            const checkoutResponse = await postService.checkout(targetId);

            if (checkoutResponse?.status === 200 && checkoutResponse.data) {
                const cleanTcmId = formatTcmId(checkoutResponse.data.Id);
                checkoutResponse.data.Title = `${pageName}-${componentTitle}`;
                return postService.updateComponent(cleanTcmId, checkoutResponse.data)
            }
        }
    },
    updateComponent : async (tcmId: string, data: any): Promise<AxiosResponse | undefined> => {
        const componentData = { ...data };
        try{
            const updateResponse = await putService.putRequest(tcmId, componentData);
            if (updateResponse.status === 200 && updateResponse.data?.Id) {
                const checkInId = formatTcmId(updateResponse.data.Id)
                return await postService.componentCheckIn(`${checkInId}/checkIn`);

            }
            return updateResponse
        }catch(error:any){
            console.error('Error during component update lifecycle:', error?.response?.data?.message || error);
            componentData.Title = `${componentData.Title}-${dayjs().format('MM-DD-YYYY-hh-mm-ss')}`;
            return await postService.updateComponent(tcmId, componentData);
        }
    },
    componentCheckIn: async (url: string): Promise<AxiosResponse> => {
        const checkInPayload = { RemovePermanentLock: true };
        return await postService.postRequest(url, checkInPayload);
    },
    //Publish component
    publish: async <T>(publishData: T): Promise<AxiosResponse | undefined> => {
        const publishResponse = await postService.postRequest('publish', publishData);
        if (publishResponse.status === 202) {
            return publishResponse;
        }
    }
}

export default postService;




 

 

