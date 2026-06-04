import { useMutation } from "@tanstack/react-query";
import { graphql } from "@/graphql";
import { AtsSummarizeInput, TranslateInput } from "@/graphql/graphql";
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

const translate = graphql(`
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
`);

export function useTranslate() {
  return useMutation({
    mutationKey: ["translate"],
    mutationFn: (translateInput: TranslateInput) =>
      execute(translate, { translateInput }),
  });
}
