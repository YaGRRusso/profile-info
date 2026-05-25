import { useMutation } from "@tanstack/react-query";
import { graphql } from "@/graphql";
import type { SignInInput } from "@/graphql/graphql";
import { execute } from "@/lib/execute";

const signIn = graphql(`
  mutation SignIn($signInInput: SignInInput!) {
    signIn(signInInput: $signInInput)
  }
`);

export function useSignIn() {
  return useMutation({
    mutationKey: ["signIn"],
    mutationFn: (signInInput: SignInInput) => execute(signIn, { signInInput }),
  });
}
