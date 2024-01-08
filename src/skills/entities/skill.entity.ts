export enum SkillLevelEnum {
  'LOW' = 'LOW',
  'MEDIUM' = 'MEDIUM',
  'HIGH' = 'HIGH',
}

export enum SkillCategoryEnum {
  'LANGUAGE' = 'LANGUAGE',
  'LIBRARY' = 'LIBRARY',
  'TOOL' = 'TOOL',
  'SYSTEM' = 'SYSTEM',
  'OTHER' = 'OTHER',
}

export class Skill {
  id: string
  name: string
  level: SkillLevelEnum | string
  category: SkillCategoryEnum | string
}
