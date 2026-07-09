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

  return users.create({
    name: persona.name,
    nickname: persona.nickname,
    email: persona.email,
    password: await hash(DEV_PASSWORD, 8),
    role: persona.role,
    avatar: optionalForIndex(profileIndex, () => faker.image.urlPicsumPhotos()),
    birth: optionalForIndex(profileIndex + 1, () =>
      faker.date.past({ years: 30 })
    ),
    phone: optionalForIndex(profileIndex + 2, () => faker.phone.number()),
    address: optionalForIndex(profileIndex + 3, () =>
      faker.location.streetAddress()
    ),
    i18n: optionalForIndex(profileIndex + 4, () =>
      SEED_LOCALES.map((locale) => ({
        locale,
        messages: {
          title: loremSentences(pickTextSize(profileIndex)),
          description: loremSentences(pickTextSize(profileIndex + 1)),
        },
      }))
    ),
    urls: arrayBySize(pickArraySize(profileIndex), () => ({
      title: faker.helpers.arrayElement(URL_TYPES),
      value: faker.internet.url(),
    })),
    skillIds: profileSkillIds.length > 0 ? profileSkillIds : undefined,
  });
}
