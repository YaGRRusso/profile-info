/** biome-ignore-all lint/style/noNestedTernary: test file */
import { faker as fakerEn } from "@faker-js/faker";
import { faker as fakerPt } from "@faker-js/faker/locale/pt_BR";
import { Locale, type LocaleCode } from "@/common/i18n/locales";
import { FAKER_SEED, SEED_LOCALES } from "../constants";
import { pickTextSize, type TextSize } from "./variation.helper";

/** Default faker for slugs, dates, and other locale-agnostic seed fields. */
export const faker = fakerEn;

const FAKER_BY_LOCALE: Record<(typeof SEED_LOCALES)[number], typeof fakerEn> = {
  [Locale.EN]: fakerEn,
  [Locale.PT]: fakerPt,
};

export function initSeedFakers() {
  fakerEn.seed(FAKER_SEED);
  fakerPt.seed(FAKER_SEED + 1_000_000);
}

export function fakerForLocale(locale: LocaleCode) {
  return FAKER_BY_LOCALE[locale as (typeof SEED_LOCALES)[number]] ?? fakerEn;
}

function textRange(size: TextSize) {
  return size === "small"
    ? { min: 1, max: 1 }
    : size === "medium"
      ? { min: 2, max: 4 }
      : { min: 10, max: 20 };
}

function wordRange(size: TextSize) {
  return size === "small"
    ? { min: 2, max: 4 }
    : size === "medium"
      ? { min: 5, max: 10 }
      : { min: 12, max: 24 };
}

export function loremSentences(size: TextSize, locale: LocaleCode) {
  const range = textRange(size);
  return fakerForLocale(locale).lorem.sentences({
    min: range.min,
    max: range.max,
  });
}

export function loremWords(size: TextSize, locale: LocaleCode) {
  const range = wordRange(size);
  return fakerForLocale(locale).lorem.words({
    min: range.min,
    max: range.max,
  });
}

export const slugFor = (label: string, index: number) =>
  `${faker.helpers.slugify(label).toLowerCase().slice(0, 48)}-${index}`;

export function bilingualMessages(
  index: number,
  build: (
    size: ReturnType<typeof pickTextSize>,
    locale: (typeof SEED_LOCALES)[number]
  ) => {
    title: string;
    description: string;
  }
) {
  const size = pickTextSize(index);

  return SEED_LOCALES.map((locale) => ({
    locale,
    messages: build(size, locale),
  }));
}

export function bilingualTitleDescription(index: number) {
  return bilingualMessages(index, (size, locale) => ({
    title: loremWords(size, locale),
    description: loremSentences(size, locale),
  }));
}

export const relevance = () => faker.number.int({ min: 1, max: 5 });

export const period = () => {
  const from = faker.date.past({ years: 8 });
  return { from, to: faker.date.between({ from, to: new Date() }) };
};

export function buildMany<T>(count: number, build: (index: number) => T) {
  return Array.from({ length: count }, (_, index) => build(index));
}
