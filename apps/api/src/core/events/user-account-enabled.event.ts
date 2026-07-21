export class UserAccountEnabledEvent {
  constructor(
    readonly userId: string,
    readonly email: string,
    readonly name: string
  ) {}
}
