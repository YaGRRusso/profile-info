import { ApiTokenPermission } from "@/core/enums/api-token-permission.enum";
import { CredentialKind } from "@/core/enums/credential-kind.enum";
import { UserRole } from "@/core/enums/user-role.enum";

export interface AuthContextUser {
  id: string;
  role?: UserRole;
}

interface AuthContextBase {
  role: UserRole;
  userId: string;
}

export interface SessionAuthContext extends AuthContextBase {
  credentialKind: CredentialKind.SESSION;
}

export interface ApiTokenAuthContext extends AuthContextBase {
  credentialKind: CredentialKind.API_TOKEN;
  permissions: ApiTokenPermission[];
}

export type AuthContext = SessionAuthContext | ApiTokenAuthContext;
