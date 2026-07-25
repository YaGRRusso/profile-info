/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export enum ApiTokenPermission {
  Mutate = 'MUTATE',
  Query = 'QUERY'
}

export type AtsSummarizeInput = {
  details?: Array<DetailInput> | null | undefined;
  raw: string;
  skills: Array<string>;
  type: ResourceType;
};

export enum CatalogPartition {
  Global = 'GLOBAL',
  Local = 'LOCAL'
}

export enum ChatFinishReason {
  ContentFilter = 'CONTENT_FILTER',
  Error = 'ERROR',
  Length = 'LENGTH',
  Stop = 'STOP',
  ToolCalls = 'TOOL_CALLS'
}

export enum ChatRole {
  Assistant = 'ASSISTANT',
  Developer = 'DEVELOPER',
  System = 'SYSTEM',
  Tool = 'TOOL',
  User = 'USER'
}

export enum ContextMode {
  PageExtract = 'PAGE_EXTRACT',
  WebSearch = 'WEB_SEARCH'
}

export enum CourseStatus {
  Complete = 'COMPLETE',
  Incomplete = 'INCOMPLETE',
  InProgress = 'IN_PROGRESS'
}

export type CreateApiTokenInput = {
  expiresAt?: string | null | undefined;
  name: string;
  permissions: Array<ApiTokenPermission>;
};

export type CreateCourseInput = {
  hours?: number | null | undefined;
  i18n: Array<CreateCourseMessagesInputTranslationInput>;
  image?: string | null | undefined;
  organizationId: string;
  relevance?: number | null | undefined;
  skillIds?: Array<string> | null | undefined;
  slug?: string | null | undefined;
  status: CourseStatus;
  url?: string | null | undefined;
};

export type CreateCourseMessagesInput = {
  description: string;
  title: string;
};

export type CreateCourseMessagesInputTranslationInput = {
  locale: string;
  messages: CreateCourseMessagesInput;
};

export type CreateEducationInput = {
  i18n: Array<CreateEducationMessagesInputTranslationInput>;
  image?: string | null | undefined;
  level: EducationLevel;
  organizationId: string;
  period?: DateRangeInput | null | undefined;
  relevance?: number | null | undefined;
  skillIds?: Array<string> | null | undefined;
  slug?: string | null | undefined;
  status: EducationStatus;
  url?: string | null | undefined;
};

export type CreateEducationMessagesInput = {
  description: string;
  title: string;
};

export type CreateEducationMessagesInputTranslationInput = {
  locale: string;
  messages: CreateEducationMessagesInput;
};

export type CreateExperienceInput = {
  category: ExperienceCategory;
  i18n: Array<CreateExperienceMessagesInputTranslationInput>;
  organizationId: string;
  period?: DateRangeInput | null | undefined;
  relevance?: number | null | undefined;
  skillIds?: Array<string> | null | undefined;
  slug?: string | null | undefined;
};

export type CreateExperienceMessagesInput = {
  description: string;
  title: string;
};

export type CreateExperienceMessagesInputTranslationInput = {
  locale: string;
  messages: CreateExperienceMessagesInput;
};

export type CreateOrganizationInput = {
  category: OrganizationCategory;
  i18n: Array<CreateOrganizationMessagesInputTranslationInput>;
  logo?: string | null | undefined;
  name: string;
  slug?: string | null | undefined;
  website?: string | null | undefined;
};

export type CreateOrganizationMessagesInput = {
  description: string;
};

export type CreateOrganizationMessagesInputTranslationInput = {
  locale: string;
  messages: CreateOrganizationMessagesInput;
};

export type CreateProjectInput = {
  i18n: Array<CreateProjectMessagesInputTranslationInput>;
  images?: Array<string> | null | undefined;
  relevance?: number | null | undefined;
  skillIds?: Array<string> | null | undefined;
  slug?: string | null | undefined;
  urls?: Array<UrlInput> | null | undefined;
};

export type CreateProjectMessagesInput = {
  description: string;
  title: string;
};

export type CreateProjectMessagesInputTranslationInput = {
  locale: string;
  messages: CreateProjectMessagesInput;
};

export type CreateSkillInput = {
  category?: string | null | undefined;
  i18n: Array<CreateSkillMessagesInputTranslationInput>;
  slug?: string | null | undefined;
};

export type CreateSkillMessagesInput = {
  title: string;
};

export type CreateSkillMessagesInputTranslationInput = {
  locale: string;
  messages: CreateSkillMessagesInput;
};

export type CreateUserInput = {
  address?: string | null | undefined;
  avatar?: string | null | undefined;
  birth?: string | null | undefined;
  email: string;
  i18n?: Array<CreateUserMessagesInputTranslationInput> | null | undefined;
  locale?: Locale | null | undefined;
  locales?: Array<Locale> | null | undefined;
  name: string;
  nickname: string;
  password: string;
  phone?: string | null | undefined;
  role?: UserRole | null | undefined;
  skillIds?: Array<string> | null | undefined;
  urls?: Array<UrlInput> | null | undefined;
};

export type CreateUserMessagesInput = {
  description?: string | null | undefined;
  title?: string | null | undefined;
};

export type CreateUserMessagesInputTranslationInput = {
  locale: string;
  messages: CreateUserMessagesInput;
};

export enum DashboardActivityType {
  Course = 'COURSE',
  Education = 'EDUCATION',
  Experience = 'EXPERIENCE',
  Organization = 'ORGANIZATION',
  Project = 'PROJECT',
  Skill = 'SKILL'
}

export type DateRangeInput = {
  from?: string | null | undefined;
  to?: string | null | undefined;
};

export type DetailInput = {
  contextMode?: ContextMode | null | undefined;
  key: string;
  value: Array<string>;
};

export enum EducationLevel {
  Bachelor = 'BACHELOR',
  Doctorate = 'DOCTORATE',
  HighSchool = 'HIGH_SCHOOL',
  Master = 'MASTER',
  Postgrad = 'POSTGRAD',
  Technical = 'TECHNICAL'
}

export enum EducationStatus {
  Complete = 'COMPLETE',
  Incomplete = 'INCOMPLETE',
  InProgress = 'IN_PROGRESS'
}

export enum ExperienceCategory {
  Freelance = 'FREELANCE',
  FullTime = 'FULL_TIME',
  PartTime = 'PART_TIME',
  Volunteer = 'VOLUNTEER'
}

export type FilterApiTokenInput = {
  expiresAt?: string | null | undefined;
  name?: string | null | undefined;
  permissions?: Array<ApiTokenPermission> | null | undefined;
};

export type FilterCourseInput = {
  hours?: number | null | undefined;
  i18n?: Array<CreateCourseMessagesInputTranslationInput> | null | undefined;
  image?: string | null | undefined;
  organizationId?: string | null | undefined;
  relevance?: number | null | undefined;
  skillIds?: Array<string> | null | undefined;
  slug?: string | null | undefined;
  status?: CourseStatus | null | undefined;
  url?: string | null | undefined;
};

