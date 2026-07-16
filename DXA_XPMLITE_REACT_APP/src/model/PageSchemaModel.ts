export interface PageSchema {
    $type:                         string;
    Id:                            string;
    Title:                         string;
    AllowedMultimediaTypes:        any[];
    ApplicableActions:             ApplicableAction[];
    BluePrintInfo:                 BluePrintInfo;
    BundleProcess:                 BundleProcess;
    ComponentProcess:              BundleProcess;
    DeleteBundleOnProcessFinished: boolean;
    Description:                   string;
    ExtensionProperties:           ExtensionProperties;
    Fields:                        ExtensionProperties;
    IsEditable:                    boolean;
    IsIndexable:                   boolean;
    IsPublishable:                 boolean;
    IsPublishedInContext:          boolean;
    IsTridionWebSchema:            boolean;
    ListLinks:                     ApplicableAction[];
    LoadInfo:                      LoadInfo;
    Locale:                        string;
    LocationInfo:                  LocationInfo;
    LockInfo:                      LockInfo;
    Metadata:                      ExtensionProperties;
    MetadataFields:                PageSchemaMetadataFields;
    MetadataSchema:                BundleProcess;
    NamespaceUri:                  string;
    Purpose:                       string;
    RegionDefinition:              RegionDefinition;
    RootElementName:               string;
    SecurityDescriptor:            SecurityDescriptor;
    VersionInfo:                   VersionInfo;
}

export interface ApplicableAction {
    $type: ApplicableActionType;
    Href:  string;
    Rel:   string;
    Type:  string;
}

export enum ApplicableActionType {
    HateoasLink = "HateoasLink",
}

export interface BluePrintInfo {
    $type:                      string;
    IsLocalized:                boolean;
    IsShared:                   boolean;
    OwningRepository:           BundleProcess;
    PrimaryBluePrintParentItem: BundleProcess;
}

export interface NestedRegion {
    $type:        string;
    IsMandatory:  boolean;
    RegionName:   string;
    RegionSchema: BundleProcess;
}

export interface ComponentPresentationConstraint {
    $type:                     ComponentPresentationConstraintType;
    BasedOnComponentTemplate?: BundleProcess;
    MaxOccurs?:                number;
    MinOccurs?:                number;
    BasedOnSchema?:            BundleProcess;
}

export interface RegionDefinition {
    $type:                            string;
    ComponentPresentationConstraints: ComponentPresentationConstraint[];
    DefaultComponentPresentations:    any[];
    IsLocalizable:                    boolean;
    NestedRegions:                    NestedRegion[];
}

export interface SEODescription {
    $type:                     string;
    Description:               string;
    ExtensionXml:              string;
    Height?:                   number;
    IsIndexable:               boolean;
    IsLocalizable:             boolean;
    IsPublishable:             boolean;
    MaxOccurs:                 number;
    MinOccurs:                 number;
    Name:                      string;
    UseForAutoClassification?: boolean;
    AllowAutoClassification?:  boolean;
    Category?:                 BundleProcess;
    List?:                     List;
}

export interface ExpandedDataMetadataFields {
    $type:     ExtensionPropertiesType;
    maxItems?: SEODescription;
}

export interface ExpandedData {
    $type:               string;
    Id:                  string;
    Title:               string;
    Description:         string;
    ExtensionProperties: ExtensionProperties;
    Fields:              ExtensionProperties;
    MetadataFields:      ExpandedDataMetadataFields;
    NamespaceUri:        string;
    Purpose:             string;
    RegionDefinition:    RegionDefinition;
    RootElementName:     string;
}

export interface BundleProcess {
    $type:         BundleProcessType;
    IdRef:         string;
    Title:         string;
    Description?:  string;
    ExpandedData?: ExpandedData;
}

export enum ComponentPresentationConstraintType {
    OccurrenceConstraint = "OccurrenceConstraint",
    TypeConstraint = "TypeConstraint",
}

export interface List {
    $type:  string;
    Height: number;
    Type:   string;
}

export enum ExtensionPropertiesType {
    ExtensionPropertyDictionary = "ExtensionPropertyDictionary",
    FieldsDefinitionDictionary = "FieldsDefinitionDictionary",
    FieldsValueDictionary = "FieldsValueDictionary",
}

export interface ExtensionProperties {
    $type: ExtensionPropertiesType;
}

export enum BundleProcessType {
    ExpandableLink = "ExpandableLink",
    Link = "Link",
}

export interface LoadInfo {
    $type:        string;
    ErrorMessage: string;
    ErrorType:    string;
    State:        string;
}

export interface LocationInfo {
    $type:              string;
    ContextRepository:  BundleProcess;
    OrganizationalItem: BundleProcess;
    Path:               string;
    WebDavUrl:          string;
}

export interface LockInfo {
    $type:    string;
    LockType: string[];
    LockUser: BundleProcess;
}

export interface PageSchemaMetadataFields {
    $type:          ExtensionPropertiesType;
    sitemapKeyword: SEODescription;
    seoKeywords:    SEODescription;
    seoDescription: SEODescription;
}

export interface SecurityDescriptor {
    $type:       string;
    Permissions: string[];
    Rights:      string[];
}

export interface VersionInfo {
    $type:         string;
    CheckOutUser:  BundleProcess;
    CreationDate:  Date;
    Creator:       BundleProcess;
    IsNew:         boolean;
    LastVersion:   number;
    LockType:      string[];
    Revision:      number;
    RevisionDate:  Date;
    Revisor:       BundleProcess;
    SystemComment: string;
    UserComment:   string;
    Version:       number;
}
