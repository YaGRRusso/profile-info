import { useMutation } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import type {
  RegisterUserInput,
  SignInInput,
} from "@/generated/graphql/graphql";
import { execute } from "@/lib/execute";

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
    mutationKey: ["signIn"],
    mutationFn: (signInInput: SignInInput) => execute(signIn, { signInInput }),
  });
}

export function useSignUp() {
  return useMutation({
    mutationKey: ["signUp"],
    mutationFn: (registerInput: RegisterUserInput) =>
      execute(signUp, { registerInput }),
  });
}
