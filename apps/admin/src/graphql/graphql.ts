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

export type AtsSummarizeInput = {
  details?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Scalars['String']['input']>;
  raw: Scalars['String']['input'];
  skills: Array<Scalars['String']['input']>;
  type: Scalars['String']['input'];
};

export type BatchEntity = {
  __typename?: 'BatchEntity';
  count: Scalars['Int']['output'];
};

export enum ChatFinishReason {
  ContentFilter = 'CONTENT_FILTER',
  Error = 'ERROR',
  Length = 'LENGTH',
  Stop = 'STOP',
  ToolCalls = 'TOOL_CALLS'
}

export type ChoiceEntity = {
  __typename?: 'ChoiceEntity';
  finishReason?: Maybe<ChatFinishReason>;
  message: MessageEntity;
};

export type CourseEntity = {
  __typename?: 'CourseEntity';
  createdAt: Scalars['DateTime']['output'];
  hours?: Maybe<Scalars['Int']['output']>;
  i18n: Array<CourseTranslationLocale>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  organization: OrganizationEntity;
  relevance: Scalars['Float']['output'];
  skills?: Maybe<Array<SkillEntity>>;
  slug: Scalars['String']['output'];
  status: CourseStatus;
  updatedAt: Scalars['DateTime']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type CourseMessages = {
  __typename?: 'CourseMessages';
  description: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export enum CourseStatus {
  Complete = 'COMPLETE',
  Incomplete = 'INCOMPLETE',
  InProgress = 'IN_PROGRESS'
}

export type CourseTranslationLocale = {
  __typename?: 'CourseTranslationLocale';
  locale: Scalars['String']['output'];
  messages: CourseMessages;
};

export type CreateCourseInput = {
  hours?: InputMaybe<Scalars['Int']['input']>;
  i18n: Array<CreateCourseTranslationInput>;
  image?: InputMaybe<Scalars['String']['input']>;
  organization: Scalars['String']['input'];
  period?: InputMaybe<DateRangeInput>;
  relevance?: InputMaybe<Scalars['Float']['input']>;
  skills?: InputMaybe<Array<Scalars['String']['input']>>;
  slug: Scalars['String']['input'];
  status: CourseStatus;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type CreateCourseMessagesInput = {
  description: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateCourseTranslationInput = {
  locale: Scalars['String']['input'];
  messages: CreateCourseMessagesInput;
};

export type CreateEducationInput = {
  i18n: Array<CreateEducationTranslationInput>;
  image?: InputMaybe<Scalars['String']['input']>;
  level: EducationLevel;
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

export type DashboardCount = {
  __typename?: 'DashboardCount';
  label: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type DashboardEntity = {
  __typename?: 'DashboardEntity';
  coursesByStatus: Array<DashboardCount>;
  experiencesByCategory: Array<DashboardCount>;
  skillsByCategory: Array<DashboardCount>;
  totals: DashboardTotals;
};

export type DashboardTotals = {
  __typename?: 'DashboardTotals';
  courses: Scalars['Int']['output'];
  educations: Scalars['Int']['output'];
  experiences: Scalars['Int']['output'];
  organizations: Scalars['Int']['output'];
  projects: Scalars['Int']['output'];
  skills: Scalars['Int']['output'];
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

export type EducationEntity = {
  __typename?: 'EducationEntity';
  createdAt: Scalars['DateTime']['output'];
  i18n: Array<EducationTranslationLocale>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  level: EducationLevel;
  organization: OrganizationEntity;
  period?: Maybe<DateRangeEntity>;
  relevance: Scalars['Float']['output'];
  skills?: Maybe<Array<SkillEntity>>;
  slug: Scalars['String']['output'];
  status: EducationStatus;
  updatedAt: Scalars['DateTime']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export enum EducationLevel {
  Bachelor = 'BACHELOR',
  Doctorate = 'DOCTORATE',
  HighSchool = 'HIGH_SCHOOL',
  Master = 'MASTER',
  Postgrad = 'POSTGRAD',
  Technical = 'TECHNICAL'
}

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
  relevance: Scalars['Float']['output'];
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

export type FilterCourseInput = {
  hours?: InputMaybe<Scalars['Int']['input']>;
  i18n?: InputMaybe<Array<CreateCourseTranslationInput>>;
  image?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<DateRangeInput>;
  relevance?: InputMaybe<Scalars['Float']['input']>;
  skills?: InputMaybe<Array<Scalars['String']['input']>>;
  slug?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<CourseStatus>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type FilterEducationInput = {
  i18n?: InputMaybe<Array<CreateEducationTranslationInput>>;
  image?: InputMaybe<Scalars['String']['input']>;
  level?: InputMaybe<EducationLevel>;
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

export type GenericIaEntity = {
  __typename?: 'GenericIaEntity';
  messages: Array<ChoiceEntity>;
  usage?: Maybe<UsageEntity>;
};

export type MessageEntity = {
  __typename?: 'MessageEntity';
  content: Scalars['String']['output'];
  reasoning?: Maybe<Scalars['String']['output']>;
  refusal?: Maybe<Scalars['String']['output']>;
  role: OpenRouterRole;
};

export type Mutation = {
  __typename?: 'Mutation';
  atsSummarize: GenericIaEntity;
  createManyCourses: Array<CourseEntity>;
  createManyEducations: Array<EducationEntity>;
  createManyExperiences: Array<ExperienceEntity>;
  createManyOrganizations: Array<OrganizationEntity>;
  createManyProjects: Array<ProjectEntity>;
  createManySkills: Array<SkillEntity>;
  createManyUsers: Array<UserEntity>;
  createOneCourse: CourseEntity;
  createOneEducation: EducationEntity;
  createOneExperience: ExperienceEntity;
  createOneOrganization: OrganizationEntity;
  createOneProject: ProjectEntity;
  createOneSkill: SkillEntity;
  createOneUser: UserEntity;
  removeManyCourses: BatchEntity;
  removeManyEducations: BatchEntity;
  removeManyExperiences: BatchEntity;
  removeManyOrganizations: BatchEntity;
  removeManyProjects: BatchEntity;
  removeManySkills: BatchEntity;
  removeManyUsers: BatchEntity;
  removeOneCourse: CourseEntity;
  removeOneEducation: EducationEntity;
  removeOneExperience: ExperienceEntity;
  removeOneOrganization: OrganizationEntity;
  removeOneProject: ProjectEntity;
  removeOneSkill: SkillEntity;
  removeOneUser: UserEntity;
  signIn: Scalars['String']['output'];
  updateManyCourses: BatchEntity;
  updateManyEducations: BatchEntity;
  updateManyExperiences: BatchEntity;
  updateManyOrganizations: BatchEntity;
  updateManyProjects: BatchEntity;
  updateManySkills: BatchEntity;
  updateManyUsers: BatchEntity;
  updateOneCourse: CourseEntity;
  updateOneEducation: EducationEntity;
  updateOneExperience: ExperienceEntity;
  updateOneOrganization: OrganizationEntity;
  updateOneProject: ProjectEntity;
  updateOneSkill: SkillEntity;
  updateOneUser: UserEntity;
};


export type MutationAtsSummarizeArgs = {
  atsSummarizeInput: AtsSummarizeInput;
};


export type MutationCreateManyCoursesArgs = {
  createCourseInputs: Array<CreateCourseInput>;
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


export type MutationCreateOneCourseArgs = {
  createCourseInput: CreateCourseInput;
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


export type MutationRemoveManyCoursesArgs = {
  courseIds: Array<Scalars['ID']['input']>;
};


export type MutationRemoveManyEducationsArgs = {
  educationIds: Array<Scalars['ID']['input']>;
};


export type MutationRemoveManyExperiencesArgs = {
  experienceIds: Array<Scalars['ID']['input']>;
};


export type MutationRemoveManyOrganizationsArgs = {
  organizationIds: Array<Scalars['ID']['input']>;
};


export type MutationRemoveManyProjectsArgs = {
  projectIds: Array<Scalars['ID']['input']>;
};


export type MutationRemoveManySkillsArgs = {
  skillIds: Array<Scalars['ID']['input']>;
};


export type MutationRemoveManyUsersArgs = {
  userIds: Array<Scalars['ID']['input']>;
};


export type MutationRemoveOneCourseArgs = {
  courseId: Scalars['ID']['input'];
};


export type MutationRemoveOneEducationArgs = {
  educationId: Scalars['ID']['input'];
};


export type MutationRemoveOneExperienceArgs = {
  experienceId: Scalars['ID']['input'];
};


export type MutationRemoveOneOrganizationArgs = {
  organizationId: Scalars['ID']['input'];
};


export type MutationRemoveOneProjectArgs = {
  projectId: Scalars['ID']['input'];
};


export type MutationRemoveOneSkillArgs = {
  skillId: Scalars['ID']['input'];
};


export type MutationRemoveOneUserArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationSignInArgs = {
  signInInput: SignInInput;
};


export type MutationUpdateManyCoursesArgs = {
  courseIds: Array<Scalars['ID']['input']>;
  updateCourseInput: UpdateCourseInput;
};


export type MutationUpdateManyEducationsArgs = {
  educationIds: Array<Scalars['ID']['input']>;
  updateEducationInput: UpdateEducationInput;
};


export type MutationUpdateManyExperiencesArgs = {
  experienceIds: Array<Scalars['ID']['input']>;
  updateExperienceInput: UpdateExperienceInput;
};


export type MutationUpdateManyOrganizationsArgs = {
  organizationIds: Array<Scalars['ID']['input']>;
  updateOrganizationInput: UpdateOrganizationInput;
};


export type MutationUpdateManyProjectsArgs = {
  projectIds: Array<Scalars['ID']['input']>;
  updateProjectInput: UpdateProjectInput;
};


export type MutationUpdateManySkillsArgs = {
  skillIds: Array<Scalars['ID']['input']>;
  updateSkillInput: UpdateSkillInput;
};


export type MutationUpdateManyUsersArgs = {
  updateUserInput: UpdateUserInput;
  userIds: Array<Scalars['ID']['input']>;
};


export type MutationUpdateOneCourseArgs = {
  courseId: Scalars['ID']['input'];
  updateCourseInput: UpdateCourseInput;
};


export type MutationUpdateOneEducationArgs = {
  educationId: Scalars['ID']['input'];
  updateEducationInput: UpdateEducationInput;
};


export type MutationUpdateOneExperienceArgs = {
  experienceId: Scalars['ID']['input'];
  updateExperienceInput: UpdateExperienceInput;
};


export type MutationUpdateOneOrganizationArgs = {
  organizationId: Scalars['ID']['input'];
  updateOrganizationInput: UpdateOrganizationInput;
};


export type MutationUpdateOneProjectArgs = {
  projectId: Scalars['ID']['input'];
  updateProjectInput: UpdateProjectInput;
};


export type MutationUpdateOneSkillArgs = {
  skillId: Scalars['ID']['input'];
  updateSkillInput: UpdateSkillInput;
};


export type MutationUpdateOneUserArgs = {
  updateUserInput: UpdateUserInput;
  userId: Scalars['ID']['input'];
};

export enum OpenRouterRole {
  Assistant = 'ASSISTANT',
  Developer = 'DEVELOPER',
  System = 'SYSTEM',
  Tool = 'TOOL',
  User = 'USER'
}

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
  relevance: Scalars['Float']['output'];
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  website: Scalars['String']['output'];
};

export type PaginatedCourseEntity = {
  __typename?: 'PaginatedCourseEntity';
  found: Scalars['Float']['output'];
  nodes: Array<CourseEntity>;
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
  relevance: Scalars['Float']['output'];
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
  dashboard: DashboardEntity;
  findManyCourseById: Array<CourseEntity>;
  findManyCourses: PaginatedCourseEntity;
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
  findOneCourse: CourseEntity;
  findOneCourseById: CourseEntity;
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


export type QueryFindManyCourseByIdArgs = {
  courseIds: Array<Scalars['ID']['input']>;
};


export type QueryFindManyCoursesArgs = {
  courseFilters?: InputMaybe<FilterCourseInput>;
  coursePagination?: InputMaybe<PaginationInput>;
  courseSort?: InputMaybe<SortCourseInput>;
};


export type QueryFindManyEducationByIdArgs = {
  educationIds: Array<Scalars['ID']['input']>;
};


export type QueryFindManyEducationsArgs = {
  educationFilters?: InputMaybe<FilterEducationInput>;
  educationPagination?: InputMaybe<PaginationInput>;
  educationSort?: InputMaybe<SortEducationInput>;
};


export type QueryFindManyExperienceByIdArgs = {
  experienceIds: Array<Scalars['ID']['input']>;
};


export type QueryFindManyExperiencesArgs = {
  experienceFilters?: InputMaybe<FilterExperienceInput>;
  experiencePagination?: InputMaybe<PaginationInput>;
  experienceSort?: InputMaybe<SortExperienceInput>;
};


export type QueryFindManyOrganizationByIdArgs = {
  organizationIds: Array<Scalars['ID']['input']>;
};


export type QueryFindManyOrganizationsArgs = {
  organizationFilters?: InputMaybe<FilterOrganizationInput>;
  organizationPagination?: InputMaybe<PaginationInput>;
  organizationSort?: InputMaybe<SortOrganizationInput>;
};


export type QueryFindManyProjectByIdArgs = {
  projectIds: Array<Scalars['ID']['input']>;
};


export type QueryFindManyProjectsArgs = {
  projectFilters?: InputMaybe<FilterProjectInput>;
  projectPagination?: InputMaybe<PaginationInput>;
  projectSort?: InputMaybe<SortProjectInput>;
};


export type QueryFindManySkillByIdArgs = {
  skillIds: Array<Scalars['ID']['input']>;
};


export type QueryFindManySkillsArgs = {
  skillFilters?: InputMaybe<FilterSkillInput>;
  skillPagination?: InputMaybe<PaginationInput>;
  skillSort?: InputMaybe<SortSkillInput>;
};


export type QueryFindManyUserByIdArgs = {
  userIds: Array<Scalars['ID']['input']>;
};


export type QueryFindManyUsersArgs = {
  userFilters?: InputMaybe<FilterUserInput>;
  userPagination?: InputMaybe<PaginationInput>;
  userSort?: InputMaybe<SortUserInput>;
};


export type QueryFindOneCourseArgs = {
  courseFilters?: InputMaybe<FilterCourseInput>;
};


export type QueryFindOneCourseByIdArgs = {
  courseId: Scalars['ID']['input'];
};


export type QueryFindOneEducationArgs = {
  educationFilters?: InputMaybe<FilterEducationInput>;
};


export type QueryFindOneEducationByIdArgs = {
  educationId: Scalars['ID']['input'];
};


export type QueryFindOneExperienceArgs = {
  experienceFilters?: InputMaybe<FilterExperienceInput>;
};


export type QueryFindOneExperienceByIdArgs = {
  experienceId: Scalars['ID']['input'];
};


export type QueryFindOneOrganizationArgs = {
  organizationFilters?: InputMaybe<FilterOrganizationInput>;
};


export type QueryFindOneOrganizationByIdArgs = {
  organizationId: Scalars['ID']['input'];
};


export type QueryFindOneProjectArgs = {
  projectFilters?: InputMaybe<FilterProjectInput>;
};


export type QueryFindOneProjectByIdArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryFindOneSkillArgs = {
  skillFilters?: InputMaybe<FilterSkillInput>;
};


export type QueryFindOneSkillByIdArgs = {
  skillId: Scalars['ID']['input'];
};


export type QueryFindOneUserArgs = {
  userFilters?: InputMaybe<FilterUserInput>;
};


export type QueryFindOneUserByIdArgs = {
  userId: Scalars['ID']['input'];
};

export type SignInInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export enum SkillCategory {
  Backend = 'BACKEND',
  Data = 'DATA',
  Devops = 'DEVOPS',
  Frontend = 'FRONTEND',
  Language = 'LANGUAGE'
}

export type SkillEntity = {
  __typename?: 'SkillEntity';
  category: SkillCategory;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  relevance: Scalars['Float']['output'];
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type SortCourseInput = {
  createdAt?: InputMaybe<SortEnum>;
  relevance?: InputMaybe<SortEnum>;
  updatedAt?: InputMaybe<SortEnum>;
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

export type UpdateCourseInput = {
  hours?: InputMaybe<Scalars['Int']['input']>;
  i18n?: InputMaybe<Array<CreateCourseTranslationInput>>;
  image?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<DateRangeInput>;
  relevance?: InputMaybe<Scalars['Float']['input']>;
  skills?: InputMaybe<Array<Scalars['String']['input']>>;
  slug?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<CourseStatus>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateEducationInput = {
  i18n?: InputMaybe<Array<CreateEducationTranslationInput>>;
  image?: InputMaybe<Scalars['String']['input']>;
  level?: InputMaybe<EducationLevel>;
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

export type UsageEntity = {
  __typename?: 'UsageEntity';
  completionTokens?: Maybe<Scalars['Float']['output']>;
  cost?: Maybe<Scalars['Float']['output']>;
  promptTokens?: Maybe<Scalars['Float']['output']>;
  totalTokens?: Maybe<Scalars['Float']['output']>;
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

export type SignInMutationVariables = Exact<{
  signInInput: SignInInput;
}>;


export type SignInMutation = { __typename?: 'Mutation', signIn: string };

export type CreateOneCourseMutationVariables = Exact<{
  createCourseInput: CreateCourseInput;
}>;


export type CreateOneCourseMutation = { __typename?: 'Mutation', createOneCourse: { __typename?: 'CourseEntity', id: string, slug: string } };

export type UpdateOneCourseMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
  updateCourseInput: UpdateCourseInput;
}>;


export type UpdateOneCourseMutation = { __typename?: 'Mutation', updateOneCourse: { __typename?: 'CourseEntity', id: string, slug: string } };

export type UpdateManyCoursesMutationVariables = Exact<{
  courseIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  updateCourseInput: UpdateCourseInput;
}>;


export type UpdateManyCoursesMutation = { __typename?: 'Mutation', updateManyCourses: { __typename?: 'BatchEntity', count: number } };

export type RemoveOneCourseMutationVariables = Exact<{
  courseId: Scalars['ID']['input'];
}>;


export type RemoveOneCourseMutation = { __typename?: 'Mutation', removeOneCourse: { __typename?: 'CourseEntity', id: string, slug: string } };

export type RemoveManyCoursesMutationVariables = Exact<{
  courseIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type RemoveManyCoursesMutation = { __typename?: 'Mutation', removeManyCourses: { __typename?: 'BatchEntity', count: number } };

export type CreateOneEducationMutationVariables = Exact<{
  createEducationInput: CreateEducationInput;
}>;


export type CreateOneEducationMutation = { __typename?: 'Mutation', createOneEducation: { __typename?: 'EducationEntity', id: string, slug: string } };

export type UpdateOneEducationMutationVariables = Exact<{
  educationId: Scalars['ID']['input'];
  updateEducationInput: UpdateEducationInput;
}>;


export type UpdateOneEducationMutation = { __typename?: 'Mutation', updateOneEducation: { __typename?: 'EducationEntity', id: string, slug: string } };

export type UpdateManyEducationsMutationVariables = Exact<{
  educationIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  updateEducationInput: UpdateEducationInput;
}>;


export type UpdateManyEducationsMutation = { __typename?: 'Mutation', updateManyEducations: { __typename?: 'BatchEntity', count: number } };

export type RemoveOneEducationMutationVariables = Exact<{
  educationId: Scalars['ID']['input'];
}>;


export type RemoveOneEducationMutation = { __typename?: 'Mutation', removeOneEducation: { __typename?: 'EducationEntity', id: string, slug: string } };

export type RemoveManyEducationsMutationVariables = Exact<{
  educationIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type RemoveManyEducationsMutation = { __typename?: 'Mutation', removeManyEducations: { __typename?: 'BatchEntity', count: number } };

export type CreateOneExperienceMutationVariables = Exact<{
  createExperienceInput: CreateExperienceInput;
}>;


export type CreateOneExperienceMutation = { __typename?: 'Mutation', createOneExperience: { __typename?: 'ExperienceEntity', id: string, slug: string } };

export type UpdateOneExperienceMutationVariables = Exact<{
  experienceId: Scalars['ID']['input'];
  updateExperienceInput: UpdateExperienceInput;
}>;


export type UpdateOneExperienceMutation = { __typename?: 'Mutation', updateOneExperience: { __typename?: 'ExperienceEntity', id: string, slug: string } };

export type UpdateManyExperiencesMutationVariables = Exact<{
  experienceIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  updateExperienceInput: UpdateExperienceInput;
}>;


export type UpdateManyExperiencesMutation = { __typename?: 'Mutation', updateManyExperiences: { __typename?: 'BatchEntity', count: number } };

export type RemoveOneExperienceMutationVariables = Exact<{
  experienceId: Scalars['ID']['input'];
}>;


export type RemoveOneExperienceMutation = { __typename?: 'Mutation', removeOneExperience: { __typename?: 'ExperienceEntity', id: string, slug: string } };

export type RemoveManyExperiencesMutationVariables = Exact<{
  experienceIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type RemoveManyExperiencesMutation = { __typename?: 'Mutation', removeManyExperiences: { __typename?: 'BatchEntity', count: number } };

export type AtsSummarizeMutationVariables = Exact<{
  atsSummarizeInput: AtsSummarizeInput;
}>;


export type AtsSummarizeMutation = { __typename?: 'Mutation', atsSummarize: { __typename?: 'GenericIaEntity', messages: Array<{ __typename?: 'ChoiceEntity', finishReason?: ChatFinishReason | null, message: { __typename?: 'MessageEntity', content: string, reasoning?: string | null, refusal?: string | null, role: OpenRouterRole } }>, usage?: { __typename?: 'UsageEntity', completionTokens?: number | null, cost?: number | null, promptTokens?: number | null, totalTokens?: number | null } | null } };

export type CreateOneOrganizationMutationVariables = Exact<{
  createOrganizationInput: CreateOrganizationInput;
}>;


export type CreateOneOrganizationMutation = { __typename?: 'Mutation', createOneOrganization: { __typename?: 'OrganizationEntity', id: string, slug: string } };

export type UpdateOneOrganizationMutationVariables = Exact<{
  organizationId: Scalars['ID']['input'];
  updateOrganizationInput: UpdateOrganizationInput;
}>;


export type UpdateOneOrganizationMutation = { __typename?: 'Mutation', updateOneOrganization: { __typename?: 'OrganizationEntity', id: string, slug: string } };

export type UpdateManyOrganizationsMutationVariables = Exact<{
  organizationIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  updateOrganizationInput: UpdateOrganizationInput;
}>;


export type UpdateManyOrganizationsMutation = { __typename?: 'Mutation', updateManyOrganizations: { __typename?: 'BatchEntity', count: number } };

export type RemoveOneOrganizationMutationVariables = Exact<{
  organizationId: Scalars['ID']['input'];
}>;


export type RemoveOneOrganizationMutation = { __typename?: 'Mutation', removeOneOrganization: { __typename?: 'OrganizationEntity', id: string, slug: string } };

export type RemoveManyOrganizationsMutationVariables = Exact<{
  organizationIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type RemoveManyOrganizationsMutation = { __typename?: 'Mutation', removeManyOrganizations: { __typename?: 'BatchEntity', count: number } };

export type CreateOneProjectMutationVariables = Exact<{
  createProjectInput: CreateProjectInput;
}>;


export type CreateOneProjectMutation = { __typename?: 'Mutation', createOneProject: { __typename?: 'ProjectEntity', id: string, slug: string } };

export type UpdateOneProjectMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
  updateProjectInput: UpdateProjectInput;
}>;


export type UpdateOneProjectMutation = { __typename?: 'Mutation', updateOneProject: { __typename?: 'ProjectEntity', id: string, slug: string } };

export type UpdateManyProjectsMutationVariables = Exact<{
  projectIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  updateProjectInput: UpdateProjectInput;
}>;


export type UpdateManyProjectsMutation = { __typename?: 'Mutation', updateManyProjects: { __typename?: 'BatchEntity', count: number } };

export type RemoveOneProjectMutationVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type RemoveOneProjectMutation = { __typename?: 'Mutation', removeOneProject: { __typename?: 'ProjectEntity', id: string, slug: string } };

export type RemoveManyProjectsMutationVariables = Exact<{
  projectIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type RemoveManyProjectsMutation = { __typename?: 'Mutation', removeManyProjects: { __typename?: 'BatchEntity', count: number } };

export type CreateOneSkillMutationVariables = Exact<{
  createSkillInput: CreateSkillInput;
}>;


export type CreateOneSkillMutation = { __typename?: 'Mutation', createOneSkill: { __typename?: 'SkillEntity', id: string, name: string, slug: string, category: SkillCategory, relevance: number, createdAt: any, updatedAt: any } };

export type UpdateOneSkillMutationVariables = Exact<{
  skillId: Scalars['ID']['input'];
  updateSkillInput: UpdateSkillInput;
}>;


export type UpdateOneSkillMutation = { __typename?: 'Mutation', updateOneSkill: { __typename?: 'SkillEntity', id: string, name: string, slug: string, category: SkillCategory, relevance: number, createdAt: any, updatedAt: any } };

export type UpdateManySkillsMutationVariables = Exact<{
  skillIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  updateSkillInput: UpdateSkillInput;
}>;


export type UpdateManySkillsMutation = { __typename?: 'Mutation', updateManySkills: { __typename?: 'BatchEntity', count: number } };

export type RemoveOneSkillMutationVariables = Exact<{
  skillId: Scalars['ID']['input'];
}>;


export type RemoveOneSkillMutation = { __typename?: 'Mutation', removeOneSkill: { __typename?: 'SkillEntity', id: string, name: string, slug: string, category: SkillCategory, relevance: number, createdAt: any, updatedAt: any } };

export type RemoveManySkillsMutationVariables = Exact<{
  skillIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type RemoveManySkillsMutation = { __typename?: 'Mutation', removeManySkills: { __typename?: 'BatchEntity', count: number } };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', getMe: { __typename?: 'UserEntity', id: string, email: string, name: string, nickname: string, role: string, title?: string | null, avatar?: string | null } };

export type ApiStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type ApiStatusQuery = { __typename: 'Query' };

export type FindManyCoursesQueryVariables = Exact<{
  courseFilters?: InputMaybe<FilterCourseInput>;
  coursePagination?: InputMaybe<PaginationInput>;
  courseSort?: InputMaybe<SortCourseInput>;
}>;


export type FindManyCoursesQuery = { __typename?: 'Query', findManyCourses: { __typename?: 'PaginatedCourseEntity', found: number, nodes: Array<{ __typename?: 'CourseEntity', id: string, slug: string, status: CourseStatus, relevance: number, url?: string | null, image?: string | null, hours?: number | null, createdAt: any, updatedAt: any, organization: { __typename?: 'OrganizationEntity', id: string, name: string, slug: string }, i18n: Array<{ __typename?: 'CourseTranslationLocale', locale: string, messages: { __typename?: 'CourseMessages', title: string, description: string } }>, skills?: Array<{ __typename?: 'SkillEntity', id: string, name: string }> | null }> } };

export type FindOneCourseByIdQueryVariables = Exact<{
  courseId: Scalars['ID']['input'];
}>;


export type FindOneCourseByIdQuery = { __typename?: 'Query', findOneCourseById: { __typename?: 'CourseEntity', id: string, slug: string, status: CourseStatus, relevance: number, url?: string | null, image?: string | null, hours?: number | null, createdAt: any, updatedAt: any, organization: { __typename?: 'OrganizationEntity', id: string, name: string, slug: string }, i18n: Array<{ __typename?: 'CourseTranslationLocale', locale: string, messages: { __typename?: 'CourseMessages', title: string, description: string } }>, skills?: Array<{ __typename?: 'SkillEntity', id: string, name: string }> | null } };

export type FindOneCourseQueryVariables = Exact<{
  courseFilters?: InputMaybe<FilterCourseInput>;
}>;


export type FindOneCourseQuery = { __typename?: 'Query', findOneCourse: { __typename?: 'CourseEntity', id: string, slug: string, status: CourseStatus, relevance: number, url?: string | null, image?: string | null, hours?: number | null, createdAt: any, updatedAt: any, organization: { __typename?: 'OrganizationEntity', id: string, name: string, slug: string }, i18n: Array<{ __typename?: 'CourseTranslationLocale', locale: string, messages: { __typename?: 'CourseMessages', title: string, description: string } }>, skills?: Array<{ __typename?: 'SkillEntity', id: string, name: string }> | null } };

export type FindManyCourseByIdQueryVariables = Exact<{
  courseIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type FindManyCourseByIdQuery = { __typename?: 'Query', findManyCourseById: Array<{ __typename?: 'CourseEntity', id: string, slug: string, status: CourseStatus, relevance: number, url?: string | null, image?: string | null, hours?: number | null, createdAt: any, updatedAt: any, organization: { __typename?: 'OrganizationEntity', id: string, name: string, slug: string }, i18n: Array<{ __typename?: 'CourseTranslationLocale', locale: string, messages: { __typename?: 'CourseMessages', title: string, description: string } }>, skills?: Array<{ __typename?: 'SkillEntity', id: string, name: string }> | null }> };

export type DashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardQuery = { __typename?: 'Query', dashboard: { __typename?: 'DashboardEntity', totals: { __typename?: 'DashboardTotals', skills: number, courses: number, educations: number, organizations: number, projects: number, experiences: number }, skillsByCategory: Array<{ __typename?: 'DashboardCount', label: string, value: number }>, experiencesByCategory: Array<{ __typename?: 'DashboardCount', label: string, value: number }>, coursesByStatus: Array<{ __typename?: 'DashboardCount', label: string, value: number }> } };

export type FindManyEducationsQueryVariables = Exact<{
  educationFilters?: InputMaybe<FilterEducationInput>;
  educationPagination?: InputMaybe<PaginationInput>;
  educationSort?: InputMaybe<SortEducationInput>;
}>;


export type FindManyEducationsQuery = { __typename?: 'Query', findManyEducations: { __typename?: 'PaginatedEducationEntity', found: number, nodes: Array<{ __typename?: 'EducationEntity', id: string, slug: string, level: EducationLevel, status: EducationStatus, relevance: number, url?: string | null, image?: string | null, createdAt: any, updatedAt: any, organization: { __typename?: 'OrganizationEntity', id: string, name: string, slug: string }, i18n: Array<{ __typename?: 'EducationTranslationLocale', locale: string, messages: { __typename?: 'EducationMessages', title: string, description: string } }>, skills?: Array<{ __typename?: 'SkillEntity', id: string, name: string }> | null, period?: { __typename?: 'DateRangeEntity', from?: any | null, to?: any | null } | null }> } };

export type FindOneEducationByIdQueryVariables = Exact<{
  educationId: Scalars['ID']['input'];
}>;


export type FindOneEducationByIdQuery = { __typename?: 'Query', findOneEducationById: { __typename?: 'EducationEntity', id: string, slug: string, level: EducationLevel, status: EducationStatus, relevance: number, url?: string | null, image?: string | null, createdAt: any, updatedAt: any, organization: { __typename?: 'OrganizationEntity', id: string, name: string, slug: string }, i18n: Array<{ __typename?: 'EducationTranslationLocale', locale: string, messages: { __typename?: 'EducationMessages', title: string, description: string } }>, skills?: Array<{ __typename?: 'SkillEntity', id: string, name: string }> | null, period?: { __typename?: 'DateRangeEntity', from?: any | null, to?: any | null } | null } };

export type FindOneEducationQueryVariables = Exact<{
  educationFilters?: InputMaybe<FilterEducationInput>;
}>;


export type FindOneEducationQuery = { __typename?: 'Query', findOneEducation: { __typename?: 'EducationEntity', id: string, slug: string, level: EducationLevel, status: EducationStatus, relevance: number, url?: string | null, image?: string | null, createdAt: any, updatedAt: any, organization: { __typename?: 'OrganizationEntity', id: string, name: string, slug: string }, i18n: Array<{ __typename?: 'EducationTranslationLocale', locale: string, messages: { __typename?: 'EducationMessages', title: string, description: string } }>, skills?: Array<{ __typename?: 'SkillEntity', id: string, name: string }> | null, period?: { __typename?: 'DateRangeEntity', from?: any | null, to?: any | null } | null } };

export type FindManyEducationByIdQueryVariables = Exact<{
  educationIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type FindManyEducationByIdQuery = { __typename?: 'Query', findManyEducationById: Array<{ __typename?: 'EducationEntity', id: string, slug: string, level: EducationLevel, status: EducationStatus, relevance: number, url?: string | null, image?: string | null, createdAt: any, updatedAt: any, organization: { __typename?: 'OrganizationEntity', id: string, name: string, slug: string }, i18n: Array<{ __typename?: 'EducationTranslationLocale', locale: string, messages: { __typename?: 'EducationMessages', title: string, description: string } }>, skills?: Array<{ __typename?: 'SkillEntity', id: string, name: string }> | null, period?: { __typename?: 'DateRangeEntity', from?: any | null, to?: any | null } | null }> };

export type FindManyExperiencesQueryVariables = Exact<{
  experienceFilters?: InputMaybe<FilterExperienceInput>;
  experiencePagination?: InputMaybe<PaginationInput>;
  experienceSort?: InputMaybe<SortExperienceInput>;
}>;


export type FindManyExperiencesQuery = { __typename?: 'Query', findManyExperiences: { __typename?: 'PaginatedExperienceEntity', found: number, nodes: Array<{ __typename?: 'ExperienceEntity', id: string, slug: string, category: ExperienceCategory, relevance: number, createdAt: any, updatedAt: any, organization: { __typename?: 'OrganizationEntity', id: string, name: string, slug: string }, roles: Array<{ __typename?: 'ExperienceRole', i18n: Array<{ __typename?: 'ExperienceTranslationLocale', locale: string, messages: { __typename?: 'ExperienceMessages', title: string, description: string } }>, period?: { __typename?: 'DateRangeEntity', from?: any | null, to?: any | null } | null, skills?: Array<{ __typename?: 'SkillEntity', id: string, name: string }> | null }> }> } };

export type FindOneExperienceByIdQueryVariables = Exact<{
  experienceId: Scalars['ID']['input'];
}>;


export type FindOneExperienceByIdQuery = { __typename?: 'Query', findOneExperienceById: { __typename?: 'ExperienceEntity', id: string, slug: string, category: ExperienceCategory, relevance: number, createdAt: any, updatedAt: any, organization: { __typename?: 'OrganizationEntity', id: string, name: string, slug: string }, roles: Array<{ __typename?: 'ExperienceRole', i18n: Array<{ __typename?: 'ExperienceTranslationLocale', locale: string, messages: { __typename?: 'ExperienceMessages', title: string, description: string } }>, period?: { __typename?: 'DateRangeEntity', from?: any | null, to?: any | null } | null, skills?: Array<{ __typename?: 'SkillEntity', id: string, name: string }> | null }> } };

export type FindOneExperienceQueryVariables = Exact<{
  experienceFilters?: InputMaybe<FilterExperienceInput>;
}>;


export type FindOneExperienceQuery = { __typename?: 'Query', findOneExperience: { __typename?: 'ExperienceEntity', id: string, slug: string, category: ExperienceCategory, relevance: number, createdAt: any, updatedAt: any, organization: { __typename?: 'OrganizationEntity', id: string, name: string, slug: string }, roles: Array<{ __typename?: 'ExperienceRole', i18n: Array<{ __typename?: 'ExperienceTranslationLocale', locale: string, messages: { __typename?: 'ExperienceMessages', title: string, description: string } }>, period?: { __typename?: 'DateRangeEntity', from?: any | null, to?: any | null } | null, skills?: Array<{ __typename?: 'SkillEntity', id: string, name: string }> | null }> } };

export type FindManyExperienceByIdQueryVariables = Exact<{
  experienceIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type FindManyExperienceByIdQuery = { __typename?: 'Query', findManyExperienceById: Array<{ __typename?: 'ExperienceEntity', id: string, slug: string, category: ExperienceCategory, relevance: number, createdAt: any, updatedAt: any, organization: { __typename?: 'OrganizationEntity', id: string, name: string, slug: string }, roles: Array<{ __typename?: 'ExperienceRole', i18n: Array<{ __typename?: 'ExperienceTranslationLocale', locale: string, messages: { __typename?: 'ExperienceMessages', title: string, description: string } }>, period?: { __typename?: 'DateRangeEntity', from?: any | null, to?: any | null } | null, skills?: Array<{ __typename?: 'SkillEntity', id: string, name: string }> | null }> }> };

export type FindManyOrganizationsQueryVariables = Exact<{
  organizationFilters?: InputMaybe<FilterOrganizationInput>;
  organizationPagination?: InputMaybe<PaginationInput>;
  organizationSort?: InputMaybe<SortOrganizationInput>;
}>;


export type FindManyOrganizationsQuery = { __typename?: 'Query', findManyOrganizations: { __typename?: 'PaginatedOrganizationEntity', found: number, nodes: Array<{ __typename?: 'OrganizationEntity', id: string, name: string, slug: string, category: OrganizationCategory, logo: string, website: string, relevance: number, createdAt: any, updatedAt: any }> } };

export type FindOneOrganizationByIdQueryVariables = Exact<{
  organizationId: Scalars['ID']['input'];
}>;


export type FindOneOrganizationByIdQuery = { __typename?: 'Query', findOneOrganizationById: { __typename?: 'OrganizationEntity', id: string, name: string, slug: string, category: OrganizationCategory, logo: string, website: string, relevance: number, createdAt: any, updatedAt: any } };

export type FindOneOrganizationQueryVariables = Exact<{
  organizationFilters?: InputMaybe<FilterOrganizationInput>;
}>;


export type FindOneOrganizationQuery = { __typename?: 'Query', findOneOrganization: { __typename?: 'OrganizationEntity', id: string, name: string, slug: string, category: OrganizationCategory, logo: string, website: string, relevance: number, createdAt: any, updatedAt: any } };

export type FindManyOrganizationByIdQueryVariables = Exact<{
  organizationIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type FindManyOrganizationByIdQuery = { __typename?: 'Query', findManyOrganizationById: Array<{ __typename?: 'OrganizationEntity', id: string, name: string, slug: string, category: OrganizationCategory, logo: string, website: string, relevance: number, createdAt: any, updatedAt: any }> };

export type FindManyProjectsQueryVariables = Exact<{
  projectFilters?: InputMaybe<FilterProjectInput>;
  projectPagination?: InputMaybe<PaginationInput>;
  projectSort?: InputMaybe<SortProjectInput>;
}>;


export type FindManyProjectsQuery = { __typename?: 'Query', findManyProjects: { __typename?: 'PaginatedProjectEntity', found: number, nodes: Array<{ __typename?: 'ProjectEntity', id: string, slug: string, relevance: number, images?: Array<string> | null, createdAt: any, updatedAt: any, urls?: Array<{ __typename?: 'UrlEntity', title: string, value: string }> | null, i18n: Array<{ __typename?: 'ProjectMessagesTranslationEntity', locale: string, messages: { __typename?: 'ProjectMessages', title: string, description: string } }>, skills?: Array<{ __typename?: 'SkillEntity', id: string, name: string }> | null }> } };

export type FindOneProjectByIdQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type FindOneProjectByIdQuery = { __typename?: 'Query', findOneProjectById: { __typename?: 'ProjectEntity', id: string, slug: string, relevance: number, images?: Array<string> | null, createdAt: any, updatedAt: any, urls?: Array<{ __typename?: 'UrlEntity', title: string, value: string }> | null, i18n: Array<{ __typename?: 'ProjectMessagesTranslationEntity', locale: string, messages: { __typename?: 'ProjectMessages', title: string, description: string } }>, skills?: Array<{ __typename?: 'SkillEntity', id: string, name: string }> | null } };

export type FindOneProjectQueryVariables = Exact<{
  projectFilters?: InputMaybe<FilterProjectInput>;
}>;


export type FindOneProjectQuery = { __typename?: 'Query', findOneProject: { __typename?: 'ProjectEntity', id: string, slug: string, relevance: number, images?: Array<string> | null, createdAt: any, updatedAt: any, urls?: Array<{ __typename?: 'UrlEntity', title: string, value: string }> | null, i18n: Array<{ __typename?: 'ProjectMessagesTranslationEntity', locale: string, messages: { __typename?: 'ProjectMessages', title: string, description: string } }>, skills?: Array<{ __typename?: 'SkillEntity', id: string, name: string }> | null } };

export type FindManyProjectByIdQueryVariables = Exact<{
  projectIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type FindManyProjectByIdQuery = { __typename?: 'Query', findManyProjectById: Array<{ __typename?: 'ProjectEntity', id: string, slug: string, relevance: number, images?: Array<string> | null, createdAt: any, updatedAt: any, urls?: Array<{ __typename?: 'UrlEntity', title: string, value: string }> | null, i18n: Array<{ __typename?: 'ProjectMessagesTranslationEntity', locale: string, messages: { __typename?: 'ProjectMessages', title: string, description: string } }>, skills?: Array<{ __typename?: 'SkillEntity', id: string, name: string }> | null }> };

export type FindManySkillsQueryVariables = Exact<{
  skillFilters?: InputMaybe<FilterSkillInput>;
  skillPagination?: InputMaybe<PaginationInput>;
  skillSort?: InputMaybe<SortSkillInput>;
}>;


export type FindManySkillsQuery = { __typename?: 'Query', findManySkills: { __typename?: 'PaginatedSkillEntity', found: number, nodes: Array<{ __typename?: 'SkillEntity', id: string, name: string, slug: string, category: SkillCategory, relevance: number, createdAt: any, updatedAt: any }> } };

export type FindOneSkillByIdQueryVariables = Exact<{
  skillId: Scalars['ID']['input'];
}>;


export type FindOneSkillByIdQuery = { __typename?: 'Query', findOneSkillById: { __typename?: 'SkillEntity', id: string, name: string, slug: string, category: SkillCategory, relevance: number, createdAt: any, updatedAt: any } };

export type FindOneSkillQueryVariables = Exact<{
  skillFilters?: InputMaybe<FilterSkillInput>;
}>;


export type FindOneSkillQuery = { __typename?: 'Query', findOneSkill: { __typename?: 'SkillEntity', id: string, name: string, slug: string, category: SkillCategory, relevance: number, createdAt: any, updatedAt: any } };

export type FindManySkillByIdQueryVariables = Exact<{
  skillIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type FindManySkillByIdQuery = { __typename?: 'Query', findManySkillById: Array<{ __typename?: 'SkillEntity', id: string, name: string, slug: string, category: SkillCategory, relevance: number, createdAt: any, updatedAt: any }> };

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

export const SignInDocument = new TypedDocumentString(`
    mutation SignIn($signInInput: SignInInput!) {
  signIn(signInInput: $signInInput)
}
    `) as unknown as TypedDocumentString<SignInMutation, SignInMutationVariables>;
export const CreateOneCourseDocument = new TypedDocumentString(`
    mutation CreateOneCourse($createCourseInput: CreateCourseInput!) {
  createOneCourse(createCourseInput: $createCourseInput) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<CreateOneCourseMutation, CreateOneCourseMutationVariables>;
export const UpdateOneCourseDocument = new TypedDocumentString(`
    mutation UpdateOneCourse($courseId: ID!, $updateCourseInput: UpdateCourseInput!) {
  updateOneCourse(courseId: $courseId, updateCourseInput: $updateCourseInput) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<UpdateOneCourseMutation, UpdateOneCourseMutationVariables>;
export const UpdateManyCoursesDocument = new TypedDocumentString(`
    mutation UpdateManyCourses($courseIds: [ID!]!, $updateCourseInput: UpdateCourseInput!) {
  updateManyCourses(courseIds: $courseIds, updateCourseInput: $updateCourseInput) {
    count
  }
}
    `) as unknown as TypedDocumentString<UpdateManyCoursesMutation, UpdateManyCoursesMutationVariables>;
export const RemoveOneCourseDocument = new TypedDocumentString(`
    mutation RemoveOneCourse($courseId: ID!) {
  removeOneCourse(courseId: $courseId) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<RemoveOneCourseMutation, RemoveOneCourseMutationVariables>;
export const RemoveManyCoursesDocument = new TypedDocumentString(`
    mutation RemoveManyCourses($courseIds: [ID!]!) {
  removeManyCourses(courseIds: $courseIds) {
    count
  }
}
    `) as unknown as TypedDocumentString<RemoveManyCoursesMutation, RemoveManyCoursesMutationVariables>;
export const CreateOneEducationDocument = new TypedDocumentString(`
    mutation CreateOneEducation($createEducationInput: CreateEducationInput!) {
  createOneEducation(createEducationInput: $createEducationInput) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<CreateOneEducationMutation, CreateOneEducationMutationVariables>;
export const UpdateOneEducationDocument = new TypedDocumentString(`
    mutation UpdateOneEducation($educationId: ID!, $updateEducationInput: UpdateEducationInput!) {
  updateOneEducation(
    educationId: $educationId
    updateEducationInput: $updateEducationInput
  ) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<UpdateOneEducationMutation, UpdateOneEducationMutationVariables>;
export const UpdateManyEducationsDocument = new TypedDocumentString(`
    mutation UpdateManyEducations($educationIds: [ID!]!, $updateEducationInput: UpdateEducationInput!) {
  updateManyEducations(
    educationIds: $educationIds
    updateEducationInput: $updateEducationInput
  ) {
    count
  }
}
    `) as unknown as TypedDocumentString<UpdateManyEducationsMutation, UpdateManyEducationsMutationVariables>;
export const RemoveOneEducationDocument = new TypedDocumentString(`
    mutation RemoveOneEducation($educationId: ID!) {
  removeOneEducation(educationId: $educationId) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<RemoveOneEducationMutation, RemoveOneEducationMutationVariables>;
export const RemoveManyEducationsDocument = new TypedDocumentString(`
    mutation RemoveManyEducations($educationIds: [ID!]!) {
  removeManyEducations(educationIds: $educationIds) {
    count
  }
}
    `) as unknown as TypedDocumentString<RemoveManyEducationsMutation, RemoveManyEducationsMutationVariables>;
export const CreateOneExperienceDocument = new TypedDocumentString(`
    mutation CreateOneExperience($createExperienceInput: CreateExperienceInput!) {
  createOneExperience(createExperienceInput: $createExperienceInput) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<CreateOneExperienceMutation, CreateOneExperienceMutationVariables>;
export const UpdateOneExperienceDocument = new TypedDocumentString(`
    mutation UpdateOneExperience($experienceId: ID!, $updateExperienceInput: UpdateExperienceInput!) {
  updateOneExperience(
    experienceId: $experienceId
    updateExperienceInput: $updateExperienceInput
  ) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<UpdateOneExperienceMutation, UpdateOneExperienceMutationVariables>;
export const UpdateManyExperiencesDocument = new TypedDocumentString(`
    mutation UpdateManyExperiences($experienceIds: [ID!]!, $updateExperienceInput: UpdateExperienceInput!) {
  updateManyExperiences(
    experienceIds: $experienceIds
    updateExperienceInput: $updateExperienceInput
  ) {
    count
  }
}
    `) as unknown as TypedDocumentString<UpdateManyExperiencesMutation, UpdateManyExperiencesMutationVariables>;
export const RemoveOneExperienceDocument = new TypedDocumentString(`
    mutation RemoveOneExperience($experienceId: ID!) {
  removeOneExperience(experienceId: $experienceId) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<RemoveOneExperienceMutation, RemoveOneExperienceMutationVariables>;
export const RemoveManyExperiencesDocument = new TypedDocumentString(`
    mutation RemoveManyExperiences($experienceIds: [ID!]!) {
  removeManyExperiences(experienceIds: $experienceIds) {
    count
  }
}
    `) as unknown as TypedDocumentString<RemoveManyExperiencesMutation, RemoveManyExperiencesMutationVariables>;
export const AtsSummarizeDocument = new TypedDocumentString(`
    mutation AtsSummarize($atsSummarizeInput: AtsSummarizeInput!) {
  atsSummarize(atsSummarizeInput: $atsSummarizeInput) {
    messages {
      finishReason
      message {
        content
        reasoning
        refusal
        role
      }
    }
    usage {
      completionTokens
      cost
      promptTokens
      totalTokens
    }
  }
}
    `) as unknown as TypedDocumentString<AtsSummarizeMutation, AtsSummarizeMutationVariables>;
export const CreateOneOrganizationDocument = new TypedDocumentString(`
    mutation CreateOneOrganization($createOrganizationInput: CreateOrganizationInput!) {
  createOneOrganization(createOrganizationInput: $createOrganizationInput) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<CreateOneOrganizationMutation, CreateOneOrganizationMutationVariables>;
export const UpdateOneOrganizationDocument = new TypedDocumentString(`
    mutation UpdateOneOrganization($organizationId: ID!, $updateOrganizationInput: UpdateOrganizationInput!) {
  updateOneOrganization(
    organizationId: $organizationId
    updateOrganizationInput: $updateOrganizationInput
  ) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<UpdateOneOrganizationMutation, UpdateOneOrganizationMutationVariables>;
export const UpdateManyOrganizationsDocument = new TypedDocumentString(`
    mutation UpdateManyOrganizations($organizationIds: [ID!]!, $updateOrganizationInput: UpdateOrganizationInput!) {
  updateManyOrganizations(
    organizationIds: $organizationIds
    updateOrganizationInput: $updateOrganizationInput
  ) {
    count
  }
}
    `) as unknown as TypedDocumentString<UpdateManyOrganizationsMutation, UpdateManyOrganizationsMutationVariables>;
export const RemoveOneOrganizationDocument = new TypedDocumentString(`
    mutation RemoveOneOrganization($organizationId: ID!) {
  removeOneOrganization(organizationId: $organizationId) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<RemoveOneOrganizationMutation, RemoveOneOrganizationMutationVariables>;
export const RemoveManyOrganizationsDocument = new TypedDocumentString(`
    mutation RemoveManyOrganizations($organizationIds: [ID!]!) {
  removeManyOrganizations(organizationIds: $organizationIds) {
    count
  }
}
    `) as unknown as TypedDocumentString<RemoveManyOrganizationsMutation, RemoveManyOrganizationsMutationVariables>;
export const CreateOneProjectDocument = new TypedDocumentString(`
    mutation CreateOneProject($createProjectInput: CreateProjectInput!) {
  createOneProject(createProjectInput: $createProjectInput) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<CreateOneProjectMutation, CreateOneProjectMutationVariables>;
export const UpdateOneProjectDocument = new TypedDocumentString(`
    mutation UpdateOneProject($projectId: ID!, $updateProjectInput: UpdateProjectInput!) {
  updateOneProject(projectId: $projectId, updateProjectInput: $updateProjectInput) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<UpdateOneProjectMutation, UpdateOneProjectMutationVariables>;
export const UpdateManyProjectsDocument = new TypedDocumentString(`
    mutation UpdateManyProjects($projectIds: [ID!]!, $updateProjectInput: UpdateProjectInput!) {
  updateManyProjects(
    projectIds: $projectIds
    updateProjectInput: $updateProjectInput
  ) {
    count
  }
}
    `) as unknown as TypedDocumentString<UpdateManyProjectsMutation, UpdateManyProjectsMutationVariables>;
export const RemoveOneProjectDocument = new TypedDocumentString(`
    mutation RemoveOneProject($projectId: ID!) {
  removeOneProject(projectId: $projectId) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<RemoveOneProjectMutation, RemoveOneProjectMutationVariables>;
export const RemoveManyProjectsDocument = new TypedDocumentString(`
    mutation RemoveManyProjects($projectIds: [ID!]!) {
  removeManyProjects(projectIds: $projectIds) {
    count
  }
}
    `) as unknown as TypedDocumentString<RemoveManyProjectsMutation, RemoveManyProjectsMutationVariables>;
export const CreateOneSkillDocument = new TypedDocumentString(`
    mutation CreateOneSkill($createSkillInput: CreateSkillInput!) {
  createOneSkill(createSkillInput: $createSkillInput) {
    id
    name
    slug
    category
    relevance
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<CreateOneSkillMutation, CreateOneSkillMutationVariables>;
export const UpdateOneSkillDocument = new TypedDocumentString(`
    mutation UpdateOneSkill($skillId: ID!, $updateSkillInput: UpdateSkillInput!) {
  updateOneSkill(skillId: $skillId, updateSkillInput: $updateSkillInput) {
    id
    name
    slug
    category
    relevance
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<UpdateOneSkillMutation, UpdateOneSkillMutationVariables>;
export const UpdateManySkillsDocument = new TypedDocumentString(`
    mutation UpdateManySkills($skillIds: [ID!]!, $updateSkillInput: UpdateSkillInput!) {
  updateManySkills(skillIds: $skillIds, updateSkillInput: $updateSkillInput) {
    count
  }
}
    `) as unknown as TypedDocumentString<UpdateManySkillsMutation, UpdateManySkillsMutationVariables>;
export const RemoveOneSkillDocument = new TypedDocumentString(`
    mutation RemoveOneSkill($skillId: ID!) {
  removeOneSkill(skillId: $skillId) {
    id
    name
    slug
    category
    relevance
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<RemoveOneSkillMutation, RemoveOneSkillMutationVariables>;
export const RemoveManySkillsDocument = new TypedDocumentString(`
    mutation RemoveManySkills($skillIds: [ID!]!) {
  removeManySkills(skillIds: $skillIds) {
    count
  }
}
    `) as unknown as TypedDocumentString<RemoveManySkillsMutation, RemoveManySkillsMutationVariables>;
export const GetMeDocument = new TypedDocumentString(`
    query GetMe {
  getMe {
    id
    email
    name
    nickname
    role
    title
    avatar
  }
}
    `) as unknown as TypedDocumentString<GetMeQuery, GetMeQueryVariables>;
export const ApiStatusDocument = new TypedDocumentString(`
    query ApiStatus {
  __typename
}
    `) as unknown as TypedDocumentString<ApiStatusQuery, ApiStatusQueryVariables>;
export const FindManyCoursesDocument = new TypedDocumentString(`
    query FindManyCourses($courseFilters: FilterCourseInput, $coursePagination: PaginationInput, $courseSort: SortCourseInput) {
  findManyCourses(
    courseFilters: $courseFilters
    coursePagination: $coursePagination
    courseSort: $courseSort
  ) {
    found
    nodes {
      id
      slug
      status
      relevance
      url
      image
      hours
      organization {
        id
        name
        slug
      }
      i18n {
        locale
        messages {
          title
          description
        }
      }
      skills {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<FindManyCoursesQuery, FindManyCoursesQueryVariables>;
export const FindOneCourseByIdDocument = new TypedDocumentString(`
    query FindOneCourseById($courseId: ID!) {
  findOneCourseById(courseId: $courseId) {
    id
    slug
    status
    relevance
    url
    image
    hours
    organization {
      id
      name
      slug
    }
    i18n {
      locale
      messages {
        title
        description
      }
    }
    skills {
      id
      name
    }
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindOneCourseByIdQuery, FindOneCourseByIdQueryVariables>;
export const FindOneCourseDocument = new TypedDocumentString(`
    query FindOneCourse($courseFilters: FilterCourseInput) {
  findOneCourse(courseFilters: $courseFilters) {
    id
    slug
    status
    relevance
    url
    image
    hours
    organization {
      id
      name
      slug
    }
    i18n {
      locale
      messages {
        title
        description
      }
    }
    skills {
      id
      name
    }
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindOneCourseQuery, FindOneCourseQueryVariables>;
export const FindManyCourseByIdDocument = new TypedDocumentString(`
    query FindManyCourseById($courseIds: [ID!]!) {
  findManyCourseById(courseIds: $courseIds) {
    id
    slug
    status
    relevance
    url
    image
    hours
    organization {
      id
      name
      slug
    }
    i18n {
      locale
      messages {
        title
        description
      }
    }
    skills {
      id
      name
    }
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindManyCourseByIdQuery, FindManyCourseByIdQueryVariables>;
export const DashboardDocument = new TypedDocumentString(`
    query Dashboard {
  dashboard {
    totals {
      skills
      courses
      educations
      organizations
      projects
      experiences
    }
    skillsByCategory {
      label
      value
    }
    experiencesByCategory {
      label
      value
    }
    coursesByStatus {
      label
      value
    }
  }
}
    `) as unknown as TypedDocumentString<DashboardQuery, DashboardQueryVariables>;
export const FindManyEducationsDocument = new TypedDocumentString(`
    query FindManyEducations($educationFilters: FilterEducationInput, $educationPagination: PaginationInput, $educationSort: SortEducationInput) {
  findManyEducations(
    educationFilters: $educationFilters
    educationPagination: $educationPagination
    educationSort: $educationSort
  ) {
    found
    nodes {
      id
      slug
      level
      status
      relevance
      url
      image
      organization {
        id
        name
        slug
      }
      i18n {
        locale
        messages {
          title
          description
        }
      }
      skills {
        id
        name
      }
      period {
        from
        to
      }
      createdAt
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<FindManyEducationsQuery, FindManyEducationsQueryVariables>;
export const FindOneEducationByIdDocument = new TypedDocumentString(`
    query FindOneEducationById($educationId: ID!) {
  findOneEducationById(educationId: $educationId) {
    id
    slug
    level
    status
    relevance
    url
    image
    organization {
      id
      name
      slug
    }
    i18n {
      locale
      messages {
        title
        description
      }
    }
    skills {
      id
      name
    }
    period {
      from
      to
    }
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindOneEducationByIdQuery, FindOneEducationByIdQueryVariables>;
export const FindOneEducationDocument = new TypedDocumentString(`
    query FindOneEducation($educationFilters: FilterEducationInput) {
  findOneEducation(educationFilters: $educationFilters) {
    id
    slug
    level
    status
    relevance
    url
    image
    organization {
      id
      name
      slug
    }
    i18n {
      locale
      messages {
        title
        description
      }
    }
    skills {
      id
      name
    }
    period {
      from
      to
    }
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindOneEducationQuery, FindOneEducationQueryVariables>;
export const FindManyEducationByIdDocument = new TypedDocumentString(`
    query FindManyEducationById($educationIds: [ID!]!) {
  findManyEducationById(educationIds: $educationIds) {
    id
    slug
    level
    status
    relevance
    url
    image
    organization {
      id
      name
      slug
    }
    i18n {
      locale
      messages {
        title
        description
      }
    }
    skills {
      id
      name
    }
    period {
      from
      to
    }
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindManyEducationByIdQuery, FindManyEducationByIdQueryVariables>;
export const FindManyExperiencesDocument = new TypedDocumentString(`
    query FindManyExperiences($experienceFilters: FilterExperienceInput, $experiencePagination: PaginationInput, $experienceSort: SortExperienceInput) {
  findManyExperiences(
    experienceFilters: $experienceFilters
    experiencePagination: $experiencePagination
    experienceSort: $experienceSort
  ) {
    found
    nodes {
      id
      slug
      category
      relevance
      organization {
        id
        name
        slug
      }
      roles {
        i18n {
          locale
          messages {
            title
            description
          }
        }
        period {
          from
          to
        }
        skills {
          id
          name
        }
      }
      createdAt
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<FindManyExperiencesQuery, FindManyExperiencesQueryVariables>;
export const FindOneExperienceByIdDocument = new TypedDocumentString(`
    query FindOneExperienceById($experienceId: ID!) {
  findOneExperienceById(experienceId: $experienceId) {
    id
    slug
    category
    relevance
    organization {
      id
      name
      slug
    }
    roles {
      i18n {
        locale
        messages {
          title
          description
        }
      }
      period {
        from
        to
      }
      skills {
        id
        name
      }
    }
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindOneExperienceByIdQuery, FindOneExperienceByIdQueryVariables>;
export const FindOneExperienceDocument = new TypedDocumentString(`
    query FindOneExperience($experienceFilters: FilterExperienceInput) {
  findOneExperience(experienceFilters: $experienceFilters) {
    id
    slug
    category
    relevance
    organization {
      id
      name
      slug
    }
    roles {
      i18n {
        locale
        messages {
          title
          description
        }
      }
      period {
        from
        to
      }
      skills {
        id
        name
      }
    }
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindOneExperienceQuery, FindOneExperienceQueryVariables>;
export const FindManyExperienceByIdDocument = new TypedDocumentString(`
    query FindManyExperienceById($experienceIds: [ID!]!) {
  findManyExperienceById(experienceIds: $experienceIds) {
    id
    slug
    category
    relevance
    organization {
      id
      name
      slug
    }
    roles {
      i18n {
        locale
        messages {
          title
          description
        }
      }
      period {
        from
        to
      }
      skills {
        id
        name
      }
    }
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindManyExperienceByIdQuery, FindManyExperienceByIdQueryVariables>;
export const FindManyOrganizationsDocument = new TypedDocumentString(`
    query FindManyOrganizations($organizationFilters: FilterOrganizationInput, $organizationPagination: PaginationInput, $organizationSort: SortOrganizationInput) {
  findManyOrganizations(
    organizationFilters: $organizationFilters
    organizationPagination: $organizationPagination
    organizationSort: $organizationSort
  ) {
    found
    nodes {
      id
      name
      slug
      category
      logo
      website
      relevance
      createdAt
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<FindManyOrganizationsQuery, FindManyOrganizationsQueryVariables>;
export const FindOneOrganizationByIdDocument = new TypedDocumentString(`
    query FindOneOrganizationById($organizationId: ID!) {
  findOneOrganizationById(organizationId: $organizationId) {
    id
    name
    slug
    category
    logo
    website
    relevance
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindOneOrganizationByIdQuery, FindOneOrganizationByIdQueryVariables>;
export const FindOneOrganizationDocument = new TypedDocumentString(`
    query FindOneOrganization($organizationFilters: FilterOrganizationInput) {
  findOneOrganization(organizationFilters: $organizationFilters) {
    id
    name
    slug
    category
    logo
    website
    relevance
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindOneOrganizationQuery, FindOneOrganizationQueryVariables>;
export const FindManyOrganizationByIdDocument = new TypedDocumentString(`
    query FindManyOrganizationById($organizationIds: [ID!]!) {
  findManyOrganizationById(organizationIds: $organizationIds) {
    id
    name
    slug
    category
    logo
    website
    relevance
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindManyOrganizationByIdQuery, FindManyOrganizationByIdQueryVariables>;
export const FindManyProjectsDocument = new TypedDocumentString(`
    query FindManyProjects($projectFilters: FilterProjectInput, $projectPagination: PaginationInput, $projectSort: SortProjectInput) {
  findManyProjects(
    projectFilters: $projectFilters
    projectPagination: $projectPagination
    projectSort: $projectSort
  ) {
    found
    nodes {
      id
      slug
      relevance
      images
      urls {
        title
        value
      }
      i18n {
        locale
        messages {
          title
          description
        }
      }
      skills {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<FindManyProjectsQuery, FindManyProjectsQueryVariables>;
export const FindOneProjectByIdDocument = new TypedDocumentString(`
    query FindOneProjectById($projectId: ID!) {
  findOneProjectById(projectId: $projectId) {
    id
    slug
    relevance
    images
    urls {
      title
      value
    }
    i18n {
      locale
      messages {
        title
        description
      }
    }
    skills {
      id
      name
    }
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindOneProjectByIdQuery, FindOneProjectByIdQueryVariables>;
export const FindOneProjectDocument = new TypedDocumentString(`
    query FindOneProject($projectFilters: FilterProjectInput) {
  findOneProject(projectFilters: $projectFilters) {
    id
    slug
    relevance
    images
    urls {
      title
      value
    }
    i18n {
      locale
      messages {
        title
        description
      }
    }
    skills {
      id
      name
    }
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindOneProjectQuery, FindOneProjectQueryVariables>;
export const FindManyProjectByIdDocument = new TypedDocumentString(`
    query FindManyProjectById($projectIds: [ID!]!) {
  findManyProjectById(projectIds: $projectIds) {
    id
    slug
    relevance
    images
    urls {
      title
      value
    }
    i18n {
      locale
      messages {
        title
        description
      }
    }
    skills {
      id
      name
    }
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindManyProjectByIdQuery, FindManyProjectByIdQueryVariables>;
export const FindManySkillsDocument = new TypedDocumentString(`
    query FindManySkills($skillFilters: FilterSkillInput, $skillPagination: PaginationInput, $skillSort: SortSkillInput) {
  findManySkills(
    skillFilters: $skillFilters
    skillPagination: $skillPagination
    skillSort: $skillSort
  ) {
    found
    nodes {
      id
      name
      slug
      category
      relevance
      createdAt
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<FindManySkillsQuery, FindManySkillsQueryVariables>;
export const FindOneSkillByIdDocument = new TypedDocumentString(`
    query FindOneSkillById($skillId: ID!) {
  findOneSkillById(skillId: $skillId) {
    id
    name
    slug
    category
    relevance
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindOneSkillByIdQuery, FindOneSkillByIdQueryVariables>;
export const FindOneSkillDocument = new TypedDocumentString(`
    query FindOneSkill($skillFilters: FilterSkillInput) {
  findOneSkill(skillFilters: $skillFilters) {
    id
    name
    slug
    category
    relevance
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindOneSkillQuery, FindOneSkillQueryVariables>;
export const FindManySkillByIdDocument = new TypedDocumentString(`
    query FindManySkillById($skillIds: [ID!]!) {
  findManySkillById(skillIds: $skillIds) {
    id
    name
    slug
    category
    relevance
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<FindManySkillByIdQuery, FindManySkillByIdQueryVariables>;