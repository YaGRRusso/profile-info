import type { Locale } from "@/core/enums/locale.enum";

export class UserAccountDisabledEvent {
  constructor(
    readonly userId: string,
    readonly email: string,
    readonly name: string,
    readonly locale?: Locale
  ) {}
}
