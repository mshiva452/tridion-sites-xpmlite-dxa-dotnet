import axios, { AxiosResponse } from "axios";
import axiosClient from "../oauth/apiClient";

const getService = {
    getItems: async (pageId: string): Promise<AxiosResponse> => { 
        return await axiosClient.get(`/items/${pageId}?useDynamicVersion=true`);
    },

    getFolderItems: async (folderId: string): Promise<AxiosResponse> => { 
        return await axiosClient.get(`/items/${folderId}/items?useDynamicVersion=true`);
    },

    getOrganizationalStructure: async (orgContentFolderId: string): Promise<AxiosResponse> => { 
       const url = `/items/${orgContentFolderId}/organizationalStructureTree?includeAllPublications=false&includeChildrenOnEveryLevel=true&groupCategoriesAndKeywords=false&groupBusinessProcessTypes=false&useDynamicVersion=true`
       //const url =  `/items/${orgContentFolderId}/items?useDynamicVersion=true&recursive=false&details=Contentless`
       return await axiosClient.get(url)
    },

    getComponentTemplates: async (schemaId: string): Promise<AxiosResponse> => { 
        return await axiosClient.get(`/items/${schemaId}/componentTemplateLinks`)
    },

   /*  getPublicationTarget: async () => {
        const siteurl = "https://dxa.tridiondemo.com" //window.location.origin
        const url = `/system/publishSourceByUrl?url=${siteurl}`;
        const response = await axiosClient.get(url)
        return response.data.TargetType.IdRef;
    }, */

    getPageContainerData: async (containerId: string): Promise<AxiosResponse> => { 
        return axiosClient.get(`/item/defaultModel/Page?containerId=${containerId}`);

    },

    getContentServiceData: async <T>(url: string, query:T): Promise<AxiosResponse> => { 
        const config= {
            headers:{
                "Content-Type": "application/json",
            }
        }
        return await axios.post(url, query, config);
    },

    getPublishedPageUrl: async (pageId: string): Promise<AxiosResponse> => { 
        return await axiosClient.get(`/items/${pageId}/publishUrls`);
    },

    getPublishableTargetTypes: async (businessProcessId: string): Promise<AxiosResponse> => { 
        return await axiosClient.get(`/items/${businessProcessId}/publishableTargetTypes`);
    },

    getChildPublications: async (pubId: string): Promise<AxiosResponse> => { 
        return await axiosClient.get(`/items/${pubId}/publishableChildPublications`);
    },
    //Publish Status
    getPublishStatus : async (tcmId: string): Promise<AxiosResponse> => { 
        return await getService.getItems(tcmId)
    }
}

export default getService;