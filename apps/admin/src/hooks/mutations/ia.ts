import { useMutation } from "@tanstack/react-query";
import { graphql } from "@/graphql";
import { AtsSummarizeInput } from "@/graphql/graphql";
import { execute } from "@/lib/execute";

const atsSummarize = graphql(`
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
`);

export function useAtsSummarize() {
  return useMutation({
    mutationKey: ["atsSummarize"],
    mutationFn: (atsSummarizeInput: AtsSummarizeInput) =>
      execute(atsSummarize, { atsSummarizeInput }),
  });
}
