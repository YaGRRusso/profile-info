import { useMutation } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import {
  AtsSummarizeInput,
  SummarizeInput,
  TranslateInput,
} from "@/generated/graphql/graphql";
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

const summarize = graphql(`
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
`);

export function useSummarize() {
  return useMutation({
    mutationKey: ["summarize"],
    mutationFn: (summarizeInput: SummarizeInput) =>
      execute(summarize, { summarizeInput }),
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
