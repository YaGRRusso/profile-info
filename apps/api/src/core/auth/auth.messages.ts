import type { ErrorMessage } from "@/core/errors/error-message";

export const AUTH_UNAUTHORIZED: ErrorMessage = {
  en: "Unauthorized",
  es: "No autorizado",
  pt: "Não autorizado",
};

export const AUTH_INVALID_CREDENTIALS: ErrorMessage = {
  en: "Invalid email or password",
  es: "Correo o contraseña inválidos",
  pt: "E-mail ou senha inválidos",
};

export const AUTH_INSUFFICIENT_PERMISSIONS: ErrorMessage = {
  en: "Insufficient permissions",
  es: "Permisos insuficientes",
  pt: "Permissões insuficientes",
};

export const AUTH_SESSION_REQUIRED: ErrorMessage = {
  en: "Session required",
  es: "Sesión requerida",
  pt: "Sessão obrigatória",
};

export const AUTH_INSUFFICIENT_API_TOKEN_PERMISSIONS: ErrorMessage = {
  en: "Insufficient API token permissions",
  es: "Permisos de token de API insuficientes",
  pt: "Permissões do token de API insuficientes",
};
