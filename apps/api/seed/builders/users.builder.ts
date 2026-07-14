import { faker } from "@faker-js/faker";
import { hash } from "bcryptjs";
import type { Model } from "mongoose";
import type { UserModel } from "@/modules/users/schemas/user.schema";
import { DEV_PASSWORD, SEED_LOCALES, URL_TYPES } from "../constants";
import { loremSentences } from "../helpers/faker-seed.helper";
import {
  arrayBySize,
  optionalForIndex,
  pickArraySize,
  pickTextSize,
} from "../helpers/variation.helper";
import type { PersonaDefinition } from "../personas";

export async function createPersonaUser(
  users: Model<UserModel>,
  persona: PersonaDefinition,
  profileSkillIds: string[]
) {
  const profileIndex = persona.key.length;

  // Consume faker synchronously before any await so parallel callers stay deterministic.
  const document = {
    address: optionalForIndex(profileIndex + 3, () =>
      faker.location.streetAddress()
    ),
    avatar: optionalForIndex(profileIndex, () => faker.image.urlPicsumPhotos()),
    birth: optionalForIndex(profileIndex + 1, () =>
      faker.date.past({ years: 30 })
    ),
    disabled: persona.disabled ?? false,
    email: persona.email,
    i18n: optionalForIndex(profileIndex + 4, () =>
      SEED_LOCALES.map((locale) => ({
        locale,
        messages: {
          description: loremSentences(pickTextSize(profileIndex + 1), locale),
          title: loremSentences(pickTextSize(profileIndex), locale),
        },
      }))
    ),
    name: persona.name,
    nickname: persona.nickname,
    phone: optionalForIndex(profileIndex + 2, () => faker.phone.number()),
    role: persona.role,
    skillIds: profileSkillIds.length > 0 ? profileSkillIds : undefined,
    urls: arrayBySize(pickArraySize(profileIndex), () => ({
      title: faker.helpers.arrayElement(URL_TYPES),
      value: faker.internet.url(),
    })),
  };

  return users.create({
    ...document,
    password: await hash(DEV_PASSWORD, 8),
  });
}
