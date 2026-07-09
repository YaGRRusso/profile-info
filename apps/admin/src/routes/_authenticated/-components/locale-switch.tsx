import { TranslateIcon } from "@phosphor-icons/react";
import { LOCALES } from "@/consts/locales";
import { useDisplayLocaleStore } from "@/stores/display-locale";

export function LocaleSwitch() {
  const { locale, setLocale } = useDisplayLocaleStore();

  return (
    <div className="join my-2 is-drawer-close:hidden w-full rounded px-2">
      {LOCALES.map((option) => (
        <label
          className="btn btn-sm join-item has-checked:btn-neutral flex-1"
          key={option.value}
        >
          <input
            aria-label={option.label}
            checked={locale === option.value}
            className="hidden"
            name="locale-buttons"
            onChange={() => setLocale(option.value)}
            type="radio"
            value={option.value}
          />
          <TranslateIcon />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
