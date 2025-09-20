import { InputType } from "@nestjs/graphql";
import { OptionalField } from "@/core/decorators/optional-field.decorator";

@InputType()
export class ReadUserUrlInput {
  @OptionalField(() => String)
  code?: string;

  @OptionalField(() => String)
  value?: string;
}

@InputType()
export class ReadUserInput {
  @OptionalField(() => String)
  avatar?: string;

  @OptionalField(() => String)
  name?: string;

  @OptionalField(() => String)
  nickname?: string;

  @OptionalField(() => String)
  title?: string;

  @OptionalField(() => String)
  description?: string;

  @OptionalField(() => String)
  phone?: string;

  @OptionalField(() => String)
  email?: string;

  @OptionalField(() => String)
  password?: string;

  @OptionalField(() => String)
  birthDate?: Date;

  @OptionalField(() => String)
  address?: string;

  @OptionalField(() => String)
  postalCode?: string;

  @OptionalField(() => String)
  school?: string;

  @OptionalField(() => String)
  work?: string;

  @OptionalField(() => String, { defaultValue: "USER" })
  role?: string;

  @OptionalField(() => [String])
  hobbies?: string[];

  @OptionalField(() => [ReadUserUrlInput])
  urls?: ReadUserUrlInput[];
}
