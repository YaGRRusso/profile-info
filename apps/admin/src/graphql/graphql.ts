/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type BatchEntity = {
  __typename?: 'BatchEntity';
  count: Scalars['Int']['output'];
};

export type CreateEducationInput = {
  category: EducationCategory;
  hours?: InputMaybe<Scalars['Int']['input']>;
  i18n: Array<CreateEducationTranslationInput>;
  image?: InputMaybe<Scalars['String']['input']>;
  organization: Scalars['String']['input'];
  period?: InputMaybe<DateRangeInput>;
  relevance?: InputMaybe<Scalars['Float']['input']>;
  skills?: InputMaybe<Array<Scalars['String']['input']>>;
  slug: Scalars['String']['input'];
  status: EducationStatus;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type CreateEducationMessagesInput = {
  description: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateEducationTranslationInput = {
  locale: Scalars['String']['input'];
  messages: CreateEducationMessagesInput;
};

export type CreateExperienceInput = {
  category: ExperienceCategory;
  organization: Scalars['String']['input'];
  relevance?: InputMaybe<Scalars['Float']['input']>;
  roles: Array<CreateExperienceRoleInput>;
  slug: Scalars['String']['input'];
};

export type CreateExperienceMessagesInput = {
  description: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateExperienceRoleInput = {
  i18n: Array<CreateExperienceTranslationInput>;
  period?: InputMaybe<DateRangeInput>;
  skills?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CreateExperienceTranslationInput = {
  locale: Scalars['String']['input'];
  messages: CreateExperienceMessagesInput;
};

export type CreateOrganizationInput = {
  category: OrganizationCategory;
  logo: Scalars['String']['input'];
  name: Scalars['String']['input'];
  relevance?: InputMaybe<Scalars['Float']['input']>;
  slug: Scalars['String']['input'];
  website: Scalars['String']['input'];
};

export type CreateProjectInput = {
  i18n: Array<CreateProjectMessagesInputTranslationInput>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  relevance?: InputMaybe<Scalars['Float']['input']>;
  skills?: InputMaybe<Array<Scalars['String']['input']>>;
  slug: Scalars['String']['input'];
  urls?: InputMaybe<Array<UrlInput>>;
};

export type CreateProjectMessagesInput = {
  description: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateProjectMessagesInputTranslationInput = {
  locale: Scalars['String']['input'];
  messages: CreateProjectMessagesInput;
};

export type CreateSkillInput = {
  category: SkillCategory;
  name: Scalars['String']['input'];
  relevance?: InputMaybe<Scalars['Float']['input']>;
  slug: Scalars['String']['input'];
};

export type CreateUserInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  birth?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  nickname: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<UrlInput>>;
};

export type DateRangeEntity = {
  __typename?: 'DateRangeEntity';
  from?: Maybe<Scalars['DateTime']['output']>;
  to?: Maybe<Scalars['DateTime']['output']>;
};

export type DateRangeInput = {
  from?: InputMaybe<Scalars['DateTime']['input']>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

export enum EducationCategory {
  Course = 'COURSE',
  Degree = 'DEGREE',
  Other = 'OTHER'
}

export type EducationEntity = {
  __typename?: 'EducationEntity';
  category: EducationCategory;
  createdAt: Scalars['DateTime']['output'];
  hours?: Maybe<Scalars['Int']['output']>;
  i18n: Array<EducationTranslationLocale>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  organization: OrganizationEntity;
  period?: Maybe<DateRangeEntity>;
  relevance?: Maybe<Scalars['Float']['output']>;
  skills?: Maybe<Array<SkillEntity>>;
  slug: Scalars['String']['output'];
  status: EducationStatus;
  updatedAt: Scalars['DateTime']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type EducationMessages = {
  __typename?: 'EducationMessages';
  description: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export enum EducationStatus {
  Complete = 'COMPLETE',
  Incomplete = 'INCOMPLETE',
  InProgress = 'IN_PROGRESS'
}

export type EducationTranslationLocale = {
  __typename?: 'EducationTranslationLocale';
  locale: Scalars['String']['output'];
  messages: EducationMessages;
};

export enum ExperienceCategory {
  Freelance = 'FREELANCE',
  FullTime = 'FULL_TIME',
  PartTime = 'PART_TIME',
  Volunteer = 'VOLUNTEER'
}

export type ExperienceEntity = {
  __typename?: 'ExperienceEntity';
  category: ExperienceCategory;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  organization: OrganizationEntity;
  relevance?: Maybe<Scalars['Float']['output']>;
  roles: Array<ExperienceRole>;
  skills?: Maybe<Array<SkillEntity>>;
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ExperienceMessages = {
  __typename?: 'ExperienceMessages';
  description: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ExperienceRole = {
  __typename?: 'ExperienceRole';
  i18n: Array<ExperienceTranslationLocale>;
  period?: Maybe<DateRangeEntity>;
  skills?: Maybe<Array<SkillEntity>>;
};

export type ExperienceTranslationLocale = {
  __typename?: 'ExperienceTranslationLocale';
  locale: Scalars['String']['output'];
  messages: ExperienceMessages;
};

export type FilterEducationInput = {
  category?: InputMaybe<EducationCategory>;
  hours?: InputMaybe<Scalars['Int']['input']>;
  i18n?: InputMaybe<Array<CreateEducationTranslationInput>>;
  image?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<DateRangeInput>;
  relevance?: InputMaybe<Scalars['Float']['input']>;
  skills?: InputMaybe<Array<Scalars['String']['input']>>;
  slug?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<EducationStatus>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type FilterExperienceInput = {
  category?: InputMaybe<ExperienceCategory>;
  organization?: InputMaybe<Scalars['String']['input']>;
  relevance?: InputMaybe<Scalars['Float']['input']>;
  roles?: InputMaybe<Array<CreateExperienceRoleInput>>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type FilterOrganizationInput = {
  category?: InputMaybe<OrganizationCategory>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  relevance?: InputMaybe<Scalars['Float']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type FilterProjectInput = {
  i18n?: InputMaybe<Array<CreateProjectMessagesInputTranslationInput>>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  relevance?: InputMaybe<Scalars['Float']['input']>;
  skills?: InputMaybe<Array<Scalars['String']['input']>>;
  slug?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<UrlInput>>;
};

export type FilterSkillInput = {
  category?: InputMaybe<SkillCategory>;
  name?: InputMaybe<Scalars['String']['input']>;
  relevance?: InputMaybe<Scalars['Float']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type FilterUserInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  birth?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<UrlInput>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createManyEducations: Array<EducationEntity>;
  createManyExperiences: Array<ExperienceEntity>;
  createManyOrganizations: Array<OrganizationEntity>;
  createManyProjects: Array<ProjectEntity>;
  createManySkills: Array<SkillEntity>;
  createManyUsers: Array<UserEntity>;
  createOneEducation: EducationEntity;
  createOneExperience: ExperienceEntity;
  createOneOrganization: OrganizationEntity;
  createOneProject: ProjectEntity;
  createOneSkill: SkillEntity;
  createOneUser: UserEntity;
  removeManyEducations: BatchEntity;
  removeManyExperiences: BatchEntity;
  removeManyOrganizations: BatchEntity;
  removeManyProjects: BatchEntity;
  removeManySkills: BatchEntity;
  removeManyUsers: BatchEntity;
  removeOneEducation: EducationEntity;
  removeOneExperience: ExperienceEntity;
  removeOneOrganization: OrganizationEntity;
  removeOneProject: ProjectEntity;
  removeOneSkill: SkillEntity;
  removeOneUser: UserEntity;
  signIn: Scalars['String']['output'];
  updateManyEducations: BatchEntity;
  updateManyExperiences: BatchEntity;
  updateManyOrganizations: BatchEntity;
  updateManyProjects: BatchEntity;
  updateManySkills: BatchEntity;
  updateManyUsers: BatchEntity;
  updateOneEducation: EducationEntity;
  updateOneExperience: ExperienceEntity;
  updateOneOrganization: OrganizationEntity;
  updateOneProject: ProjectEntity;
  updateOneSkill: SkillEntity;
  updateOneUser: UserEntity;
};


export type MutationCreateManyEducationsArgs = {
  createEducationInputs: Array<CreateEducationInput>;
};


export type MutationCreateManyExperiencesArgs = {
  createExperienceInputs: Array<CreateExperienceInput>;
};


export type MutationCreateManyOrganizationsArgs = {
  createOrganizationInputs: Array<CreateOrganizationInput>;
};


export type MutationCreateManyProjectsArgs = {
  createProjectInputs: Array<CreateProjectInput>;
};


export type MutationCreateManySkillsArgs = {
  createSkillInputs: Array<CreateSkillInput>;
};


export type MutationCreateManyUsersArgs = {
  createUserInputs: Array<CreateUserInput>;
};


export type MutationCreateOneEducationArgs = {
  createEducationInput: CreateEducationInput;
};


export type MutationCreateOneExperienceArgs = {
  createExperienceInput: CreateExperienceInput;
};


export type MutationCreateOneOrganizationArgs = {
  createOrganizationInput: CreateOrganizationInput;
};


export type MutationCreateOneProjectArgs = {
  createProjectInput: CreateProjectInput;
};


export type MutationCreateOneSkillArgs = {
  createSkillInput: CreateSkillInput;
};


export type MutationCreateOneUserArgs = {
  createUserInput: CreateUserInput;
};


export type MutationRemoveManyEducationsArgs = {
  EducationIds: Array<Scalars['ID']['input']>;
};


export type MutationRemoveManyExperiencesArgs = {
  ExperienceIds: Array<Scalars['ID']['input']>;
};


export type MutationRemoveManyOrganizationsArgs = {
  OrganizationIds: Array<Scalars['ID']['input']>;
};


export type MutationRemoveManyProjectsArgs = {
  ProjectIds: Array<Scalars['ID']['input']>;
};


export type MutationRemoveManySkillsArgs = {
  SkillIds: Array<Scalars['ID']['input']>;
};


export type MutationRemoveManyUsersArgs = {
  UserIds: Array<Scalars['ID']['input']>;
};


export type MutationRemoveOneEducationArgs = {
  EducationId: Scalars['ID']['input'];
};


export type MutationRemoveOneExperienceArgs = {
  ExperienceId: Scalars['ID']['input'];
};


export type MutationRemoveOneOrganizationArgs = {
  OrganizationId: Scalars['ID']['input'];
};


export type MutationRemoveOneProjectArgs = {
  ProjectId: Scalars['ID']['input'];
};


export type MutationRemoveOneSkillArgs = {
  SkillId: Scalars['ID']['input'];
};


export type MutationRemoveOneUserArgs = {
  UserId: Scalars['ID']['input'];
};


export type MutationSignInArgs = {
  signInInput: SignInInput;
};


export type MutationUpdateManyEducationsArgs = {
  EducationIds: Array<Scalars['ID']['input']>;
  updateEducationInput: UpdateEducationInput;
};


export type MutationUpdateManyExperiencesArgs = {
  ExperienceIds: Array<Scalars['ID']['input']>;
  updateExperienceInput: UpdateExperienceInput;
};


export type MutationUpdateManyOrganizationsArgs = {
  OrganizationIds: Array<Scalars['ID']['input']>;
  updateOrganizationInput: UpdateOrganizationInput;
};


export type MutationUpdateManyProjectsArgs = {
  ProjectIds: Array<Scalars['ID']['input']>;
  updateProjectInput: UpdateProjectInput;
};


export type MutationUpdateManySkillsArgs = {
  SkillIds: Array<Scalars['ID']['input']>;
  updateSkillInput: UpdateSkillInput;
};


export type MutationUpdateManyUsersArgs = {
  UserIds: Array<Scalars['ID']['input']>;
  updateUserInput: UpdateUserInput;
};


export type MutationUpdateOneEducationArgs = {
  EducationId: Scalars['ID']['input'];
  updateEducationInput: UpdateEducationInput;
};


export type MutationUpdateOneExperienceArgs = {
  ExperienceId: Scalars['ID']['input'];
  updateExperienceInput: UpdateExperienceInput;
};


export type MutationUpdateOneOrganizationArgs = {
  OrganizationId: Scalars['ID']['input'];
  updateOrganizationInput: UpdateOrganizationInput;
};


export type MutationUpdateOneProjectArgs = {
  ProjectId: Scalars['ID']['input'];
  updateProjectInput: UpdateProjectInput;
};


export type MutationUpdateOneSkillArgs = {
  SkillId: Scalars['ID']['input'];
  updateSkillInput: UpdateSkillInput;
};


export type MutationUpdateOneUserArgs = {
  UserId: Scalars['ID']['input'];
  updateUserInput: UpdateUserInput;
};

export enum OrganizationCategory {
  Company = 'COMPANY',
  Other = 'OTHER',
  School = 'SCHOOL'
}

export type OrganizationEntity = {
  __typename?: 'OrganizationEntity';
  category: OrganizationCategory;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  logo: Scalars['String']['output'];
  name: Scalars['String']['output'];
  relevance?: Maybe<Scalars['Float']['output']>;
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  website: Scalars['String']['output'];
};

export type PaginatedEducationEntity = {
  __typename?: 'PaginatedEducationEntity';
  found: Scalars['Float']['output'];
  nodes: Array<EducationEntity>;
};

export type PaginatedExperienceEntity = {
  __typename?: 'PaginatedExperienceEntity';
  found: Scalars['Float']['output'];
  nodes: Array<ExperienceEntity>;
};

export type PaginatedOrganizationEntity = {
  __typename?: 'PaginatedOrganizationEntity';
  found: Scalars['Float']['output'];
  nodes: Array<OrganizationEntity>;
};

export type PaginatedProjectEntity = {
  __typename?: 'PaginatedProjectEntity';
  found: Scalars['Float']['output'];
  nodes: Array<ProjectEntity>;
};

export type PaginatedSkillEntity = {
  __typename?: 'PaginatedSkillEntity';
  found: Scalars['Float']['output'];
  nodes: Array<SkillEntity>;
};

export type PaginatedUserEntity = {
  __typename?: 'PaginatedUserEntity';
  found: Scalars['Float']['output'];
  nodes: Array<UserEntity>;
};

export type PaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type ProjectEntity = {
  __typename?: 'ProjectEntity';
  createdAt: Scalars['DateTime']['output'];
  i18n: Array<ProjectMessagesTranslationEntity>;
  id: Scalars['ID']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  relevance?: Maybe<Scalars['Float']['output']>;
  skills?: Maybe<Array<SkillEntity>>;
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  urls?: Maybe<Array<UrlEntity>>;
};

export type ProjectMessages = {
  __typename?: 'ProjectMessages';
  description: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ProjectMessagesTranslationEntity = {
  __typename?: 'ProjectMessagesTranslationEntity';
  locale: Scalars['String']['output'];
  messages: ProjectMessages;
};

export type Query = {
  __typename?: 'Query';
  findManyEducationById: Array<EducationEntity>;
  findManyEducations: PaginatedEducationEntity;
  findManyExperienceById: Array<ExperienceEntity>;
  findManyExperiences: PaginatedExperienceEntity;
  findManyOrganizationById: Array<OrganizationEntity>;
  findManyOrganizations: PaginatedOrganizationEntity;
  findManyProjectById: Array<ProjectEntity>;
  findManyProjects: PaginatedProjectEntity;
  findManySkillById: Array<SkillEntity>;
  findManySkills: PaginatedSkillEntity;
  findManyUserById: Array<UserEntity>;
  findManyUsers: PaginatedUserEntity;
  findOneEducation: EducationEntity;
  findOneEducationById: EducationEntity;
  findOneExperience: ExperienceEntity;
  findOneExperienceById: ExperienceEntity;
  findOneOrganization: OrganizationEntity;
  findOneOrganizationById: OrganizationEntity;
  findOneProject: ProjectEntity;
  findOneProjectById: ProjectEntity;
  findOneSkill: SkillEntity;
  findOneSkillById: SkillEntity;
  findOneUser: UserEntity;
  findOneUserById: UserEntity;
  getMe: UserEntity;
};


export type QueryFindManyEducationByIdArgs = {
  EducationIds: Array<Scalars['ID']['input']>;
};


export type QueryFindManyEducationsArgs = {
  EducationFilters?: InputMaybe<FilterEducationInput>;
  EducationPagination?: InputMaybe<PaginationInput>;
  EducationSort?: InputMaybe<SortEducationInput>;
};


export type QueryFindManyExperienceByIdArgs = {
  ExperienceIds: Array<Scalars['ID']['input']>;
};


export type QueryFindManyExperiencesArgs = {
  ExperienceFilters?: InputMaybe<FilterExperienceInput>;
  ExperiencePagination?: InputMaybe<PaginationInput>;
  ExperienceSort?: InputMaybe<SortExperienceInput>;
};


export type QueryFindManyOrganizationByIdArgs = {
  OrganizationIds: Array<Scalars['ID']['input']>;
};


export type QueryFindManyOrganizationsArgs = {
  OrganizationFilters?: InputMaybe<FilterOrganizationInput>;
  OrganizationPagination?: InputMaybe<PaginationInput>;
  OrganizationSort?: InputMaybe<SortOrganizationInput>;
};


export type QueryFindManyProjectByIdArgs = {
  ProjectIds: Array<Scalars['ID']['input']>;
};


export type QueryFindManyProjectsArgs = {
  ProjectFilters?: InputMaybe<FilterProjectInput>;
  ProjectPagination?: InputMaybe<PaginationInput>;
  ProjectSort?: InputMaybe<SortProjectInput>;
};


export type QueryFindManySkillByIdArgs = {
  SkillIds: Array<Scalars['ID']['input']>;
};


export type QueryFindManySkillsArgs = {
  SkillFilters?: InputMaybe<FilterSkillInput>;
  SkillPagination?: InputMaybe<PaginationInput>;
  SkillSort?: InputMaybe<SortSkillInput>;
};


export type QueryFindManyUserByIdArgs = {
  UserIds: Array<Scalars['ID']['input']>;
};


export type QueryFindManyUsersArgs = {
  UserFilters?: InputMaybe<FilterUserInput>;
  UserPagination?: InputMaybe<PaginationInput>;
  UserSort?: InputMaybe<SortUserInput>;
};


export type QueryFindOneEducationArgs = {
  EducationFilters?: InputMaybe<FilterEducationInput>;
};


export type QueryFindOneEducationByIdArgs = {
  EducationId: Scalars['ID']['input'];
};


export type QueryFindOneExperienceArgs = {
  ExperienceFilters?: InputMaybe<FilterExperienceInput>;
};


export type QueryFindOneExperienceByIdArgs = {
  ExperienceId: Scalars['ID']['input'];
};


export type QueryFindOneOrganizationArgs = {
  OrganizationFilters?: InputMaybe<FilterOrganizationInput>;
};


export type QueryFindOneOrganizationByIdArgs = {
  OrganizationId: Scalars['ID']['input'];
};


export type QueryFindOneProjectArgs = {
  ProjectFilters?: InputMaybe<FilterProjectInput>;
};


export type QueryFindOneProjectByIdArgs = {
  ProjectId: Scalars['ID']['input'];
};


export type QueryFindOneSkillArgs = {
  SkillFilters?: InputMaybe<FilterSkillInput>;
};


export type QueryFindOneSkillByIdArgs = {
  SkillId: Scalars['ID']['input'];
};


export type QueryFindOneUserArgs = {
  UserFilters?: InputMaybe<FilterUserInput>;
};


export type QueryFindOneUserByIdArgs = {
  UserId: Scalars['ID']['input'];
};

export type SignInInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export enum SkillCategory {
  Backend = 'BACKEND',
  Concepts = 'CONCEPTS',
  Data = 'DATA',
  Design = 'DESIGN',
  Devops = 'DEVOPS',
  Frontend = 'FRONTEND',
  Language = 'LANGUAGE',
  Quality = 'QUALITY',
  Soft = 'SOFT'
}

export type SkillEntity = {
  __typename?: 'SkillEntity';
  category: SkillCategory;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  relevance?: Maybe<Scalars['Float']['output']>;
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type SortEducationInput = {
  createdAt?: InputMaybe<SortEnum>;
  relevance?: InputMaybe<SortEnum>;
  updatedAt?: InputMaybe<SortEnum>;
};

export enum SortEnum {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type SortExperienceInput = {
  createdAt?: InputMaybe<SortEnum>;
  relevance?: InputMaybe<SortEnum>;
  updatedAt?: InputMaybe<SortEnum>;
};

export type SortOrganizationInput = {
  createdAt?: InputMaybe<SortEnum>;
  name?: InputMaybe<SortEnum>;
  relevance?: InputMaybe<SortEnum>;
  updatedAt?: InputMaybe<SortEnum>;
};

export type SortProjectInput = {
  createdAt?: InputMaybe<SortEnum>;
  relevance?: InputMaybe<SortEnum>;
  updatedAt?: InputMaybe<SortEnum>;
};

export type SortSkillInput = {
  createdAt?: InputMaybe<SortEnum>;
  name?: InputMaybe<SortEnum>;
  relevance?: InputMaybe<SortEnum>;
  updatedAt?: InputMaybe<SortEnum>;
};

export type SortUserInput = {
  createdAt?: InputMaybe<SortEnum>;
  name?: InputMaybe<SortEnum>;
  updatedAt?: InputMaybe<SortEnum>;
};

export type UpdateEducationInput = {
  category?: InputMaybe<EducationCategory>;
  hours?: InputMaybe<Scalars['Int']['input']>;
  i18n?: InputMaybe<Array<CreateEducationTranslationInput>>;
  image?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<DateRangeInput>;
  relevance?: InputMaybe<Scalars['Float']['input']>;
  skills?: InputMaybe<Array<Scalars['String']['input']>>;
  slug?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<EducationStatus>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateExperienceInput = {
  category?: InputMaybe<ExperienceCategory>;
  organization?: InputMaybe<Scalars['String']['input']>;
  relevance?: InputMaybe<Scalars['Float']['input']>;
  roles?: InputMaybe<Array<CreateExperienceRoleInput>>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrganizationInput = {
  category?: InputMaybe<OrganizationCategory>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  relevance?: InputMaybe<Scalars['Float']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectInput = {
  i18n?: InputMaybe<Array<CreateProjectMessagesInputTranslationInput>>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  relevance?: InputMaybe<Scalars['Float']['input']>;
  skills?: InputMaybe<Array<Scalars['String']['input']>>;
  slug?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<UrlInput>>;
};

export type UpdateSkillInput = {
  category?: InputMaybe<SkillCategory>;
  name?: InputMaybe<Scalars['String']['input']>;
  relevance?: InputMaybe<Scalars['Float']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  birth?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<UrlInput>>;
};

export type UrlEntity = {
  __typename?: 'UrlEntity';
  title: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type UrlInput = {
  title: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type UserEntity = {
  __typename?: 'UserEntity';
  address?: Maybe<Scalars['String']['output']>;
  avatar?: Maybe<Scalars['String']['output']>;
  birth?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  nickname: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  urls?: Maybe<Array<UrlEntity>>;
};

export type ApiStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type ApiStatusQuery = { __typename: 'Query' };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const ApiStatusDocument = new TypedDocumentString(`
    query ApiStatus {
  __typename
}
    `) as unknown as TypedDocumentString<ApiStatusQuery, ApiStatusQueryVariables>;