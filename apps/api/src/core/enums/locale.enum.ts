import { registerEnumType } from "@nestjs/graphql";

export enum Locale {
  en = "en",
  es = "es",
  pt = "pt",
}

registerEnumType(Locale, {
  name: "Locale",
});
