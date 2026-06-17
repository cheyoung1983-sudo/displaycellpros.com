import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface CreateForumTopicData {
  forumTopic_insert: ForumTopic_Key;
}

export interface CreateForumTopicVariables {
  title: string;
  description?: string | null;
}

export interface CreateNewUserData {
  user_insert: User_Key;
}

export interface CreateNewUserVariables {
  username: string;
  email: string;
  passwordHash: string;
}

export interface FavoriteService_Key {
  userId: UUIDString;
  serviceId: UUIDString;
  __typename?: 'FavoriteService_Key';
}

export interface FavoriteSupportGroup_Key {
  userId: UUIDString;
  supportGroupId: UUIDString;
  __typename?: 'FavoriteSupportGroup_Key';
}

export interface ForumTopic_Key {
  id: UUIDString;
  __typename?: 'ForumTopic_Key';
}

export interface GetUserProfileData {
  user?: {
    id: UUIDString;
    username: string;
    email: string;
    displayName?: string | null;
    bio?: string | null;
    profilePictureUrl?: string | null;
    location?: string | null;
    createdAt: TimestampString;
  } & User_Key;
}

export interface GetUserProfileVariables {
  id: UUIDString;
}

export interface ListAllServicesData {
  services: ({
    id: UUIDString;
    name: string;
    serviceType: string;
    address: string;
    phoneNumber: string;
    description?: string | null;
    website?: string | null;
    hoursOfOperation?: string | null;
    contactPerson?: string | null;
  } & Service_Key)[];
}

export interface Message_Key {
  id: UUIDString;
  __typename?: 'Message_Key';
}

export interface Post_Key {
  id: UUIDString;
  __typename?: 'Post_Key';
}

export interface Service_Key {
  id: UUIDString;
  __typename?: 'Service_Key';
}

export interface SupportGroup_Key {
  id: UUIDString;
  __typename?: 'SupportGroup_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'CreateNewUser' Mutation. Allow users to execute without passing in DataConnect. */
export function createNewUser(dc: DataConnect, vars: CreateNewUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateNewUserData>>;
/** Generated Node Admin SDK operation action function for the 'CreateNewUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function createNewUser(vars: CreateNewUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateNewUserData>>;

/** Generated Node Admin SDK operation action function for the 'GetUserProfile' Query. Allow users to execute without passing in DataConnect. */
export function getUserProfile(dc: DataConnect, vars: GetUserProfileVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserProfileData>>;
/** Generated Node Admin SDK operation action function for the 'GetUserProfile' Query. Allow users to pass in custom DataConnect instances. */
export function getUserProfile(vars: GetUserProfileVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserProfileData>>;

/** Generated Node Admin SDK operation action function for the 'CreateForumTopic' Mutation. Allow users to execute without passing in DataConnect. */
export function createForumTopic(dc: DataConnect, vars: CreateForumTopicVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateForumTopicData>>;
/** Generated Node Admin SDK operation action function for the 'CreateForumTopic' Mutation. Allow users to pass in custom DataConnect instances. */
export function createForumTopic(vars: CreateForumTopicVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateForumTopicData>>;

/** Generated Node Admin SDK operation action function for the 'ListAllServices' Query. Allow users to execute without passing in DataConnect. */
export function listAllServices(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListAllServicesData>>;
/** Generated Node Admin SDK operation action function for the 'ListAllServices' Query. Allow users to pass in custom DataConnect instances. */
export function listAllServices(options?: OperationOptions): Promise<ExecuteOperationResponse<ListAllServicesData>>;

