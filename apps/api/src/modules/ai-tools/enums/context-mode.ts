import { registerEnumType } from "@nestjs/graphql";

export enum ContextMode {
  PAGE_EXTRACT = "page_extract",
  WEB_SEARCH = "web_search",
}

registerEnumType(ContextMode, {
  name: "ContextMode",
});
