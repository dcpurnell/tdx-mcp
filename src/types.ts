// TDX API type definitions
// Start with essential fields; expand as the API surface grows.

// --- Auth ---

export interface LoginParams {
  username: string;
  password: string;
}

export interface AdminLoginParams {
  BEID: string;
  WebServicesKey: string;
}

// --- Client Config ---

export interface TdxConfig {
  baseUrl: string;
  appId: string;
  authMethod: "login" | "loginadmin";
  username?: string;
  password?: string;
  beid?: string;
  webServicesKey?: string;
}

// --- Ticket ---

export interface Ticket {
  ID: number;
  ParentID: number;
  ParentTitle: string;
  TypeID: number;
  TypeName: string;
  TypeCategoryID: number;
  TypeCategoryName: string;
  Classification: number;
  ClassificationName: string;
  FormID: number;
  FormName: string;
  Title: string;
  Description: string;
  Uri: string;
  AccountID: number;
  AccountName: string;
  SourceID: number;
  SourceName: string;
  StatusID: number;
  StatusName: string;
  StatusClass: string;
  ImpactID: number;
  ImpactName: string;
  UrgencyID: number;
  UrgencyName: string;
  PriorityID: number;
  PriorityName: string;
  PriorityOrder: number;
  SlaID: number;
  SlaName: string;
  SlaViolationStatus: string;
  IsSlaViolated: boolean;
  IsSlaRespondByViolated: boolean;
  IsSlaResolveByViolated: boolean;
  RespondByDate: string | null;
  ResolveByDate: string | null;
  SlaBeginDate: string | null;
  IsOnHold: boolean;
  PlacedOnHoldDate: string | null;
  GoesOffHoldDate: string | null;
  CreatedDate: string;
  CreatedUid: string;
  CreatedFullName: string;
  CreatedEmail: string;
  ModifiedDate: string;
  ModifiedUid: string;
  ModifiedFullName: string;
  RequestorName: string;
  RequestorFirstName: string;
  RequestorLastName: string;
  RequestorEmail: string;
  RequestorPhone: string;
  RequestorUid: string;
  ActualMinutes: number;
  DaysOld: number;
  ResponsibleFullName: string;
  ResponsibleEmail: string;
  ResponsibleUid: string;
  ResponsibleGroupID: number;
  ResponsibleGroupName: string;
  RespondedDate: string | null;
  RespondedUid: string;
  RespondedFullName: string;
  CompletedDate: string | null;
  CompletedUid: string;
  CompletedFullName: string;
  ReviewerUid: string;
  ReviewerFullName: string;
  ReviewerEmail: string;
  ReviewingGroupID: number;
  ReviewingGroupName: string;
  TimeBudget: number;
  ExpensesBudget: number;
  TimeBudgetUsed: number;
  ExpensesBudgetUsed: number;
  IsConvertedToTask: boolean;
  ConvertedToTaskDate: string | null;
  ConvertedToTaskUid: string;
  ConvertedToTaskFullName: string;
  TaskID: number;
  TaskTitle: string;
  TaskClassName: string;
  LocationID: number;
  LocationName: string;
  LocationRoomID: number;
  LocationRoomName: string;
  RefCode: string;
  ServiceID: number;
  ServiceName: string;
  ServiceOfferingID: number;
  ServiceOfferingName: string;
  ServiceCategoryID: number;
  ServiceCategoryName: string;
  ArticleID: number;
  ArticleSubject: string;
  ArticleStatus: string;
  ArticleCategoryPathNames: string;
  AppID: number;
  Attributes: TicketAttribute[];
  Attachments: TicketAttachment[];
  Tasks: unknown[];
  Notify: string[];
}

export interface TicketAttribute {
  ID: string;
  Name: string;
  Order: number;
  Description: string;
  SectionID: number;
  SectionName: string;
  FieldType: string;
  DataType: string;
  Choices: TicketAttributeChoice[];
  IsRequired: boolean;
  IsUpdatable: boolean;
  Value: string;
  ValueText: string;
  ChoicesText: string;
  ItemID: number;
}

export interface TicketAttributeChoice {
  ID: string;
  Name: string;
  IsActive: boolean;
  DateCreated: string;
  DateModified: string;
  Order: number;
}

export interface TicketAttachment {
  ID: string;
  AttachmentType: number;
  ItemID: number;
  CreatedDate: string;
  CreatedUid: string;
  CreatedFullName: string;
  Name: string;
  Size: number;
  Uri: string;
  ContentUri: string;
}

// --- Ticket Search ---

export interface TicketSearch {
  SearchText?: string;
  Classification?: number;
  MaxResults?: number;
  TicketClassification?: string;
  StatusIDs?: number[];
  PriorityIDs?: number[];
  UrgencyIDs?: number[];
  ImpactIDs?: number[];
  AccountIDs?: number[];
  TypeIDs?: number[];
  SourceIDs?: number[];
  ResponsibilityUids?: string[];
  ResponsibilityGroupIDs?: number[];
  RequestorUids?: string[];
  CreatedDateFrom?: string;
  CreatedDateTo?: string;
  ModifiedDateFrom?: string;
  ModifiedDateTo?: string;
  RespondByDateFrom?: string;
  RespondByDateTo?: string;
  ResolveByDateFrom?: string;
  ResolveByDateTo?: string;
  ClosedDateFrom?: string;
  ClosedDateTo?: string;
  SlaViolationStatus?: number;
  SlaIDs?: number[];
  IsOnHold?: boolean;
  CustomAttributes?: CustomAttributeSearch[];
}

export interface CustomAttributeSearch {
  ID: string;
  Value: string;
}

// --- Feed ---

export interface FeedEntry {
  ID: string;
  Body: string;
  CreatedDate: string;
  CreatedUid: string;
  CreatedFullName: string;
  CreatedEmail: string;
  IsPrivate: boolean;
  IsRichHtml: boolean;
  ItemID: number;
  ItemTitle: string;
  ItemTypeName: string;
  AppID: number;
  Notify: string[];
}

// --- Forms ---

export interface TicketForm {
  ID: number;
  AppID: number;
  Name: string;
  Description: string;
  IsActive: boolean;
}

// --- Resources ---

export interface EligibleAssignment {
  ID: string;
  Name: string;
  Value: string;
  Type: string;
}
