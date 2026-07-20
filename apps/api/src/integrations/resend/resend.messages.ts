import type { ErrorMessage } from "@/core/errors/error-message";

export const EMAIL_NOT_CONFIGURED: ErrorMessage = {
  en: "Email delivery is not configured",
  es: "El envío de correo no está configurado",
  pt: "O envio de e-mail não está configurado",
};

export const EMAIL_FROM_REQUIRED: ErrorMessage = {
  en: "A sender address (from) is required",
  es: "Se requiere una dirección de remitente (from)",
  pt: "É necessário um endereço de remetente (from)",
};

export const EMAIL_UNAUTHORIZED: ErrorMessage = {
  en: "Email provider rejected the API credentials",
  es: "El proveedor de correo rechazó las credenciales de la API",
  pt: "O provedor de e-mail rejeitou as credenciais da API",
};

export const EMAIL_INVALID_REQUEST: ErrorMessage = {
  en: "Email provider rejected the request",
  es: "El proveedor de correo rechazó la solicitud",
  pt: "O provedor de e-mail rejeitou a solicitação",
};

export const EMAIL_PROVIDER_FAILURE: ErrorMessage = {
  en: "Email provider failed to send the message",
  es: "El proveedor de correo no pudo enviar el mensaje",
  pt: "O provedor de e-mail falhou ao enviar a mensagem",
};
