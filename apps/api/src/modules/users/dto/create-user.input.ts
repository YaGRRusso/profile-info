import { InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsUrl,
  MinLength,
  ValidateNested,
} from "class-validator";
import { OptionalField } from "@/core/decorators/optional-field.decorator";
import { RequiredField } from "@/core/decorators/required-field.decorator";
import { Locale } from "@/core/enums/locale.enum";
import { UserRole } from "@/core/enums/user-role.enum";
import {
  createTranslationInput,
  TranslationInput,
} from "@/core/inputs/translation.input";
import { UrlInput } from "@/core/inputs/url.input";

@InputType()
export class CreateUserMessagesInput {
  @OptionalField(() => String)
  title?: string;

  @OptionalField(() => String)
  description?: string;
}

const UserTranslationInput = createTranslationInput(CreateUserMessagesInput);

@InputType()
export class CreateUserInput {
  @OptionalField(() => String)
  @IsUrl()
  avatar?: string;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @RequiredField(() => String)
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @OptionalField(() => String)
  phone?: string;

  @RequiredField(() => String)
  @IsEmail()
  email: string;

  @RequiredField(() => String)
  @IsString()
  @MinLength(8)
  password: string;

  @OptionalField(() => String)
  @IsDateString()
  birth?: Date;

  @OptionalField(() => String)
  address?: string;

  @OptionalField(() => Locale)
  @IsEnum(Locale)
  locale?: Locale;

  @OptionalField(() => [Locale])
  @IsArray()
  @IsEnum(Locale, { each: true })
  locales?: Locale[];

  @OptionalField(() => [UserTranslationInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserTranslationInput)
  i18n?: TranslationInput<CreateUserMessagesInput>[];

  @OptionalField(() => UserRole)
  role?: UserRole;

  @OptionalField(() => [UrlInput])
  urls?: UrlInput[];

  @OptionalField(() => [String])
  @IsMongoId({ each: true })
  skillIds?: string[];
}