export type FilterEducationInput = {
  i18n?: Array<CreateEducationMessagesInputTranslationInput> | null | undefined;
  image?: string | null | undefined;
  level?: EducationLevel | null | undefined;
  organizationId?: string | null | undefined;
  period?: DateRangeInput | null | undefined;
  relevance?: number | null | undefined;
  skillIds?: Array<string> | null | undefined;
  slug?: string | null | undefined;
  status?: EducationStatus | null | undefined;
  url?: string | null | undefined;
};

export type FilterExperienceInput = {
  category?: ExperienceCategory | null | undefined;
  i18n?: Array<CreateExperienceMessagesInputTranslationInput> | null | undefined;
  organizationId?: string | null | undefined;
  period?: DateRangeInput | null | undefined;
  relevance?: number | null | undefined;
  skillIds?: Array<string> | null | undefined;
  slug?: string | null | undefined;
};

export type FilterOrganizationInput = {
  category?: OrganizationCategory | null | undefined;
  disabled?: boolean | null | undefined;
  i18n?: Array<CreateOrganizationMessagesInputTranslationInput> | null | undefined;
  logo?: string | null | undefined;
  name?: string | null | undefined;
  ownerId?: string | null | undefined;
  partition?: CatalogPartition | null | undefined;
  slug?: string | null | undefined;
  website?: string | null | undefined;
};

export type FilterProjectInput = {
  i18n?: Array<CreateProjectMessagesInputTranslationInput> | null | undefined;
  images?: Array<string> | null | undefined;
  relevance?: number | null | undefined;
  skillIds?: Array<string> | null | undefined;
  slug?: string | null | undefined;
  urls?: Array<UrlInput> | null | undefined;
};

export type FilterSkillInput = {
  category?: string | null | undefined;
  disabled?: boolean | null | undefined;
  ownerId?: string | null | undefined;
  partition?: CatalogPartition | null | undefined;
  slug?: string | null | undefined;
};

export type FilterUserInput = {
  address?: string | null | undefined;
  avatar?: string | null | undefined;
  birth?: string | null | undefined;
  disabled?: boolean | null | undefined;
  email?: string | null | undefined;
  i18n?: Array<CreateUserMessagesInputTranslationInput> | null | undefined;
  name?: string | null | undefined;
  nickname?: string | null | undefined;
  phone?: string | null | undefined;
  role?: UserRole | null | undefined;
  urls?: Array<UrlInput> | null | undefined;
};

export enum Locale {
  En = 'en',
  Es = 'es',
  Pt = 'pt'
}

export enum OrganizationCategory {
  Company = 'COMPANY',
  Other = 'OTHER',
  School = 'SCHOOL'
}

export type PaginationInput = {
  limit?: number | null | undefined;
  skip?: number | null | undefined;
};

export type RegisterUserInput = {
  email: string;
  locale: Locale;
  locales?: Array<Locale> | null | undefined;
  name: string;
  nickname: string;
  password: string;
};

export enum ResourceType {
  Course = 'COURSE',
  Education = 'EDUCATION',
  Experience = 'EXPERIENCE',
  Organization = 'ORGANIZATION',
  Project = 'PROJECT',
  User = 'USER'
}

export type SignInInput = {
  email: string;
  password: string;
};

export type SortApiTokenInput = {
  createdAt?: SortEnum | null | undefined;
  expiresAt?: SortEnum | null | undefined;
  name?: SortEnum | null | undefined;
  updatedAt?: SortEnum | null | undefined;
};

export type SortCourseInput = {
  createdAt?: SortEnum | null | undefined;
  relevance?: SortEnum | null | undefined;
  updatedAt?: SortEnum | null | undefined;
};

export type SortEducationInput = {
  createdAt?: SortEnum | null | undefined;
  relevance?: SortEnum | null | undefined;
  updatedAt?: SortEnum | null | undefined;
};

