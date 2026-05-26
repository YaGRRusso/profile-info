/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation SignIn($signInInput: SignInInput!) {\n    signIn(signInInput: $signInInput)\n  }\n": typeof types.SignInDocument,
    "\n  mutation CreateOneSkill($createSkillInput: CreateSkillInput!) {\n    createOneSkill(createSkillInput: $createSkillInput) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateOneSkillDocument,
    "\n  mutation UpdateOneSkill($SkillId: ID!, $updateSkillInput: UpdateSkillInput!) {\n    updateOneSkill(SkillId: $SkillId, updateSkillInput: $updateSkillInput) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.UpdateOneSkillDocument,
    "\n  mutation UpdateManySkills(\n    $SkillIds: [ID!]!\n    $updateSkillInput: UpdateSkillInput!\n  ) {\n    updateManySkills(SkillIds: $SkillIds, updateSkillInput: $updateSkillInput) {\n      count\n    }\n  }\n": typeof types.UpdateManySkillsDocument,
    "\n  mutation RemoveOneSkill($SkillId: ID!) {\n    removeOneSkill(SkillId: $SkillId) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.RemoveOneSkillDocument,
    "\n  mutation RemoveManySkills($SkillIds: [ID!]!) {\n    removeManySkills(SkillIds: $SkillIds) {\n      count\n    }\n  }\n": typeof types.RemoveManySkillsDocument,
    "\n  query GetMe {\n    getMe {\n      id\n      email\n      name\n      nickname\n      role\n      title\n      avatar\n    }\n  }\n": typeof types.GetMeDocument,
    "\n  query ApiStatus {\n    __typename\n  }\n": typeof types.ApiStatusDocument,
    "\n  query FindManySkills(\n    $SkillFilters: FilterSkillInput\n    $SkillPagination: PaginationInput\n    $SkillSort: SortSkillInput\n  ) {\n    findManySkills(\n      SkillFilters: $SkillFilters\n      SkillPagination: $SkillPagination\n      SkillSort: $SkillSort\n    ) {\n      found\n      nodes {\n        id\n        name\n        slug\n        category\n        relevance\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": typeof types.FindManySkillsDocument,
    "\n  query FindOneSkillById($SkillId: ID!) {\n    findOneSkillById(SkillId: $SkillId) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.FindOneSkillByIdDocument,
    "\n  query FindOneSkill($SkillFilters: FilterSkillInput) {\n    findOneSkill(SkillFilters: $SkillFilters) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.FindOneSkillDocument,
    "\n  query FindManySkillById($SkillIds: [ID!]!) {\n    findManySkillById(SkillIds: $SkillIds) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.FindManySkillByIdDocument,
};
const documents: Documents = {
    "\n  mutation SignIn($signInInput: SignInInput!) {\n    signIn(signInInput: $signInInput)\n  }\n": types.SignInDocument,
    "\n  mutation CreateOneSkill($createSkillInput: CreateSkillInput!) {\n    createOneSkill(createSkillInput: $createSkillInput) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": types.CreateOneSkillDocument,
    "\n  mutation UpdateOneSkill($SkillId: ID!, $updateSkillInput: UpdateSkillInput!) {\n    updateOneSkill(SkillId: $SkillId, updateSkillInput: $updateSkillInput) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": types.UpdateOneSkillDocument,
    "\n  mutation UpdateManySkills(\n    $SkillIds: [ID!]!\n    $updateSkillInput: UpdateSkillInput!\n  ) {\n    updateManySkills(SkillIds: $SkillIds, updateSkillInput: $updateSkillInput) {\n      count\n    }\n  }\n": types.UpdateManySkillsDocument,
    "\n  mutation RemoveOneSkill($SkillId: ID!) {\n    removeOneSkill(SkillId: $SkillId) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": types.RemoveOneSkillDocument,
    "\n  mutation RemoveManySkills($SkillIds: [ID!]!) {\n    removeManySkills(SkillIds: $SkillIds) {\n      count\n    }\n  }\n": types.RemoveManySkillsDocument,
    "\n  query GetMe {\n    getMe {\n      id\n      email\n      name\n      nickname\n      role\n      title\n      avatar\n    }\n  }\n": types.GetMeDocument,
    "\n  query ApiStatus {\n    __typename\n  }\n": types.ApiStatusDocument,
    "\n  query FindManySkills(\n    $SkillFilters: FilterSkillInput\n    $SkillPagination: PaginationInput\n    $SkillSort: SortSkillInput\n  ) {\n    findManySkills(\n      SkillFilters: $SkillFilters\n      SkillPagination: $SkillPagination\n      SkillSort: $SkillSort\n    ) {\n      found\n      nodes {\n        id\n        name\n        slug\n        category\n        relevance\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": types.FindManySkillsDocument,
    "\n  query FindOneSkillById($SkillId: ID!) {\n    findOneSkillById(SkillId: $SkillId) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": types.FindOneSkillByIdDocument,
    "\n  query FindOneSkill($SkillFilters: FilterSkillInput) {\n    findOneSkill(SkillFilters: $SkillFilters) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": types.FindOneSkillDocument,
    "\n  query FindManySkillById($SkillIds: [ID!]!) {\n    findManySkillById(SkillIds: $SkillIds) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": types.FindManySkillByIdDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SignIn($signInInput: SignInInput!) {\n    signIn(signInInput: $signInInput)\n  }\n"): typeof import('./graphql').SignInDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateOneSkill($createSkillInput: CreateSkillInput!) {\n    createOneSkill(createSkillInput: $createSkillInput) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').CreateOneSkillDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateOneSkill($SkillId: ID!, $updateSkillInput: UpdateSkillInput!) {\n    updateOneSkill(SkillId: $SkillId, updateSkillInput: $updateSkillInput) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').UpdateOneSkillDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateManySkills(\n    $SkillIds: [ID!]!\n    $updateSkillInput: UpdateSkillInput!\n  ) {\n    updateManySkills(SkillIds: $SkillIds, updateSkillInput: $updateSkillInput) {\n      count\n    }\n  }\n"): typeof import('./graphql').UpdateManySkillsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveOneSkill($SkillId: ID!) {\n    removeOneSkill(SkillId: $SkillId) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').RemoveOneSkillDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveManySkills($SkillIds: [ID!]!) {\n    removeManySkills(SkillIds: $SkillIds) {\n      count\n    }\n  }\n"): typeof import('./graphql').RemoveManySkillsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMe {\n    getMe {\n      id\n      email\n      name\n      nickname\n      role\n      title\n      avatar\n    }\n  }\n"): typeof import('./graphql').GetMeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ApiStatus {\n    __typename\n  }\n"): typeof import('./graphql').ApiStatusDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindManySkills(\n    $SkillFilters: FilterSkillInput\n    $SkillPagination: PaginationInput\n    $SkillSort: SortSkillInput\n  ) {\n    findManySkills(\n      SkillFilters: $SkillFilters\n      SkillPagination: $SkillPagination\n      SkillSort: $SkillSort\n    ) {\n      found\n      nodes {\n        id\n        name\n        slug\n        category\n        relevance\n        createdAt\n        updatedAt\n      }\n    }\n  }\n"): typeof import('./graphql').FindManySkillsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindOneSkillById($SkillId: ID!) {\n    findOneSkillById(SkillId: $SkillId) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').FindOneSkillByIdDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindOneSkill($SkillFilters: FilterSkillInput) {\n    findOneSkill(SkillFilters: $SkillFilters) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').FindOneSkillDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindManySkillById($SkillIds: [ID!]!) {\n    findManySkillById(SkillIds: $SkillIds) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').FindManySkillByIdDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
