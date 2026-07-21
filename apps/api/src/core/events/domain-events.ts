export const DomainEvents = {
  organization: {
    deleted: "organization.deleted",
  },
  skill: {
    deleted: "skill.deleted",
  },
  user: {
    accountEnabled: "user.account-enabled",
    deleted: "user.deleted",
    registered: "user.registered",
  },
} as const;
