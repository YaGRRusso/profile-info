export class SkillCreatedEvent {
  constructor(
    readonly skillId: string,
    readonly slug: string
  ) {}
}
