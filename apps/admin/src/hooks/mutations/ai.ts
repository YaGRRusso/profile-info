import { useMutation } from "@tanstack/react-query";
import { graphql } from "@/generated/graphql";
import {
  AtsSummarizeInput,
  SummarizeInput,
  TranslateInput,
} from "@/generated/graphql/graphql";
import { request } from "@/service/graphql";

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
    meta: { ignoreSlowRequest: true },
    mutationFn: (atsSummarizeInput: AtsSummarizeInput) =>
      request(atsSummarize, { atsSummarizeInput }),
    mutationKey: ["atsSummarize"],
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
    meta: { ignoreSlowRequest: true },
    mutationFn: (summarizeInput: SummarizeInput) =>
      request(summarize, { summarizeInput }),
    mutationKey: ["summarize"],
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
    meta: { ignoreSlowRequest: true },
    mutationFn: (translateInput: TranslateInput) =>
      request(translate, { translateInput }),
    mutationKey: ["translate"],
  });
}
