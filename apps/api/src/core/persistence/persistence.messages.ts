import type { ErrorMessage } from "@/core/errors/error-message";

export const PERSISTENCE_NOT_FOUND: ErrorMessage = {
  en: "Not found",
  es: "No encontrado",
  pt: "Não encontrado",
};

export const PERSISTENCE_NOT_CREATED: ErrorMessage = {
  en: "Not created",
  es: "No creado",
  pt: "Não criado",
};

export const PERSISTENCE_NOT_UPDATED: ErrorMessage = {
  en: "Not updated",
  es: "No actualizado",
  pt: "Não atualizado",
};

export const PERSISTENCE_NOT_REMOVED: ErrorMessage = {
  en: "Not removed",
  es: "No eliminado",
  pt: "Não removido",
};

export const PERSISTENCE_DUPLICATE: ErrorMessage = {
  en: "A record with this value already exists",
  es: "Ya existe un registro con este valor",
  pt: "Já existe um registro com este valor",
};

export const PERSISTENCE_INVALID: ErrorMessage = {
  en: "Invalid value",
  es: "Valor inválido",
  pt: "Valor inválido",
};

export const PERSISTENCE_VALIDATION: ErrorMessage = {
  en: "Validation failed",
  es: "Validación fallida",
  pt: "Validação falhou",
};

export const PERSISTENCE_UNAVAILABLE: ErrorMessage = {
  en: "Database temporarily unavailable",
  es: "Base de datos temporalmente no disponible",
  pt: "Banco de dados temporariamente indisponível",
};
