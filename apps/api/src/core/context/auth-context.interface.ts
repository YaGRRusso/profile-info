import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { CredentialKind } from "@/core/enums/credential-kind.enum";
import { UserRole } from "@/core/enums/user-role.enum";

export interface AuthContextUser {
  id: string;
  role?: UserRole;
}

export interface SessionAuthContext extends AuthContextUser {
  credentialKind: CredentialKind.SESSION;
}

export interface ApiTokenAuthContext extends AuthContextUser {
  credentialKind: CredentialKind.API_TOKEN;
  permissions: ApiTokenPermission[];
}

export type AuthContext = SessionAuthContext | ApiTokenAuthContext;
