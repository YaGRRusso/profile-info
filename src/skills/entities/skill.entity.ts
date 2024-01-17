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
  category: SkillCategoryEnum | string
}
