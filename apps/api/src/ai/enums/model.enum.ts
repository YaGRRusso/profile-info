import { registerEnumType } from "@nestjs/graphql";

export enum FreeAiModels {
  openrouter = "openrouter/owl-alpha",
  nvidia = "nvidia/nemotron-3-super-120b-a12b:free",
  poolside = "poolside/laguna-m.1:free",
  openai = "openai/gpt-oss-120b:free",
  google = "google/gemma-4-31b-it:free",
}

registerEnumType(FreeAiModels, {
  name: "FreeAiModels",
});
