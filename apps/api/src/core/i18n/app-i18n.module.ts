import { existsSync } from "node:fs";
import { join } from "node:path";
import { Module } from "@nestjs/common";
import {
  AcceptLanguageResolver,
  I18nModule,
  type I18nOptionsWithoutResolvers,
} from "nestjs-i18n";
import { DEFAULT_LOCALE } from "@/common/i18n/locales";

function resolveI18nCatalogPath(): string {
  const srcPath = join(process.cwd(), "src/i18n");
  if (existsSync(srcPath)) return srcPath;
  return join(process.cwd(), "dist/i18n");
}

const i18nOptions: I18nOptionsWithoutResolvers = {
  fallbackLanguage: DEFAULT_LOCALE,
  loaderOptions: {
    path: resolveI18nCatalogPath(),
    watch: process.env.NODE_ENV !== "production",
  },
};

@Module({
  imports: [
    I18nModule.forRoot({
      ...i18nOptions,
      resolvers: [AcceptLanguageResolver],
    }),
  ],
})
export class AppI18nModule {}
