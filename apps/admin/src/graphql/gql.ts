/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation SignIn($signInInput: SignInInput!) {\n    signIn(signInInput: $signInInput)\n  }\n": typeof types.SignInDocument,
    "\n  mutation CreateOneCourse($createCourseInput: CreateCourseInput!) {\n    createOneCourse(createCourseInput: $createCourseInput) {\n      id\n      slug\n    }\n  }\n": typeof types.CreateOneCourseDocument,
    "\n  mutation UpdateOneCourse(\n    $courseId: ID!\n    $updateCourseInput: UpdateCourseInput!\n  ) {\n    updateOneCourse(courseId: $courseId, updateCourseInput: $updateCourseInput) {\n      id\n      slug\n    }\n  }\n": typeof types.UpdateOneCourseDocument,
    "\n  mutation UpdateManyCourses(\n    $courseIds: [ID!]!\n    $updateCourseInput: UpdateCourseInput!\n  ) {\n    updateManyCourses(\n      courseIds: $courseIds\n      updateCourseInput: $updateCourseInput\n    ) {\n      count\n    }\n  }\n": typeof types.UpdateManyCoursesDocument,
    "\n  mutation RemoveOneCourse($courseId: ID!) {\n    removeOneCourse(courseId: $courseId) {\n      id\n      slug\n    }\n  }\n": typeof types.RemoveOneCourseDocument,
    "\n  mutation RemoveManyCourses($courseIds: [ID!]!) {\n    removeManyCourses(courseIds: $courseIds) {\n      count\n    }\n  }\n": typeof types.RemoveManyCoursesDocument,
    "\n  mutation CreateOneEducation($createEducationInput: CreateEducationInput!) {\n    createOneEducation(createEducationInput: $createEducationInput) {\n      id\n      slug\n    }\n  }\n": typeof types.CreateOneEducationDocument,
    "\n  mutation UpdateOneEducation(\n    $educationId: ID!\n    $updateEducationInput: UpdateEducationInput!\n  ) {\n    updateOneEducation(\n      educationId: $educationId\n      updateEducationInput: $updateEducationInput\n    ) {\n      id\n      slug\n    }\n  }\n": typeof types.UpdateOneEducationDocument,
    "\n  mutation UpdateManyEducations(\n    $educationIds: [ID!]!\n    $updateEducationInput: UpdateEducationInput!\n  ) {\n    updateManyEducations(\n      educationIds: $educationIds\n      updateEducationInput: $updateEducationInput\n    ) {\n      count\n    }\n  }\n": typeof types.UpdateManyEducationsDocument,
    "\n  mutation RemoveOneEducation($educationId: ID!) {\n    removeOneEducation(educationId: $educationId) {\n      id\n      slug\n    }\n  }\n": typeof types.RemoveOneEducationDocument,
    "\n  mutation RemoveManyEducations($educationIds: [ID!]!) {\n    removeManyEducations(educationIds: $educationIds) {\n      count\n    }\n  }\n": typeof types.RemoveManyEducationsDocument,
    "\n  mutation CreateOneSkill($createSkillInput: CreateSkillInput!) {\n    createOneSkill(createSkillInput: $createSkillInput) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateOneSkillDocument,
    "\n  mutation UpdateOneSkill($skillId: ID!, $updateSkillInput: UpdateSkillInput!) {\n    updateOneSkill(skillId: $skillId, updateSkillInput: $updateSkillInput) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.UpdateOneSkillDocument,
    "\n  mutation UpdateManySkills(\n    $skillIds: [ID!]!\n    $updateSkillInput: UpdateSkillInput!\n  ) {\n    updateManySkills(skillIds: $skillIds, updateSkillInput: $updateSkillInput) {\n      count\n    }\n  }\n": typeof types.UpdateManySkillsDocument,
    "\n  mutation RemoveOneSkill($skillId: ID!) {\n    removeOneSkill(skillId: $skillId) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.RemoveOneSkillDocument,
    "\n  mutation RemoveManySkills($skillIds: [ID!]!) {\n    removeManySkills(skillIds: $skillIds) {\n      count\n    }\n  }\n": typeof types.RemoveManySkillsDocument,
    "\n  query GetMe {\n    getMe {\n      id\n      email\n      name\n      nickname\n      role\n      title\n      avatar\n    }\n  }\n": typeof types.GetMeDocument,
    "\n  query ApiStatus {\n    __typename\n  }\n": typeof types.ApiStatusDocument,
    "\n  query FindManyCourses(\n    $courseFilters: FilterCourseInput\n    $coursePagination: PaginationInput\n    $courseSort: SortCourseInput\n  ) {\n    findManyCourses(\n      courseFilters: $courseFilters\n      coursePagination: $coursePagination\n      courseSort: $courseSort\n    ) {\n      found\n      nodes {\n        id\n        slug\n        status\n        relevance\n        url\n        image\n        hours\n        organization {\n          id\n          name\n          slug\n        }\n        i18n {\n          locale\n          messages {\n            title\n            description\n          }\n        }\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": typeof types.FindManyCoursesDocument,
    "\n  query FindOneCourseById($courseId: ID!) {\n    findOneCourseById(courseId: $courseId) {\n      id\n      slug\n      status\n      relevance\n      url\n      image\n      hours\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.FindOneCourseByIdDocument,
    "\n  query FindOneCourse($courseFilters: FilterCourseInput) {\n    findOneCourse(courseFilters: $courseFilters) {\n      id\n      slug\n      status\n      relevance\n      url\n      image\n      hours\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.FindOneCourseDocument,
    "\n  query FindManyCourseById($courseIds: [ID!]!) {\n    findManyCourseById(courseIds: $courseIds) {\n      id\n      slug\n      status\n      relevance\n      url\n      image\n      hours\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.FindManyCourseByIdDocument,
    "\n  query FindManyEducations(\n    $educationFilters: FilterEducationInput\n    $educationPagination: PaginationInput\n    $educationSort: SortEducationInput\n  ) {\n    findManyEducations(\n      educationFilters: $educationFilters\n      educationPagination: $educationPagination\n      educationSort: $educationSort\n    ) {\n      found\n      nodes {\n        id\n        slug\n        level\n        status\n        relevance\n        url\n        image\n        organization {\n          id\n          name\n          slug\n        }\n        i18n {\n          locale\n          messages {\n            title\n            description\n          }\n        }\n        period {\n          from\n          to\n        }\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": typeof types.FindManyEducationsDocument,
    "\n  query FindOneEducationById($educationId: ID!) {\n    findOneEducationById(educationId: $educationId) {\n      id\n      slug\n      level\n      status\n      relevance\n      url\n      image\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      period {\n        from\n        to\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.FindOneEducationByIdDocument,
    "\n  query FindOneEducation($educationFilters: FilterEducationInput) {\n    findOneEducation(educationFilters: $educationFilters) {\n      id\n      slug\n      level\n      status\n      relevance\n      url\n      image\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      period {\n        from\n        to\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.FindOneEducationDocument,
    "\n  query FindManyEducationById($educationIds: [ID!]!) {\n    findManyEducationById(educationIds: $educationIds) {\n      id\n      slug\n      level\n      status\n      relevance\n      url\n      image\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      period {\n        from\n        to\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.FindManyEducationByIdDocument,
    "\n  query FindManyOrganizations(\n    $organizationFilters: FilterOrganizationInput\n    $organizationPagination: PaginationInput\n    $organizationSort: SortOrganizationInput\n  ) {\n    findManyOrganizations(\n      organizationFilters: $organizationFilters\n      organizationPagination: $organizationPagination\n      organizationSort: $organizationSort\n    ) {\n      found\n      nodes {\n        id\n        name\n        slug\n      }\n    }\n  }\n": typeof types.FindManyOrganizationsDocument,
    "\n  query FindManySkills(\n    $skillFilters: FilterSkillInput\n    $skillPagination: PaginationInput\n    $skillSort: SortSkillInput\n  ) {\n    findManySkills(\n      skillFilters: $skillFilters\n      skillPagination: $skillPagination\n      skillSort: $skillSort\n    ) {\n      found\n      nodes {\n        id\n        name\n        slug\n        category\n        relevance\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": typeof types.FindManySkillsDocument,
    "\n  query FindOneSkillById($skillId: ID!) {\n    findOneSkillById(skillId: $skillId) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.FindOneSkillByIdDocument,
    "\n  query FindOneSkill($skillFilters: FilterSkillInput) {\n    findOneSkill(skillFilters: $skillFilters) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.FindOneSkillDocument,
    "\n  query FindManySkillById($skillIds: [ID!]!) {\n    findManySkillById(skillIds: $skillIds) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.FindManySkillByIdDocument,
};
const documents: Documents = {
    "\n  mutation SignIn($signInInput: SignInInput!) {\n    signIn(signInInput: $signInInput)\n  }\n": types.SignInDocument,
    "\n  mutation CreateOneCourse($createCourseInput: CreateCourseInput!) {\n    createOneCourse(createCourseInput: $createCourseInput) {\n      id\n      slug\n    }\n  }\n": types.CreateOneCourseDocument,
    "\n  mutation UpdateOneCourse(\n    $courseId: ID!\n    $updateCourseInput: UpdateCourseInput!\n  ) {\n    updateOneCourse(courseId: $courseId, updateCourseInput: $updateCourseInput) {\n      id\n      slug\n    }\n  }\n": types.UpdateOneCourseDocument,
    "\n  mutation UpdateManyCourses(\n    $courseIds: [ID!]!\n    $updateCourseInput: UpdateCourseInput!\n  ) {\n    updateManyCourses(\n      courseIds: $courseIds\n      updateCourseInput: $updateCourseInput\n    ) {\n      count\n    }\n  }\n": types.UpdateManyCoursesDocument,
    "\n  mutation RemoveOneCourse($courseId: ID!) {\n    removeOneCourse(courseId: $courseId) {\n      id\n      slug\n    }\n  }\n": types.RemoveOneCourseDocument,
    "\n  mutation RemoveManyCourses($courseIds: [ID!]!) {\n    removeManyCourses(courseIds: $courseIds) {\n      count\n    }\n  }\n": types.RemoveManyCoursesDocument,
    "\n  mutation CreateOneEducation($createEducationInput: CreateEducationInput!) {\n    createOneEducation(createEducationInput: $createEducationInput) {\n      id\n      slug\n    }\n  }\n": types.CreateOneEducationDocument,
    "\n  mutation UpdateOneEducation(\n    $educationId: ID!\n    $updateEducationInput: UpdateEducationInput!\n  ) {\n    updateOneEducation(\n      educationId: $educationId\n      updateEducationInput: $updateEducationInput\n    ) {\n      id\n      slug\n    }\n  }\n": types.UpdateOneEducationDocument,
    "\n  mutation UpdateManyEducations(\n    $educationIds: [ID!]!\n    $updateEducationInput: UpdateEducationInput!\n  ) {\n    updateManyEducations(\n      educationIds: $educationIds\n      updateEducationInput: $updateEducationInput\n    ) {\n      count\n    }\n  }\n": types.UpdateManyEducationsDocument,
    "\n  mutation RemoveOneEducation($educationId: ID!) {\n    removeOneEducation(educationId: $educationId) {\n      id\n      slug\n    }\n  }\n": types.RemoveOneEducationDocument,
    "\n  mutation RemoveManyEducations($educationIds: [ID!]!) {\n    removeManyEducations(educationIds: $educationIds) {\n      count\n    }\n  }\n": types.RemoveManyEducationsDocument,
    "\n  mutation CreateOneSkill($createSkillInput: CreateSkillInput!) {\n    createOneSkill(createSkillInput: $createSkillInput) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": types.CreateOneSkillDocument,
    "\n  mutation UpdateOneSkill($skillId: ID!, $updateSkillInput: UpdateSkillInput!) {\n    updateOneSkill(skillId: $skillId, updateSkillInput: $updateSkillInput) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": types.UpdateOneSkillDocument,
    "\n  mutation UpdateManySkills(\n    $skillIds: [ID!]!\n    $updateSkillInput: UpdateSkillInput!\n  ) {\n    updateManySkills(skillIds: $skillIds, updateSkillInput: $updateSkillInput) {\n      count\n    }\n  }\n": types.UpdateManySkillsDocument,
    "\n  mutation RemoveOneSkill($skillId: ID!) {\n    removeOneSkill(skillId: $skillId) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": types.RemoveOneSkillDocument,
    "\n  mutation RemoveManySkills($skillIds: [ID!]!) {\n    removeManySkills(skillIds: $skillIds) {\n      count\n    }\n  }\n": types.RemoveManySkillsDocument,
    "\n  query GetMe {\n    getMe {\n      id\n      email\n      name\n      nickname\n      role\n      title\n      avatar\n    }\n  }\n": types.GetMeDocument,
    "\n  query ApiStatus {\n    __typename\n  }\n": types.ApiStatusDocument,
    "\n  query FindManyCourses(\n    $courseFilters: FilterCourseInput\n    $coursePagination: PaginationInput\n    $courseSort: SortCourseInput\n  ) {\n    findManyCourses(\n      courseFilters: $courseFilters\n      coursePagination: $coursePagination\n      courseSort: $courseSort\n    ) {\n      found\n      nodes {\n        id\n        slug\n        status\n        relevance\n        url\n        image\n        hours\n        organization {\n          id\n          name\n          slug\n        }\n        i18n {\n          locale\n          messages {\n            title\n            description\n          }\n        }\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": types.FindManyCoursesDocument,
    "\n  query FindOneCourseById($courseId: ID!) {\n    findOneCourseById(courseId: $courseId) {\n      id\n      slug\n      status\n      relevance\n      url\n      image\n      hours\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": types.FindOneCourseByIdDocument,
    "\n  query FindOneCourse($courseFilters: FilterCourseInput) {\n    findOneCourse(courseFilters: $courseFilters) {\n      id\n      slug\n      status\n      relevance\n      url\n      image\n      hours\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": types.FindOneCourseDocument,
    "\n  query FindManyCourseById($courseIds: [ID!]!) {\n    findManyCourseById(courseIds: $courseIds) {\n      id\n      slug\n      status\n      relevance\n      url\n      image\n      hours\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": types.FindManyCourseByIdDocument,
    "\n  query FindManyEducations(\n    $educationFilters: FilterEducationInput\n    $educationPagination: PaginationInput\n    $educationSort: SortEducationInput\n  ) {\n    findManyEducations(\n      educationFilters: $educationFilters\n      educationPagination: $educationPagination\n      educationSort: $educationSort\n    ) {\n      found\n      nodes {\n        id\n        slug\n        level\n        status\n        relevance\n        url\n        image\n        organization {\n          id\n          name\n          slug\n        }\n        i18n {\n          locale\n          messages {\n            title\n            description\n          }\n        }\n        period {\n          from\n          to\n        }\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": types.FindManyEducationsDocument,
    "\n  query FindOneEducationById($educationId: ID!) {\n    findOneEducationById(educationId: $educationId) {\n      id\n      slug\n      level\n      status\n      relevance\n      url\n      image\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      period {\n        from\n        to\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": types.FindOneEducationByIdDocument,
    "\n  query FindOneEducation($educationFilters: FilterEducationInput) {\n    findOneEducation(educationFilters: $educationFilters) {\n      id\n      slug\n      level\n      status\n      relevance\n      url\n      image\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      period {\n        from\n        to\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": types.FindOneEducationDocument,
    "\n  query FindManyEducationById($educationIds: [ID!]!) {\n    findManyEducationById(educationIds: $educationIds) {\n      id\n      slug\n      level\n      status\n      relevance\n      url\n      image\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      period {\n        from\n        to\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": types.FindManyEducationByIdDocument,
    "\n  query FindManyOrganizations(\n    $organizationFilters: FilterOrganizationInput\n    $organizationPagination: PaginationInput\n    $organizationSort: SortOrganizationInput\n  ) {\n    findManyOrganizations(\n      organizationFilters: $organizationFilters\n      organizationPagination: $organizationPagination\n      organizationSort: $organizationSort\n    ) {\n      found\n      nodes {\n        id\n        name\n        slug\n      }\n    }\n  }\n": types.FindManyOrganizationsDocument,
    "\n  query FindManySkills(\n    $skillFilters: FilterSkillInput\n    $skillPagination: PaginationInput\n    $skillSort: SortSkillInput\n  ) {\n    findManySkills(\n      skillFilters: $skillFilters\n      skillPagination: $skillPagination\n      skillSort: $skillSort\n    ) {\n      found\n      nodes {\n        id\n        name\n        slug\n        category\n        relevance\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": types.FindManySkillsDocument,
    "\n  query FindOneSkillById($skillId: ID!) {\n    findOneSkillById(skillId: $skillId) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": types.FindOneSkillByIdDocument,
    "\n  query FindOneSkill($skillFilters: FilterSkillInput) {\n    findOneSkill(skillFilters: $skillFilters) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": types.FindOneSkillDocument,
    "\n  query FindManySkillById($skillIds: [ID!]!) {\n    findManySkillById(skillIds: $skillIds) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n": types.FindManySkillByIdDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SignIn($signInInput: SignInInput!) {\n    signIn(signInInput: $signInInput)\n  }\n"): typeof import('./graphql').SignInDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateOneCourse($createCourseInput: CreateCourseInput!) {\n    createOneCourse(createCourseInput: $createCourseInput) {\n      id\n      slug\n    }\n  }\n"): typeof import('./graphql').CreateOneCourseDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateOneCourse(\n    $courseId: ID!\n    $updateCourseInput: UpdateCourseInput!\n  ) {\n    updateOneCourse(courseId: $courseId, updateCourseInput: $updateCourseInput) {\n      id\n      slug\n    }\n  }\n"): typeof import('./graphql').UpdateOneCourseDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateManyCourses(\n    $courseIds: [ID!]!\n    $updateCourseInput: UpdateCourseInput!\n  ) {\n    updateManyCourses(\n      courseIds: $courseIds\n      updateCourseInput: $updateCourseInput\n    ) {\n      count\n    }\n  }\n"): typeof import('./graphql').UpdateManyCoursesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveOneCourse($courseId: ID!) {\n    removeOneCourse(courseId: $courseId) {\n      id\n      slug\n    }\n  }\n"): typeof import('./graphql').RemoveOneCourseDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveManyCourses($courseIds: [ID!]!) {\n    removeManyCourses(courseIds: $courseIds) {\n      count\n    }\n  }\n"): typeof import('./graphql').RemoveManyCoursesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateOneEducation($createEducationInput: CreateEducationInput!) {\n    createOneEducation(createEducationInput: $createEducationInput) {\n      id\n      slug\n    }\n  }\n"): typeof import('./graphql').CreateOneEducationDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateOneEducation(\n    $educationId: ID!\n    $updateEducationInput: UpdateEducationInput!\n  ) {\n    updateOneEducation(\n      educationId: $educationId\n      updateEducationInput: $updateEducationInput\n    ) {\n      id\n      slug\n    }\n  }\n"): typeof import('./graphql').UpdateOneEducationDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateManyEducations(\n    $educationIds: [ID!]!\n    $updateEducationInput: UpdateEducationInput!\n  ) {\n    updateManyEducations(\n      educationIds: $educationIds\n      updateEducationInput: $updateEducationInput\n    ) {\n      count\n    }\n  }\n"): typeof import('./graphql').UpdateManyEducationsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveOneEducation($educationId: ID!) {\n    removeOneEducation(educationId: $educationId) {\n      id\n      slug\n    }\n  }\n"): typeof import('./graphql').RemoveOneEducationDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveManyEducations($educationIds: [ID!]!) {\n    removeManyEducations(educationIds: $educationIds) {\n      count\n    }\n  }\n"): typeof import('./graphql').RemoveManyEducationsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateOneSkill($createSkillInput: CreateSkillInput!) {\n    createOneSkill(createSkillInput: $createSkillInput) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').CreateOneSkillDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateOneSkill($skillId: ID!, $updateSkillInput: UpdateSkillInput!) {\n    updateOneSkill(skillId: $skillId, updateSkillInput: $updateSkillInput) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').UpdateOneSkillDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateManySkills(\n    $skillIds: [ID!]!\n    $updateSkillInput: UpdateSkillInput!\n  ) {\n    updateManySkills(skillIds: $skillIds, updateSkillInput: $updateSkillInput) {\n      count\n    }\n  }\n"): typeof import('./graphql').UpdateManySkillsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveOneSkill($skillId: ID!) {\n    removeOneSkill(skillId: $skillId) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').RemoveOneSkillDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveManySkills($skillIds: [ID!]!) {\n    removeManySkills(skillIds: $skillIds) {\n      count\n    }\n  }\n"): typeof import('./graphql').RemoveManySkillsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMe {\n    getMe {\n      id\n      email\n      name\n      nickname\n      role\n      title\n      avatar\n    }\n  }\n"): typeof import('./graphql').GetMeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ApiStatus {\n    __typename\n  }\n"): typeof import('./graphql').ApiStatusDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindManyCourses(\n    $courseFilters: FilterCourseInput\n    $coursePagination: PaginationInput\n    $courseSort: SortCourseInput\n  ) {\n    findManyCourses(\n      courseFilters: $courseFilters\n      coursePagination: $coursePagination\n      courseSort: $courseSort\n    ) {\n      found\n      nodes {\n        id\n        slug\n        status\n        relevance\n        url\n        image\n        hours\n        organization {\n          id\n          name\n          slug\n        }\n        i18n {\n          locale\n          messages {\n            title\n            description\n          }\n        }\n        createdAt\n        updatedAt\n      }\n    }\n  }\n"): typeof import('./graphql').FindManyCoursesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindOneCourseById($courseId: ID!) {\n    findOneCourseById(courseId: $courseId) {\n      id\n      slug\n      status\n      relevance\n      url\n      image\n      hours\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').FindOneCourseByIdDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindOneCourse($courseFilters: FilterCourseInput) {\n    findOneCourse(courseFilters: $courseFilters) {\n      id\n      slug\n      status\n      relevance\n      url\n      image\n      hours\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').FindOneCourseDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindManyCourseById($courseIds: [ID!]!) {\n    findManyCourseById(courseIds: $courseIds) {\n      id\n      slug\n      status\n      relevance\n      url\n      image\n      hours\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').FindManyCourseByIdDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindManyEducations(\n    $educationFilters: FilterEducationInput\n    $educationPagination: PaginationInput\n    $educationSort: SortEducationInput\n  ) {\n    findManyEducations(\n      educationFilters: $educationFilters\n      educationPagination: $educationPagination\n      educationSort: $educationSort\n    ) {\n      found\n      nodes {\n        id\n        slug\n        level\n        status\n        relevance\n        url\n        image\n        organization {\n          id\n          name\n          slug\n        }\n        i18n {\n          locale\n          messages {\n            title\n            description\n          }\n        }\n        period {\n          from\n          to\n        }\n        createdAt\n        updatedAt\n      }\n    }\n  }\n"): typeof import('./graphql').FindManyEducationsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindOneEducationById($educationId: ID!) {\n    findOneEducationById(educationId: $educationId) {\n      id\n      slug\n      level\n      status\n      relevance\n      url\n      image\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      period {\n        from\n        to\n      }\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').FindOneEducationByIdDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindOneEducation($educationFilters: FilterEducationInput) {\n    findOneEducation(educationFilters: $educationFilters) {\n      id\n      slug\n      level\n      status\n      relevance\n      url\n      image\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      period {\n        from\n        to\n      }\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').FindOneEducationDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindManyEducationById($educationIds: [ID!]!) {\n    findManyEducationById(educationIds: $educationIds) {\n      id\n      slug\n      level\n      status\n      relevance\n      url\n      image\n      organization {\n        id\n        name\n        slug\n      }\n      i18n {\n        locale\n        messages {\n          title\n          description\n        }\n      }\n      period {\n        from\n        to\n      }\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').FindManyEducationByIdDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindManyOrganizations(\n    $organizationFilters: FilterOrganizationInput\n    $organizationPagination: PaginationInput\n    $organizationSort: SortOrganizationInput\n  ) {\n    findManyOrganizations(\n      organizationFilters: $organizationFilters\n      organizationPagination: $organizationPagination\n      organizationSort: $organizationSort\n    ) {\n      found\n      nodes {\n        id\n        name\n        slug\n      }\n    }\n  }\n"): typeof import('./graphql').FindManyOrganizationsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindManySkills(\n    $skillFilters: FilterSkillInput\n    $skillPagination: PaginationInput\n    $skillSort: SortSkillInput\n  ) {\n    findManySkills(\n      skillFilters: $skillFilters\n      skillPagination: $skillPagination\n      skillSort: $skillSort\n    ) {\n      found\n      nodes {\n        id\n        name\n        slug\n        category\n        relevance\n        createdAt\n        updatedAt\n      }\n    }\n  }\n"): typeof import('./graphql').FindManySkillsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindOneSkillById($skillId: ID!) {\n    findOneSkillById(skillId: $skillId) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').FindOneSkillByIdDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindOneSkill($skillFilters: FilterSkillInput) {\n    findOneSkill(skillFilters: $skillFilters) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').FindOneSkillDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindManySkillById($skillIds: [ID!]!) {\n    findManySkillById(skillIds: $skillIds) {\n      id\n      name\n      slug\n      category\n      relevance\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').FindManySkillByIdDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
