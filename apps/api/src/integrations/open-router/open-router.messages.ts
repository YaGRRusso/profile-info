import type { ErrorMessage } from "@/core/errors/error-message";

export const OPENROUTER_UNAUTHORIZED: ErrorMessage = {
  en: "AI provider rejected the API credentials",
  es: "El proveedor de IA rechazó las credenciales de la API",
  pt: "O provedor de IA rejeitou as credenciais da API",
};

export const OPENROUTER_PROVIDER_FAILURE: ErrorMessage = {
  en: "AI provider failed to complete the request",
  es: "El proveedor de IA no pudo completar la solicitud",
  pt: "O provedor de IA falhou ao concluir a solicitação",
};
