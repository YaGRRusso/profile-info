import { INTL_LOCALES, Locale, type LocaleCode } from "@/common/i18n/locales";

interface DateRangeLike {
  from?: Date;
  to?: Date;
}

const PRESENT_LABELS: Record<LocaleCode, string> = {
  [Locale.EN]: "Present",
  [Locale.PT]: "Atual",
  [Locale.ES]: "Actual",
};

export function formatPeriod(
  period: DateRangeLike | undefined,
  locale: LocaleCode
): string | undefined {
  if (!period?.from) return;

  const formatter = new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    month: "short",
    year: "numeric",
  });

  const from = formatter.format(new Date(period.from));
  const to = period.to
    ? formatter.format(new Date(period.to))
    : (PRESENT_LABELS[locale] ?? PRESENT_LABELS[Locale.EN]);

  return `${from} – ${to}`;
}
