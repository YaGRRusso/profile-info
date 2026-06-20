import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { CredentialKind } from "@/core/enums/credential-kind.enum";
import { UserRole } from "@/core/enums/user-role.enum";

interface RequestContextBase {
  role: UserRole;
  userId: string;
}

export interface SessionRequestContext extends RequestContextBase {
  credentialKind: CredentialKind.SESSION;
}

export interface ApiTokenRequestContext extends RequestContextBase {
  credentialKind: CredentialKind.API_TOKEN;
  permissions: ApiTokenPermission[];
}

export type RequestContext = SessionRequestContext | ApiTokenRequestContext;
