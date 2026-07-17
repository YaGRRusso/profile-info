export interface ErrorMessage {
  en: string;
  es: string;
  pt: string;
}

export function isErrorMessage(value: unknown): value is ErrorMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "en" in value &&
    typeof value.en === "string" &&
    "es" in value &&
    typeof value.es === "string" &&
    "pt" in value &&
    typeof value.pt === "string"
  );
}

export function localizeError(
  message: ErrorMessage,
  acceptLanguage?: string
): string {
  const locale = acceptLanguage?.split(",")[0]?.split("-")[0];

  if (locale === "pt") return message.pt;
  if (locale === "es") return message.es;

  return message.en;
}
