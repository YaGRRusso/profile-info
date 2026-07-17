import { useMutation } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  RegisterUserInput,
  SignInInput,
} from "@/generated/graphql/graphql";
import { request } from "@/service/graphql";

const signIn = graphql(`
  mutation SignIn($signInInput: SignInInput!) {
    signIn(signInInput: $signInInput)
  }
`);

const signUp = graphql(`
  mutation Register($registerInput: RegisterUserInput!) {
    register(registerInput: $registerInput) {
      id
      email
      disabled
    }
  }
`);

export function useSignIn() {
  return useMutation({
    mutationFn: (signInInput: SignInInput) => request(signIn, { signInInput }),
    mutationKey: ["signIn"],
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: (registerInput: RegisterUserInput) =>
      request(signUp, { registerInput }),
    mutationKey: ["signUp"],
  });
}
