export interface PageInfo {
    $type:                   string;
    Id:                      string;
    Title:                   string;
    ApplicableActions:       ApplicableAction[];
    ApprovalStatus:          ItemDetails;
    BluePrintInfo:           BluePrintInfo;
    ComponentPresentations:  any[];
    ExtensionProperties:     ExtensionProperties;
    FileName:                string;
    IsEditable:              boolean;
    IsPageTemplateInherited: boolean;
    IsPublishedInContext:    boolean;
    ListLinks:               ApplicableAction[];
    LoadInfo:                LoadInfo;
    Locale:                  string;
    LocationInfo:            LocationInfo;
    LockInfo:                LockInfo;
    Metadata:                PageInfoMetadata;
    MetadataSchema:          ItemDetails;
    PageTemplate:            ItemDetails;
    Regions:                 PageInfoRegion[];
    RegionSchema:            ItemDetails;
    SecurityDescriptor:      SecurityDescriptor;
    VersionInfo:             VersionInfo;
    WorkflowInfo:            WorkflowInfo;
}

export interface ApplicableAction {
    $type: ApplicableActionType;
    Href:  string;
    Rel:   string;
    Type:  Type;
}

export enum ApplicableActionType {
    HateoasLink = "HateoasLink",
}

export enum Type {
    Get = "GET",
    Post = "POST",
    Put = "PUT",
}

export interface ItemDetails {
    $type:        string;
    IdRef:        string;
    Title:        string;
    Description?: string;
}

export enum ApprovalStatusType {
    Link = "Link",
}

export interface BluePrintInfo {
    $type:                      string;
    IsLocalized:                boolean;
    IsShared:                   boolean;
    OwningRepository:           ItemDetails;
    PrimaryBluePrintParentItem: ItemDetails;
}

export interface ExtensionProperties {
    $type: string;
}

export interface LoadInfo {
    $type:        string;
    ErrorMessage: string;
    ErrorType:    string;
    State:        string;
}

export interface LocationInfo {
    $type:               string;
    ContextRepository:   ItemDetails;
    OrganizationalItem:  ItemDetails;
    Path:                string;
    PublishLocationPath: string;
    PublishLocationUrl:  string;
    PublishPath:         string;
    WebDavUrl:           string;
}

export interface LockInfo {
    $type:    string;
    LockType: string[];
    LockUser: ItemDetails;
}

export interface PageInfoMetadata {
    $type:          string;
    sitemapKeyword: null;
    seoKeywords:    null;
    seoDescription: null;
}

export interface PageInfoRegion {
    $type:                  string;
    ComponentPresentations: ComponentPresentation[];
    Metadata:               RegionMetadata;
    RegionName:             string;
    Regions:                RegionRegion[];
    RegionSchema:           ItemDetails;
}

export interface ComponentPresentation {
    $type:             string;
    Component:         ItemDetails;
    ComponentTemplate: ItemDetails;
    Conditions:        any[];
}

export interface RegionMetadata {
    $type:     string;
    maxItems?: string;
}

export interface RegionRegion {
    $type:                  string;
    ComponentPresentations: ComponentPresentation[];
    Metadata:               ExtensionProperties;
    RegionName:             string;
    Regions:                any[];
    RegionSchema:           ItemDetails;
}

export interface SecurityDescriptor {
    $type:       string;
    Permissions: string[];
    Rights:      string[];
}

export interface VersionInfo {
    $type:         string;
    CheckOutUser:  ItemDetails;
    CreationDate:  Date;
    Creator:       ItemDetails;
    IsNew:         boolean;
    LastVersion:   number;
    LockType:      string[];
    Revision:      number;
    RevisionDate:  Date;
    Revisor:       ItemDetails;
    SystemComment: string;
    UserComment:   string;
    Version:       number;
}

export interface WorkflowInfo {
    $type:                         string;
    ActivityConstraints:           string;
    ActivityDefinitionDescription: string;
    ActivityInstance:              ItemDetails;
    Assignee:                      ItemDetails;
    Performer:                     ItemDetails;
    PreviousMessage:               string;
    ProcessInstance:               ItemDetails;
}
