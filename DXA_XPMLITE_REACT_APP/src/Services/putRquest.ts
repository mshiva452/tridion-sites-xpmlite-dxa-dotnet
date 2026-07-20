import { AxiosResponse } from "axios";
import axiosClient from "../oauth/apiClient";
import formatTcmId from "../utils/formatTcmId";

interface IIdentifiable {
  Id: string;
}

const putService = {
    putRequest: async <T>(url: string, data: T): Promise<AxiosResponse> => { 
        return await axiosClient.put(`/items/${url}`, data);
    },

    updatePublishPage: async <T extends IIdentifiable>(pageData: T): Promise<AxiosResponse | undefined> => {
        const tcmId = formatTcmId(pageData.Id);
        const pageResponse = await putService.putRequest(tcmId, pageData);
        if (pageResponse.status === 200) {
            return pageResponse;
        }
    }
}

export default putService;