export enum SortEnum {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type SortExperienceInput = {
  createdAt?: SortEnum | null | undefined;
  relevance?: SortEnum | null | undefined;
  updatedAt?: SortEnum | null | undefined;
};

export type SortOrganizationInput = {
  createdAt?: SortEnum | null | undefined;
  name?: SortEnum | null | undefined;
  updatedAt?: SortEnum | null | undefined;
};

export type SortProjectInput = {
  createdAt?: SortEnum | null | undefined;
  relevance?: SortEnum | null | undefined;
  updatedAt?: SortEnum | null | undefined;
};

export type SortSkillInput = {
  createdAt?: SortEnum | null | undefined;
  slug?: SortEnum | null | undefined;
  updatedAt?: SortEnum | null | undefined;
};

export type SortUserInput = {
  createdAt?: SortEnum | null | undefined;
  name?: SortEnum | null | undefined;
  updatedAt?: SortEnum | null | undefined;
};

export type SummarizeInput = {
  details?: Array<DetailInput> | null | undefined;
  raw: string;
  type: ResourceType;
};

export type TranslateInput = {
  raw: string;
  sourceLanguage?: string | null | undefined;
  targetLanguage: string;
};

export type UpdateApiTokenInput = {
  expiresAt?: string | null | undefined;
  name?: string | null | undefined;
  permissions?: Array<ApiTokenPermission> | null | undefined;
};

export type UpdateCourseInput = {
  hours?: number | null | undefined;
  i18n?: Array<CreateCourseMessagesInputTranslationInput> | null | undefined;
  image?: string | null | undefined;
  organizationId?: string | null | undefined;
  relevance?: number | null | undefined;
  skillIds?: Array<string> | null | undefined;
  slug?: string | null | undefined;
  status?: CourseStatus | null | undefined;
  url?: string | null | undefined;
};

export type UpdateEducationInput = {
  i18n?: Array<CreateEducationMessagesInputTranslationInput> | null | undefined;
  image?: string | null | undefined;
  level?: EducationLevel | null | undefined;
  organizationId?: string | null | undefined;
  period?: DateRangeInput | null | undefined;
  relevance?: number | null | undefined;
  skillIds?: Array<string> | null | undefined;
  slug?: string | null | undefined;
  status?: EducationStatus | null | undefined;
  url?: string | null | undefined;
};

export type UpdateExperienceInput = {
  category?: ExperienceCategory | null | undefined;
  i18n?: Array<CreateExperienceMessagesInputTranslationInput> | null | undefined;
  organizationId?: string | null | undefined;
  period?: DateRangeInput | null | undefined;
  relevance?: number | null | undefined;
  skillIds?: Array<string> | null | undefined;
  slug?: string | null | undefined;
};

export type UpdateMeInput = {
  address?: string | null | undefined;
  avatar?: string | null | undefined;
  birth?: string | null | undefined;
  email?: string | null | undefined;
  i18n?: Array<CreateUserMessagesInputTranslationInput> | null | undefined;
  locale?: Locale | null | undefined;
  locales?: Array<Locale> | null | undefined;
  name?: string | null | undefined;
  nickname?: string | null | undefined;
  password?: string | null | undefined;
  phone?: string | null | undefined;
  skillIds?: Array<string> | null | undefined;
  urls?: Array<UrlInput> | null | undefined;
};

export type UpdateOrganizationInput = {
  category?: OrganizationCategory | null | undefined;
  disabled?: boolean | null | undefined;
  i18n?: Array<CreateOrganizationMessagesInputTranslationInput> | null | undefined;
  logo?: string | null | undefined;
  name?: string | null | undefined;
  slug?: string | null | undefined;
  website?: string | null | undefined;
};

export type UpdateProjectInput = {
  i18n?: Array<CreateProjectMessagesInputTranslationInput> | null | undefined;
  images?: Array<string> | null | undefined;
  relevance?: number | null | undefined;
  skillIds?: Array<string> | null | undefined;
  slug?: string | null | undefined;
  urls?: Array<UrlInput> | null | undefined;
};

export type UpdateSkillInput = {
  category?: string | null | undefined;
  disabled?: boolean | null | undefined;
  i18n?: Array<CreateSkillMessagesInputTranslationInput> | null | undefined;
  slug?: string | null | undefined;
};

export type UpdateUserInput = {
  address?: string | null | undefined;
  avatar?: string | null | undefined;
  birth?: string | null | undefined;
  email?: string | null | undefined;
  i18n?: Array<CreateUserMessagesInputTranslationInput> | null | undefined;
  locale?: Locale | null | undefined;
  locales?: Array<Locale> | null | undefined;
  name?: string | null | undefined;
  nickname?: string | null | undefined;
  password?: string | null | undefined;
  phone?: string | null | undefined;
  role?: UserRole | null | undefined;
  skillIds?: Array<string> | null | undefined;
  urls?: Array<UrlInput> | null | undefined;
};

export type UrlInput = {
  title: string;
  value: string;
};

export enum UserRole {
  SuperAdmin = 'SUPER_ADMIN',
  User = 'USER'
}

export type AtsSummarizeMutationVariables = Exact<{
  atsSummarizeInput: AtsSummarizeInput;
}>;


export type AtsSummarizeMutation = { atsSummarize: { messages: Array<{ finishReason: ChatFinishReason | null, message: { content: string, reasoning: string | null, refusal: string | null, role: ChatRole } }>, usage: { completionTokens: number | null, cost: number | null, promptTokens: number | null, totalTokens: number | null } | null } };

export type SummarizeMutationVariables = Exact<{
  summarizeInput: SummarizeInput;
}>;


export type SummarizeMutation = { summarize: { messages: Array<{ finishReason: ChatFinishReason | null, message: { content: string, reasoning: string | null, refusal: string | null, role: ChatRole } }>, usage: { completionTokens: number | null, cost: number | null, promptTokens: number | null, totalTokens: number | null } | null } };

export type TranslateMutationVariables = Exact<{
  translateInput: TranslateInput;
}>;


export type TranslateMutation = { translate: { messages: Array<{ finishReason: ChatFinishReason | null, message: { content: string, reasoning: string | null, refusal: string | null, role: ChatRole } }>, usage: { completionTokens: number | null, cost: number | null, promptTokens: number | null, totalTokens: number | null } | null } };

export type CreateOneApiTokenMutationVariables = Exact<{
  createApiTokenInput: CreateApiTokenInput;
}>;


export type CreateOneApiTokenMutation = { createOneApiToken: { token: string, apiToken: { id: string, ownerId: string, name: string, permissions: Array<ApiTokenPermission>, expiresAt: string | null, createdAt: string, updatedAt: string } } };

export type UpdateOneApiTokenMutationVariables = Exact<{
  apiTokenId: string | number;
  updateApiTokenInput: UpdateApiTokenInput;
}>;


export type UpdateOneApiTokenMutation = { updateOneApiToken: { id: string, ownerId: string, name: string, permissions: Array<ApiTokenPermission>, expiresAt: string | null, createdAt: string, updatedAt: string } };

export type UpdateManyApiTokensMutationVariables = Exact<{
  apiTokenIds: Array<string | number> | string | number;
  updateApiTokenInput: UpdateApiTokenInput;
}>;


export type UpdateManyApiTokensMutation = { updateManyApiTokens: { succeeded: number, failed: number } };

export type RemoveOneApiTokenMutationVariables = Exact<{
  apiTokenId: string | number;
}>;


export type RemoveOneApiTokenMutation = { removeOneApiToken: { id: string, name: string, permissions: Array<ApiTokenPermission>, expiresAt: string | null, createdAt: string, updatedAt: string } };

export type RemoveManyApiTokensMutationVariables = Exact<{
  apiTokenIds: Array<string | number> | string | number;
}>;


export type RemoveManyApiTokensMutation = { removeManyApiTokens: { succeeded: number, failed: number } };

export type SignInMutationVariables = Exact<{
  signInInput: SignInInput;
}>;


export type SignInMutation = { signIn: string };

export type RegisterMutationVariables = Exact<{
  registerInput: RegisterUserInput;
}>;


export type RegisterMutation = { register: { id: string, email: string, disabled: boolean } };

export type CreateOneCourseMutationVariables = Exact<{
  createCourseInput: CreateCourseInput;
}>;


export type CreateOneCourseMutation = { createOneCourse: { id: string, slug: string | null } };

export type UpdateOneCourseMutationVariables = Exact<{
  courseId: string | number;
  updateCourseInput: UpdateCourseInput;
}>;


export type UpdateOneCourseMutation = { updateOneCourse: { id: string, slug: string | null } };

export type UpdateManyCoursesMutationVariables = Exact<{
  courseIds: Array<string | number> | string | number;
  updateCourseInput: UpdateCourseInput;
}>;


export type UpdateManyCoursesMutation = { updateManyCourses: { succeeded: number, failed: number } };

export type RemoveOneCourseMutationVariables = Exact<{
  courseId: string | number;
}>;


export type RemoveOneCourseMutation = { removeOneCourse: { id: string, slug: string | null } };

export type RemoveManyCoursesMutationVariables = Exact<{
  courseIds: Array<string | number> | string | number;
}>;


export type RemoveManyCoursesMutation = { removeManyCourses: { succeeded: number, failed: number } };

export type CreateOneEducationMutationVariables = Exact<{
  createEducationInput: CreateEducationInput;
}>;


export type CreateOneEducationMutation = { createOneEducation: { id: string, slug: string | null } };

export type UpdateOneEducationMutationVariables = Exact<{
  educationId: string | number;
  updateEducationInput: UpdateEducationInput;
}>;


export type UpdateOneEducationMutation = { updateOneEducation: { id: string, slug: string | null } };

export type UpdateManyEducationsMutationVariables = Exact<{
  educationIds: Array<string | number> | string | number;
  updateEducationInput: UpdateEducationInput;
}>;


export type UpdateManyEducationsMutation = { updateManyEducations: { succeeded: number, failed: number } };

export type RemoveOneEducationMutationVariables = Exact<{
  educationId: string | number;
}>;


export type RemoveOneEducationMutation = { removeOneEducation: { id: string, slug: string | null } };

export type RemoveManyEducationsMutationVariables = Exact<{
  educationIds: Array<string | number> | string | number;
}>;


export type RemoveManyEducationsMutation = { removeManyEducations: { succeeded: number, failed: number } };

export type CreateOneExperienceMutationVariables = Exact<{
  createExperienceInput: CreateExperienceInput;
}>;


export type CreateOneExperienceMutation = { createOneExperience: { id: string, slug: string | null } };

export type UpdateOneExperienceMutationVariables = Exact<{
  experienceId: string | number;
  updateExperienceInput: UpdateExperienceInput;
}>;


export type UpdateOneExperienceMutation = { updateOneExperience: { id: string, slug: string | null } };

export type UpdateManyExperiencesMutationVariables = Exact<{
  experienceIds: Array<string | number> | string | number;
  updateExperienceInput: UpdateExperienceInput;
}>;


export type UpdateManyExperiencesMutation = { updateManyExperiences: { succeeded: number, failed: number } };

export type RemoveOneExperienceMutationVariables = Exact<{
  experienceId: string | number;
}>;


export type RemoveOneExperienceMutation = { removeOneExperience: { id: string, slug: string | null } };

export type RemoveManyExperiencesMutationVariables = Exact<{
  experienceIds: Array<string | number> | string | number;
}>;


export type RemoveManyExperiencesMutation = { removeManyExperiences: { succeeded: number, failed: number } };

export type CreateOneOrganizationMutationVariables = Exact<{
  createOrganizationInput: CreateOrganizationInput;
}>;


export type CreateOneOrganizationMutation = { createOneOrganization: { id: string, slug: string | null } };

export type UpdateOneOrganizationMutationVariables = Exact<{
  organizationId: string | number;
  updateOrganizationInput: UpdateOrganizationInput;
}>;


export type UpdateOneOrganizationMutation = { updateOneOrganization: { id: string, slug: string | null } };

export type UpdateManyOrganizationsMutationVariables = Exact<{
  organizationIds: Array<string | number> | string | number;
  updateOrganizationInput: UpdateOrganizationInput;
}>;


export type UpdateManyOrganizationsMutation = { updateManyOrganizations: { succeeded: number, failed: number } };

export type DisableOneOrganizationMutationVariables = Exact<{
  organizationId: string | number;
}>;


export type DisableOneOrganizationMutation = { disableOneOrganization: { id: string, slug: string | null } };

export type DisableManyOrganizationsMutationVariables = Exact<{
  organizationIds: Array<string | number> | string | number;
}>;


export type DisableManyOrganizationsMutation = { disableManyOrganizations: { succeeded: number, failed: number } };

export type EnableOneOrganizationMutationVariables = Exact<{
  organizationId: string | number;
}>;


export type EnableOneOrganizationMutation = { enableOneOrganization: { id: string, slug: string | null } };

export type EnableManyOrganizationsMutationVariables = Exact<{
  organizationIds: Array<string | number> | string | number;
}>;


export type EnableManyOrganizationsMutation = { enableManyOrganizations: { succeeded: number, failed: number } };

export type RemoveOneOrganizationMutationVariables = Exact<{
  organizationId: string | number;
}>;


export type RemoveOneOrganizationMutation = { removeOneOrganization: { id: string, slug: string | null } };

export type RemoveManyOrganizationsMutationVariables = Exact<{
  organizationIds: Array<string | number> | string | number;
}>;


export type RemoveManyOrganizationsMutation = { removeManyOrganizations: { succeeded: number, failed: number } };

export type CreateOneProjectMutationVariables = Exact<{
  createProjectInput: CreateProjectInput;
}>;


export type CreateOneProjectMutation = { createOneProject: { id: string, slug: string | null } };

export type UpdateOneProjectMutationVariables = Exact<{
  projectId: string | number;
  updateProjectInput: UpdateProjectInput;
}>;


export type UpdateOneProjectMutation = { updateOneProject: { id: string, slug: string | null } };

export type UpdateManyProjectsMutationVariables = Exact<{
  projectIds: Array<string | number> | string | number;
  updateProjectInput: UpdateProjectInput;
}>;


export type UpdateManyProjectsMutation = { updateManyProjects: { succeeded: number, failed: number } };

export type RemoveOneProjectMutationVariables = Exact<{
  projectId: string | number;
}>;


export type RemoveOneProjectMutation = { removeOneProject: { id: string, slug: string | null } };

export type RemoveManyProjectsMutationVariables = Exact<{
  projectIds: Array<string | number> | string | number;
}>;


export type RemoveManyProjectsMutation = { removeManyProjects: { succeeded: number, failed: number } };

export type CreateOneSkillMutationVariables = Exact<{
  createSkillInput: CreateSkillInput;
}>;


export type CreateOneSkillMutation = { createOneSkill: { id: string, slug: string | null, category: string | null, createdAt: string, updatedAt: string, i18n: Array<{ locale: string, messages: { title: string } }> } };

export type UpdateOneSkillMutationVariables = Exact<{
  skillId: string | number;
  updateSkillInput: UpdateSkillInput;
}>;


export type UpdateOneSkillMutation = { updateOneSkill: { id: string, slug: string | null, category: string | null, createdAt: string, updatedAt: string, i18n: Array<{ locale: string, messages: { title: string } }> } };

export type UpdateManySkillsMutationVariables = Exact<{
  skillIds: Array<string | number> | string | number;
  updateSkillInput: UpdateSkillInput;
}>;


export type UpdateManySkillsMutation = { updateManySkills: { succeeded: number, failed: number } };

export type DisableOneSkillMutationVariables = Exact<{
  skillId: string | number;
}>;


export type DisableOneSkillMutation = { disableOneSkill: { id: string, slug: string | null } };

export type DisableManySkillsMutationVariables = Exact<{
  skillIds: Array<string | number> | string | number;
}>;


export type DisableManySkillsMutation = { disableManySkills: { succeeded: number, failed: number } };

export type EnableOneSkillMutationVariables = Exact<{
  skillId: string | number;
}>;


export type EnableOneSkillMutation = { enableOneSkill: { id: string, slug: string | null } };

export type EnableManySkillsMutationVariables = Exact<{
  skillIds: Array<string | number> | string | number;
}>;


export type EnableManySkillsMutation = { enableManySkills: { succeeded: number, failed: number } };

export type RemoveOneSkillMutationVariables = Exact<{
  skillId: string | number;
}>;


export type RemoveOneSkillMutation = { removeOneSkill: { id: string, slug: string | null } };

export type RemoveManySkillsMutationVariables = Exact<{
  skillIds: Array<string | number> | string | number;
}>;


export type RemoveManySkillsMutation = { removeManySkills: { succeeded: number, failed: number } };

export type UpdateMeMutationVariables = Exact<{
  updateMeInput: UpdateMeInput;
}>;


export type UpdateMeMutation = { updateMe: { id: string, email: string, name: string, nickname: string, role: UserRole, avatar: string | null, phone: string | null, birth: string | null, address: string | null, locale: Locale | null, locales: Array<Locale> | null, i18n: Array<{ locale: string, messages: { title: string | null, description: string | null } }> | null, urls: Array<{ title: string, value: string }> | null } };

export type CreateOneUserMutationVariables = Exact<{
  createUserInput: CreateUserInput;
}>;


export type CreateOneUserMutation = { createOneUser: { id: string } };

export type CreateManyUsersMutationVariables = Exact<{
  createUserInputs: Array<CreateUserInput> | CreateUserInput;
}>;


export type CreateManyUsersMutation = { createManyUsers: { succeeded: number, failed: number } };

export type UpdateOneUserMutationVariables = Exact<{
  userId: string | number;
  updateUserInput: UpdateUserInput;
}>;


export type UpdateOneUserMutation = { updateOneUser: { id: string } };

export type UpdateManyUsersMutationVariables = Exact<{
  userIds: Array<string | number> | string | number;
  updateUserInput: UpdateUserInput;
}>;


export type UpdateManyUsersMutation = { updateManyUsers: { succeeded: number, failed: number } };

export type RemoveOneUserMutationVariables = Exact<{
  userId: string | number;
}>;


export type RemoveOneUserMutation = { removeOneUser: { id: string } };

export type RemoveManyUsersMutationVariables = Exact<{
  userIds: Array<string | number> | string | number;
}>;


export type RemoveManyUsersMutation = { removeManyUsers: { succeeded: number, failed: number } };

export type ToggleStatusOneUserMutationVariables = Exact<{
  userId: string | number;
  disabled: boolean;
}>;


export type ToggleStatusOneUserMutation = { toggleStatusOneUser: { id: string } };

export type ToggleStatusManyUsersMutationVariables = Exact<{
  userIds: Array<string | number> | string | number;
  disabled: boolean;
}>;


export type ToggleStatusManyUsersMutation = { toggleStatusManyUsers: { succeeded: number, failed: number } };

export type FindManyApiTokensQueryVariables = Exact<{
  apiTokenFilters?: FilterApiTokenInput | null | undefined;
  apiTokenPagination?: PaginationInput | null | undefined;
  apiTokenSort?: SortApiTokenInput | null | undefined;
}>;


export type FindManyApiTokensQuery = { findManyApiTokens: { found: number, nodes: Array<{ id: string, ownerId: string, name: string, permissions: Array<ApiTokenPermission>, expiresAt: string | null, createdAt: string, updatedAt: string, owner: { id: string, nickname: string, name: string, role: UserRole, email: string, phone: string | null, avatar: string | null } }> } };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { getMe: { id: string, email: string, name: string, nickname: string, role: UserRole, avatar: string | null, phone: string | null, birth: string | null, address: string | null, locale: Locale | null, locales: Array<Locale> | null, skillIds: Array<string> | null, i18n: Array<{ locale: string, messages: { title: string | null, description: string | null } }> | null, urls: Array<{ title: string, value: string }> | null, skills: Array<{ id: string, slug: string | null, i18n: Array<{ locale: string, messages: { title: string } }> }> | null } };

export type FindManyCoursesQueryVariables = Exact<{
  courseFilters?: FilterCourseInput | null | undefined;
  coursePagination?: PaginationInput | null | undefined;
  courseSort?: SortCourseInput | null | undefined;
}>;


export type FindManyCoursesQuery = { findManyCourses: { found: number, nodes: Array<{ id: string, slug: string | null, status: CourseStatus, relevance: number, url: string | null, image: string | null, hours: number | null, createdAt: string, updatedAt: string, owner: { id: string, nickname: string, name: string, role: UserRole, email: string, phone: string | null, avatar: string | null }, organization: { id: string, name: string, slug: string | null } | null, i18n: Array<{ locale: string, messages: { title: string, description: string } }>, skills: Array<{ id: string, slug: string | null, i18n: Array<{ locale: string, messages: { title: string } }> }> | null }> } };

export type DashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardQuery = { dashboard: { totals: { skills: number, courses: number, educations: number, organizations: number, projects: number, experiences: number, ownedLocalSkills: number, ownedLocalOrganizations: number }, experiencesByCategory: Array<{ label: string, value: number }>, coursesByStatus: Array<{ label: string, value: number }>, recentActivity: Array<{ type: DashboardActivityType, slug: string | null, updatedAt: string, i18n: Array<{ locale: string, messages: { title: string } }> }> } };

export type FindManyEducationsQueryVariables = Exact<{
  educationFilters?: FilterEducationInput | null | undefined;
  educationPagination?: PaginationInput | null | undefined;
  educationSort?: SortEducationInput | null | undefined;
}>;


export type FindManyEducationsQuery = { findManyEducations: { found: number, nodes: Array<{ id: string, slug: string | null, level: EducationLevel, status: EducationStatus, relevance: number, url: string | null, image: string | null, createdAt: string, updatedAt: string, owner: { id: string, nickname: string, name: string, role: UserRole, email: string, phone: string | null, avatar: string | null }, organization: { id: string, name: string, slug: string | null } | null, i18n: Array<{ locale: string, messages: { title: string, description: string } }>, skills: Array<{ id: string, slug: string | null, i18n: Array<{ locale: string, messages: { title: string } }> }> | null, period: { from: string | null, to: string | null } | null }> } };

export type FindManyExperiencesQueryVariables = Exact<{
  experienceFilters?: FilterExperienceInput | null | undefined;
  experiencePagination?: PaginationInput | null | undefined;
  experienceSort?: SortExperienceInput | null | undefined;
}>;


export type FindManyExperiencesQuery = { findManyExperiences: { found: number, nodes: Array<{ id: string, slug: string | null, category: ExperienceCategory, relevance: number, createdAt: string, updatedAt: string, owner: { id: string, nickname: string, name: string, role: UserRole, email: string, phone: string | null, avatar: string | null }, organization: { id: string, name: string, slug: string | null } | null, i18n: Array<{ locale: string, messages: { title: string, description: string } }>, period: { from: string | null, to: string | null } | null, skills: Array<{ id: string, slug: string | null, i18n: Array<{ locale: string, messages: { title: string } }> }> | null }> } };

export type FindManyOrganizationsQueryVariables = Exact<{
  organizationFilters?: FilterOrganizationInput | null | undefined;
  organizationPagination?: PaginationInput | null | undefined;
  organizationSort?: SortOrganizationInput | null | undefined;
}>;


export type FindManyOrganizationsQuery = { findManyOrganizations: { found: number, nodes: Array<{ id: string, name: string, slug: string | null, category: OrganizationCategory, logo: string | null, website: string | null, disabled: boolean, partition: CatalogPartition, createdAt: string, updatedAt: string, owner: { id: string, nickname: string, name: string, role: UserRole, email: string, phone: string | null, avatar: string | null }, i18n: Array<{ locale: string, messages: { description: string } }> }> } };

export type FindManyActiveOrganizationsQueryVariables = Exact<{
  organizationFilters?: FilterOrganizationInput | null | undefined;
  organizationPagination?: PaginationInput | null | undefined;
  organizationSort?: SortOrganizationInput | null | undefined;
}>;


export type FindManyActiveOrganizationsQuery = { findManyActiveOrganizations: { found: number, nodes: Array<{ id: string, name: string, slug: string | null, category: OrganizationCategory, logo: string | null, website: string | null, disabled: boolean, partition: CatalogPartition, createdAt: string, updatedAt: string, owner: { id: string, nickname: string, name: string, role: UserRole, email: string, phone: string | null, avatar: string | null }, i18n: Array<{ locale: string, messages: { description: string } }> }> } };

export type FindManyProjectsQueryVariables = Exact<{
  projectFilters?: FilterProjectInput | null | undefined;
  projectPagination?: PaginationInput | null | undefined;
  projectSort?: SortProjectInput | null | undefined;
}>;


export type FindManyProjectsQuery = { findManyProjects: { found: number, nodes: Array<{ id: string, slug: string | null, relevance: number, images: Array<string> | null, createdAt: string, updatedAt: string, owner: { id: string, nickname: string, name: string, role: UserRole, email: string, phone: string | null, avatar: string | null }, urls: Array<{ title: string, value: string }> | null, i18n: Array<{ locale: string, messages: { title: string, description: string } }>, skills: Array<{ id: string, slug: string | null, i18n: Array<{ locale: string, messages: { title: string } }> }> | null }> } };

export type FindManySkillsQueryVariables = Exact<{
  skillFilters?: FilterSkillInput | null | undefined;
  skillPagination?: PaginationInput | null | undefined;
  skillSort?: SortSkillInput | null | undefined;
}>;


export type FindManySkillsQuery = { findManySkills: { found: number, nodes: Array<{ id: string, slug: string | null, category: string | null, disabled: boolean, partition: CatalogPartition, createdAt: string, updatedAt: string, owner: { id: string, nickname: string, name: string, role: UserRole, email: string, phone: string | null, avatar: string | null }, i18n: Array<{ locale: string, messages: { title: string } }> }> } };

export type FindManyActiveSkillsQueryVariables = Exact<{
  skillFilters?: FilterSkillInput | null | undefined;
  skillPagination?: PaginationInput | null | undefined;
  skillSort?: SortSkillInput | null | undefined;
}>;


export type FindManyActiveSkillsQuery = { findManyActiveSkills: { found: number, nodes: Array<{ id: string, slug: string | null, category: string | null, disabled: boolean, partition: CatalogPartition, createdAt: string, updatedAt: string, owner: { id: string, nickname: string, name: string, role: UserRole, email: string, phone: string | null, avatar: string | null }, i18n: Array<{ locale: string, messages: { title: string } }> }> } };

export type FindManyUsersQueryVariables = Exact<{
  userFilters?: FilterUserInput | null | undefined;
  userPagination?: PaginationInput | null | undefined;
  userSort?: SortUserInput | null | undefined;
}>;


export type FindManyUsersQuery = { findManyUsers: { found: number, nodes: Array<{ id: string, name: string, nickname: string, email: string, avatar: string | null, phone: string | null, role: UserRole, disabled: boolean, createdAt: string, updatedAt: string, ownedCounts: { experiences: number, educations: number, courses: number, projects: number } }> } };

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
export const SummarizeDocument = new TypedDocumentString(`
    mutation Summarize($summarizeInput: SummarizeInput!) {
  summarize(summarizeInput: $summarizeInput) {
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
    `) as unknown as TypedDocumentString<SummarizeMutation, SummarizeMutationVariables>;
export const TranslateDocument = new TypedDocumentString(`
    mutation Translate($translateInput: TranslateInput!) {
  translate(translateInput: $translateInput) {
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
    `) as unknown as TypedDocumentString<TranslateMutation, TranslateMutationVariables>;
export const CreateOneApiTokenDocument = new TypedDocumentString(`
    mutation CreateOneApiToken($createApiTokenInput: CreateApiTokenInput!) {
  createOneApiToken(createApiTokenInput: $createApiTokenInput) {
    token
    apiToken {
      id
      ownerId
      name
      permissions
      expiresAt
      createdAt
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<CreateOneApiTokenMutation, CreateOneApiTokenMutationVariables>;
export const UpdateOneApiTokenDocument = new TypedDocumentString(`
    mutation UpdateOneApiToken($apiTokenId: ID!, $updateApiTokenInput: UpdateApiTokenInput!) {
  updateOneApiToken(
    apiTokenId: $apiTokenId
    updateApiTokenInput: $updateApiTokenInput
  ) {
    id
    ownerId
    name
    permissions
    expiresAt
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<UpdateOneApiTokenMutation, UpdateOneApiTokenMutationVariables>;
export const UpdateManyApiTokensDocument = new TypedDocumentString(`
    mutation UpdateManyApiTokens($apiTokenIds: [ID!]!, $updateApiTokenInput: UpdateApiTokenInput!) {
  updateManyApiTokens(
    apiTokenIds: $apiTokenIds
    updateApiTokenInput: $updateApiTokenInput
  ) {
    succeeded
    failed
  }
}
    `) as unknown as TypedDocumentString<UpdateManyApiTokensMutation, UpdateManyApiTokensMutationVariables>;
export const RemoveOneApiTokenDocument = new TypedDocumentString(`
    mutation RemoveOneApiToken($apiTokenId: ID!) {
  removeOneApiToken(apiTokenId: $apiTokenId) {
    id
    name
    permissions
    expiresAt
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<RemoveOneApiTokenMutation, RemoveOneApiTokenMutationVariables>;
export const RemoveManyApiTokensDocument = new TypedDocumentString(`
    mutation RemoveManyApiTokens($apiTokenIds: [ID!]!) {
  removeManyApiTokens(apiTokenIds: $apiTokenIds) {
    succeeded
    failed
  }
}
    `) as unknown as TypedDocumentString<RemoveManyApiTokensMutation, RemoveManyApiTokensMutationVariables>;
export const SignInDocument = new TypedDocumentString(`
    mutation SignIn($signInInput: SignInInput!) {
  signIn(signInInput: $signInInput)
}
    `) as unknown as TypedDocumentString<SignInMutation, SignInMutationVariables>;
export const RegisterDocument = new TypedDocumentString(`
    mutation Register($registerInput: RegisterUserInput!) {
  register(registerInput: $registerInput) {
    id
    email
    disabled
  }
}
    `) as unknown as TypedDocumentString<RegisterMutation, RegisterMutationVariables>;
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
    succeeded
    failed
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
    succeeded
    failed
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
    succeeded
    failed
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
    succeeded
    failed
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
    succeeded
    failed
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
    succeeded
    failed
  }
}
    `) as unknown as TypedDocumentString<RemoveManyExperiencesMutation, RemoveManyExperiencesMutationVariables>;
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
    succeeded
    failed
  }
}
    `) as unknown as TypedDocumentString<UpdateManyOrganizationsMutation, UpdateManyOrganizationsMutationVariables>;
export const DisableOneOrganizationDocument = new TypedDocumentString(`
    mutation DisableOneOrganization($organizationId: ID!) {
  disableOneOrganization(organizationId: $organizationId) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<DisableOneOrganizationMutation, DisableOneOrganizationMutationVariables>;
export const DisableManyOrganizationsDocument = new TypedDocumentString(`
    mutation DisableManyOrganizations($organizationIds: [ID!]!) {
  disableManyOrganizations(organizationIds: $organizationIds) {
    succeeded
    failed
  }
}
    `) as unknown as TypedDocumentString<DisableManyOrganizationsMutation, DisableManyOrganizationsMutationVariables>;
export const EnableOneOrganizationDocument = new TypedDocumentString(`
    mutation EnableOneOrganization($organizationId: ID!) {
  enableOneOrganization(organizationId: $organizationId) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<EnableOneOrganizationMutation, EnableOneOrganizationMutationVariables>;
export const EnableManyOrganizationsDocument = new TypedDocumentString(`
    mutation EnableManyOrganizations($organizationIds: [ID!]!) {
  enableManyOrganizations(organizationIds: $organizationIds) {
    succeeded
    failed
  }
}
    `) as unknown as TypedDocumentString<EnableManyOrganizationsMutation, EnableManyOrganizationsMutationVariables>;
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
    succeeded
    failed
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
    succeeded
    failed
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
    succeeded
    failed
  }
}
    `) as unknown as TypedDocumentString<RemoveManyProjectsMutation, RemoveManyProjectsMutationVariables>;
export const CreateOneSkillDocument = new TypedDocumentString(`
    mutation CreateOneSkill($createSkillInput: CreateSkillInput!) {
  createOneSkill(createSkillInput: $createSkillInput) {
    id
    slug
    category
    createdAt
    updatedAt
    i18n {
      locale
      messages {
        title
      }
    }
  }
}
    `) as unknown as TypedDocumentString<CreateOneSkillMutation, CreateOneSkillMutationVariables>;
export const UpdateOneSkillDocument = new TypedDocumentString(`
    mutation UpdateOneSkill($skillId: ID!, $updateSkillInput: UpdateSkillInput!) {
  updateOneSkill(skillId: $skillId, updateSkillInput: $updateSkillInput) {
    id
    slug
    category
    createdAt
    updatedAt
    i18n {
      locale
      messages {
        title
      }
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateOneSkillMutation, UpdateOneSkillMutationVariables>;
export const UpdateManySkillsDocument = new TypedDocumentString(`
    mutation UpdateManySkills($skillIds: [ID!]!, $updateSkillInput: UpdateSkillInput!) {
  updateManySkills(skillIds: $skillIds, updateSkillInput: $updateSkillInput) {
    succeeded
    failed
  }
}
    `) as unknown as TypedDocumentString<UpdateManySkillsMutation, UpdateManySkillsMutationVariables>;
export const DisableOneSkillDocument = new TypedDocumentString(`
    mutation DisableOneSkill($skillId: ID!) {
  disableOneSkill(skillId: $skillId) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<DisableOneSkillMutation, DisableOneSkillMutationVariables>;
export const DisableManySkillsDocument = new TypedDocumentString(`
    mutation DisableManySkills($skillIds: [ID!]!) {
  disableManySkills(skillIds: $skillIds) {
    succeeded
    failed
  }
}
    `) as unknown as TypedDocumentString<DisableManySkillsMutation, DisableManySkillsMutationVariables>;
export const EnableOneSkillDocument = new TypedDocumentString(`
    mutation EnableOneSkill($skillId: ID!) {
  enableOneSkill(skillId: $skillId) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<EnableOneSkillMutation, EnableOneSkillMutationVariables>;
export const EnableManySkillsDocument = new TypedDocumentString(`
    mutation EnableManySkills($skillIds: [ID!]!) {
  enableManySkills(skillIds: $skillIds) {
    succeeded
    failed
  }
}
    `) as unknown as TypedDocumentString<EnableManySkillsMutation, EnableManySkillsMutationVariables>;
export const RemoveOneSkillDocument = new TypedDocumentString(`
    mutation RemoveOneSkill($skillId: ID!) {
  removeOneSkill(skillId: $skillId) {
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<RemoveOneSkillMutation, RemoveOneSkillMutationVariables>;
export const RemoveManySkillsDocument = new TypedDocumentString(`
    mutation RemoveManySkills($skillIds: [ID!]!) {
  removeManySkills(skillIds: $skillIds) {
    succeeded
    failed
  }
}
    `) as unknown as TypedDocumentString<RemoveManySkillsMutation, RemoveManySkillsMutationVariables>;
export const UpdateMeDocument = new TypedDocumentString(`
    mutation UpdateMe($updateMeInput: UpdateMeInput!) {
  updateMe(updateMeInput: $updateMeInput) {
    id
    email
    name
    nickname
    role
    avatar
    phone
    birth
    address
    locale
    locales
    i18n {
      locale
      messages {
        title
        description
      }
    }
    urls {
      title
      value
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateMeMutation, UpdateMeMutationVariables>;
export const CreateOneUserDocument = new TypedDocumentString(`
    mutation CreateOneUser($createUserInput: CreateUserInput!) {
  createOneUser(createUserInput: $createUserInput) {
    id
  }
}
    `) as unknown as TypedDocumentString<CreateOneUserMutation, CreateOneUserMutationVariables>;
export const CreateManyUsersDocument = new TypedDocumentString(`
    mutation CreateManyUsers($createUserInputs: [CreateUserInput!]!) {
  createManyUsers(createUserInputs: $createUserInputs) {
    succeeded
    failed
  }
}
    `) as unknown as TypedDocumentString<CreateManyUsersMutation, CreateManyUsersMutationVariables>;
export const UpdateOneUserDocument = new TypedDocumentString(`
    mutation UpdateOneUser($userId: ID!, $updateUserInput: UpdateUserInput!) {
  updateOneUser(userId: $userId, updateUserInput: $updateUserInput) {
    id
  }
}
    `) as unknown as TypedDocumentString<UpdateOneUserMutation, UpdateOneUserMutationVariables>;
export const UpdateManyUsersDocument = new TypedDocumentString(`
    mutation UpdateManyUsers($userIds: [ID!]!, $updateUserInput: UpdateUserInput!) {
  updateManyUsers(userIds: $userIds, updateUserInput: $updateUserInput) {
    succeeded
    failed
  }
}
    `) as unknown as TypedDocumentString<UpdateManyUsersMutation, UpdateManyUsersMutationVariables>;
export const RemoveOneUserDocument = new TypedDocumentString(`
    mutation RemoveOneUser($userId: ID!) {
  removeOneUser(userId: $userId) {
    id
  }
}
    `) as unknown as TypedDocumentString<RemoveOneUserMutation, RemoveOneUserMutationVariables>;
export const RemoveManyUsersDocument = new TypedDocumentString(`
    mutation RemoveManyUsers($userIds: [ID!]!) {
  removeManyUsers(userIds: $userIds) {
    succeeded
    failed
  }
}
    `) as unknown as TypedDocumentString<RemoveManyUsersMutation, RemoveManyUsersMutationVariables>;
export const ToggleStatusOneUserDocument = new TypedDocumentString(`
    mutation ToggleStatusOneUser($userId: ID!, $disabled: Boolean!) {
  toggleStatusOneUser(userId: $userId, disabled: $disabled) {
    id
  }
}
    `) as unknown as TypedDocumentString<ToggleStatusOneUserMutation, ToggleStatusOneUserMutationVariables>;
export const ToggleStatusManyUsersDocument = new TypedDocumentString(`
    mutation ToggleStatusManyUsers($userIds: [ID!]!, $disabled: Boolean!) {
  toggleStatusManyUsers(userIds: $userIds, disabled: $disabled) {
    succeeded
    failed
  }
}
    `) as unknown as TypedDocumentString<ToggleStatusManyUsersMutation, ToggleStatusManyUsersMutationVariables>;
export const FindManyApiTokensDocument = new TypedDocumentString(`
    query FindManyApiTokens($apiTokenFilters: FilterApiTokenInput, $apiTokenPagination: PaginationInput, $apiTokenSort: SortApiTokenInput) {
  findManyApiTokens(
    apiTokenFilters: $apiTokenFilters
    apiTokenPagination: $apiTokenPagination
    apiTokenSort: $apiTokenSort
  ) {
    found
    nodes {
      id
      ownerId
      owner {
        id
        nickname
        name
        role
        email
        phone
        avatar
      }
      name
      permissions
      expiresAt
      createdAt
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<FindManyApiTokensQuery, FindManyApiTokensQueryVariables>;
export const GetMeDocument = new TypedDocumentString(`
    query GetMe {
  getMe {
    id
    email
    name
    nickname
    role
    avatar
    phone
    birth
    address
    locale
    locales
    i18n {
      locale
      messages {
        title
        description
      }
    }
    urls {
      title
      value
    }
    skillIds
    skills {
      id
      slug
      i18n {
        locale
        messages {
          title
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<GetMeQuery, GetMeQueryVariables>;
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
      owner {
        id
        nickname
        name
        role
        email
        phone
        avatar
      }
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
        slug
        i18n {
          locale
          messages {
            title
          }
        }
      }
      createdAt
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<FindManyCoursesQuery, FindManyCoursesQueryVariables>;
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
      ownedLocalSkills
      ownedLocalOrganizations
    }
    experiencesByCategory {
      label
      value
    }
    coursesByStatus {
      label
      value
    }
    recentActivity {
      type
      slug
      i18n {
        locale
        messages {
          title
        }
      }
      updatedAt
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
      owner {
        id
        nickname
        name
        role
        email
        phone
        avatar
      }
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
        slug
        i18n {
          locale
          messages {
            title
          }
        }
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
      owner {
        id
        nickname
        name
        role
        email
        phone
        avatar
      }
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
      period {
        from
        to
      }
      skills {
        id
        slug
        i18n {
          locale
          messages {
            title
          }
        }
      }
      createdAt
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<FindManyExperiencesQuery, FindManyExperiencesQueryVariables>;
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
      disabled
      partition
      owner {
        id
        nickname
        name
        role
        email
        phone
        avatar
      }
      i18n {
        locale
        messages {
          description
        }
      }
      createdAt
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<FindManyOrganizationsQuery, FindManyOrganizationsQueryVariables>;
export const FindManyActiveOrganizationsDocument = new TypedDocumentString(`
    query FindManyActiveOrganizations($organizationFilters: FilterOrganizationInput, $organizationPagination: PaginationInput, $organizationSort: SortOrganizationInput) {
  findManyActiveOrganizations(
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
      disabled
      partition
      owner {
        id
        nickname
        name
        role
        email
        phone
        avatar
      }
      i18n {
        locale
        messages {
          description
        }
      }
      createdAt
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<FindManyActiveOrganizationsQuery, FindManyActiveOrganizationsQueryVariables>;
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
      owner {
        id
        nickname
        name
        role
        email
        phone
        avatar
      }
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
        slug
        i18n {
          locale
          messages {
            title
          }
        }
      }
      createdAt
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<FindManyProjectsQuery, FindManyProjectsQueryVariables>;
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
      slug
      category
      disabled
      partition
      owner {
        id
        nickname
        name
        role
        email
        phone
        avatar
      }
      i18n {
        locale
        messages {
          title
        }
      }
      createdAt
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<FindManySkillsQuery, FindManySkillsQueryVariables>;
export const FindManyActiveSkillsDocument = new TypedDocumentString(`
    query FindManyActiveSkills($skillFilters: FilterSkillInput, $skillPagination: PaginationInput, $skillSort: SortSkillInput) {
  findManyActiveSkills(
    skillFilters: $skillFilters
    skillPagination: $skillPagination
    skillSort: $skillSort
  ) {
    found
    nodes {
      id
      slug
      category
      disabled
      partition
      owner {
        id
        nickname
        name
        role
        email
        phone
        avatar
      }
      i18n {
        locale
        messages {
          title
        }
      }
      createdAt
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<FindManyActiveSkillsQuery, FindManyActiveSkillsQueryVariables>;
export const FindManyUsersDocument = new TypedDocumentString(`
    query FindManyUsers($userFilters: FilterUserInput, $userPagination: PaginationInput, $userSort: SortUserInput) {
  findManyUsers(
    userFilters: $userFilters
    userPagination: $userPagination
    userSort: $userSort
  ) {
    found
    nodes {
      id
      name
      nickname
      email
      avatar
      phone
      role
      disabled
      ownedCounts {
        experiences
        educations
        courses
        projects
      }
      createdAt
      updatedAt
    }
  }
}
    `) as unknown as TypedDocumentString<FindManyUsersQuery, FindManyUsersQueryVariables>;