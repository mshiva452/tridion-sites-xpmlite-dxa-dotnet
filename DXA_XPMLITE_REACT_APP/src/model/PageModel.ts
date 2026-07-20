import { ReactNode } from "react";
import { Dayjs } from "dayjs";
export interface SelectedKeys {
    title: string | null,
    key: string | null,
    type: string | null,
    schemaTitle?: string,
    constraints?: {
        allowedSchema: string;
        maxOccurance: number;
        minOccurance: number;
        numberItemsExist: number;
        typeConstraint: TypeConstraint[]
    }
}

export interface TypeConstraint {
    type: string;
    title: string;
    id: string;
}

export interface IComponentTemplate {
    label: string,
    value: string
}

export interface IComponentTemplates {
    IdRef: string;
    Link: string;
    Title: string;
}
export interface SelectedComponentTemplate {
    IdRef: string | null,
    Title: string | null
}

export interface DataNode {
    title: string | ReactNode;
    type?: string;
    id: string,
    key: React.Key;
    icon: ReactNode,
    isLeaf?: boolean;
    children?: DataNode[];
}

export interface OAuth {
    code?: string;
    client_id: string;
    grant_type: string;
    redirect_uri: string;
    scope?: string;
    refresh_token?: string;
}

export interface IPublishData {
    Ids: string[],
    Priority: string,
    TargetIdsOrPurposes: string[],
    PublishInstruction: IPublishInstruction
}

interface IPublishInstruction {
    DeployAt?: Dayjs | null,
    ResolveInstruction: IResolveInstruction
}

interface IResolveInstruction {
    IncludeChildPublications: false,
    IncludeComponentLinks: true,
    IncludeCurrentPublication: true,
    IncludeDynamicVersion: false,
    IncludeWorkflow: false,
    PublishInChildPublications: string[],
    PublishNewContent: true
}