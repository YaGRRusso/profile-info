import { INestApplication } from "@nestjs/common";
import { DEV_PASSWORD } from "@seed/constants";
import { PERSONAS, type PersonaKey } from "@seed/personas";
import { graphqlRequest } from "../support/graphql-request";

const SIGN_IN = `
  mutation SignIn($signInInput: SignInInput!) {
    signIn(signInInput: $signInInput)
  }
`;

export async function signInPersona(
  app: INestApplication,
  key: PersonaKey
): Promise<string> {
  const persona = PERSONAS[key];
  const response = await graphqlRequest<{ signIn: string }>(app, {
    query: SIGN_IN,
    variables: {
      signInInput: { email: persona.email, password: DEV_PASSWORD },
    },
  });

  return response.data?.signIn ?? "";
}

export async function signInEmail(
  app: INestApplication,
  email: string,
  password: string = DEV_PASSWORD
): Promise<string> {
  const response = await graphqlRequest<{ signIn: string }>(app, {
    query: SIGN_IN,
    variables: { signInInput: { email, password } },
  });

  return response.data?.signIn ?? "";
}
