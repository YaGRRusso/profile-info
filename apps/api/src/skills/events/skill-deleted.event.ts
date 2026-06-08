export class SkillDeletedEvent {
  readonly deletedAt: Date;

  constructor(
    readonly skillId: string,
    readonly skillName: string,
    readonly deletedByUserId: string,
    readonly deletedByUserName: string
  ) {
    this.deletedAt = new Date();
  }

  getLogMessage(): string {
    return `[${this.skillId}:${this.skillName}] was deleted by [${this.deletedByUserId}:${this.deletedByUserName}] at ${this.deletedAt.toISOString()}`;
  }
}
