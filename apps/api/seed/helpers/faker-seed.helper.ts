/** biome-ignore-all lint/style/noNestedTernary: test file */
import { faker } from "@faker-js/faker";
import { SEED_LOCALES } from "../constants";
import { pickTextSize, type TextSize } from "./variation.helper";

export function loremSentences(size: TextSize): string {
  const range =
    size === "small"
      ? { min: 1, max: 1 }
      : size === "medium"
        ? { min: 2, max: 4 }
        : { min: 10, max: 20 };
  return faker.lorem.sentences({ min: range.min, max: range.max });
}

export function loremWords(size: TextSize): string {
  const range =
    size === "small"
      ? { min: 2, max: 4 }
      : size === "medium"
        ? { min: 5, max: 10 }
        : { min: 12, max: 24 };
  return faker.lorem.words({ min: range.min, max: range.max });
}

export const slugFor = (label: string, index: number) =>
  `${faker.helpers.slugify(label).toLowerCase().slice(0, 48)}-${index}`;

export function bilingualMessages(
  index: number,
  build: (size: ReturnType<typeof pickTextSize>) => {
    title: string;
    description: string;
  }
) {
  const size = pickTextSize(index);

  return SEED_LOCALES.map((locale) => ({
    locale,
    messages: build(size),
  }));
}

export function bilingualTitleDescription(index: number) {
  return bilingualMessages(index, (size) => ({
    title: loremWords(size),
    description: loremSentences(size),
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
