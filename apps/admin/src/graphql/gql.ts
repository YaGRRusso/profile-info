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
    "\n  query GetMe {\n    getMe {\n      id\n      email\n      name\n      nickname\n      role\n      title\n      avatar\n    }\n  }\n": typeof types.GetMeDocument,
    "\n  query ApiStatus {\n    __typename\n  }\n": typeof types.ApiStatusDocument,
};
const documents: Documents = {
    "\n  mutation SignIn($signInInput: SignInInput!) {\n    signIn(signInInput: $signInInput)\n  }\n": types.SignInDocument,
    "\n  query GetMe {\n    getMe {\n      id\n      email\n      name\n      nickname\n      role\n      title\n      avatar\n    }\n  }\n": types.GetMeDocument,
    "\n  query ApiStatus {\n    __typename\n  }\n": types.ApiStatusDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SignIn($signInInput: SignInInput!) {\n    signIn(signInInput: $signInInput)\n  }\n"): typeof import('./graphql').SignInDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMe {\n    getMe {\n      id\n      email\n      name\n      nickname\n      role\n      title\n      avatar\n    }\n  }\n"): typeof import('./graphql').GetMeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ApiStatus {\n    __typename\n  }\n"): typeof import('./graphql').ApiStatusDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
