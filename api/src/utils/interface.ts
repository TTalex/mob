import {SUBSCRIPTION_STATUS, EVENT_MESSAGE, GENDER, StatusCode, FUNDER_TYPE} from '.';

import {SubscriptionRejection, SubscriptionValidation} from '../models';
import {PersonalInformation} from '../models/citizen/personalInformation.model';

import {securityId, UserProfile} from '@loopback/security';
import {Identity} from '../models/citizen/identity.model';

/** DASHBOARDS */
export interface IDashboardCitizenIncentiveList {
  incentiveId: string;
  incentiveTitle: string;
  totalSubscriptionsCount: number;
  validatedSubscriptionPercentage: number;
}

export interface IDashboardCitizen {
  incentiveList: IDashboardCitizenIncentiveList[];
  totalCitizensCount: number;
}

export interface IDashboardSubscriptionResult {
  status: SUBSCRIPTION_STATUS;
  count: number;
}

export interface IDashboardSubscription {
  result: IDashboardSubscriptionResult[];
  totalCount: number;
  totalPending: {
    count: number;
  };
}

/** RABBITMQ */
export interface ISubscriptionPublishPayload {
  lastName: string;
  firstName: string;
  birthdate: string;
  citizenId: string;
  incentiveId: string;
  subscriptionId: string;
  email: string | null;
  status: SUBSCRIPTION_STATUS;
  communityName: string;
  specificFields: string;
  attachments: string[];
  error?: ISubscriptionBusError;
  encryptionKeyId: string;
  encryptionKeyVersion: number;
  encryptedAESKey: string;
  encryptedIV: string;
}

/** EVENT EMITTER */
export interface IMessage {
  type: EVENT_MESSAGE;
  data?: any;
}

export interface ClientOfConsent {
  clientId?: string;
  name?: string;
}

export interface Consent {
  clientId?: string;
}
export interface IPublishPayload {
  subscription: ISubscriptionPublishPayload;
  enterprise: string;
}

export interface ISubscriptionBusError {
  message?: string;
  property?: string;
  code?: string;
}

/** USER CONTROLLER */
export interface IUsersResult {
  funderType: string;
  communityName: string | null;
  funderName: string | undefined;
  roles: string;
  id: string;
  funderId: string;
  communityIds: string[];
  email: string;
  firstName: string;
  lastName: string;
}

export interface ICreate {
  id: string | undefined;
  email?: string;
  lastName?: string;
  firstName?: string;
}

/** Incentive Controller */
export interface IScore {
  score: {
    $meta: string;
  };
  updatedAt?: undefined;
}

export interface IFunderName {
  funderName: number;
  score?: undefined;
}

/** Funder Controller */
export interface IFindCommunities {
  funderType: string;
  funderName: string | undefined;
  id: string;
  name: string;
  funderId: string;
}

/** Subscription Service */

export interface IDataInterface {
  citizenId: string;
  subscriptionId: string;
  status: SUBSCRIPTION_STATUS;
  mode: string;
  frequency: string;
  amount: number;
  lastPayment: string;
  comments: string;
  type: string;
  other: string;
}

/**  SubscriptionV1 Controller */
export interface MaasSubscriptionList {
  id: string;
  incentiveId: string;
  incentiveTitle: string;
  funderName: string;
  status: SUBSCRIPTION_STATUS;
  createdAt: Date;
  updatedAt: Date;
  subscriptionValidation?: SubscriptionValidation;
  subscriptionRejection?: SubscriptionRejection;
  contact: string | undefined;
}

/** Authentication Service */
export interface IUser extends UserProfile {
  [securityId]: string;
  id: string;
  emailVerified: boolean | undefined;
  funderName?: string;
  funderType?: FUNDER_TYPE;
  clientName?: string;
  roles?: string[];
  key?: string;
  groups?: string[];
}

/** Keycloak Service */
export interface User {
  email: string;
  password?: string;
  funderName?: string;
  lastName: string;
  firstName: string;
  group: string[];
  birthdate?: string;
  gender?: GENDER;
  identity?: Identity;
  personalInformation?: PersonalInformation;
}

/** GeoApiGouv Service */
export interface IGeoApiGouvRequestParam {
  nom: string;
  codePostal: string;
  format: string;
  fields: string;
}
export interface IGeoApiGouvResponseResult {
  nom: string;
  code: string;
  codeRegion: string;
  codeDepartement: string;
  _score: number;
}

type shortDistance = 'short';
type longDistance = 'long';

export interface ShortDistanceData {
  journey_type: shortDistance;
  identity_key: string;
  driving_license: string;
  last_name_trunc: string;
  operator_journey_id: string;
  application_timestamp: string;
}

export interface LongDistanceData {
  journey_type: longDistance;
  identity_key: string;
  driving_license: string;
  last_name_trunc: string;
  phone_trunc: string;
  datetime: string;
  application_timestamp: string;
}

export type OperatorData = ShortDistanceData | LongDistanceData;

export interface CeeResponseOnSuccess {
  datetime: string;
  uuid: string;
  token: string;
  journey_id?: number;
  status?: string;
}

export interface CeeResponseOnConflict {
  datetime: string;
  uuid: string;
}

export interface RpcReturnedData {
  status: 'error' | 'success';
  code?: StatusCode;
  data?: CeeResponseOnSuccess | CeeResponseOnConflict;
  message?: string;
}

export type AdditionalProps = {
  [key: string]: string;
};

export interface PartialCitizen {
  id: string;
  lastName: string;
  firstName: string;
  birthdate: string;
  email: string;
  isCitizenDeleted: boolean;
  enterpriseEmail?: string;
}
