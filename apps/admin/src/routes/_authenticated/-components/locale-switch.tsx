import { LOCALES } from "@/consts/locales";
import { useLocaleStore } from "@/stores/locale";

export function LocaleSwitch() {
  const { locale, setLocale } = useLocaleStore();

  return (
    <div className="join my-2 is-drawer-close:hidden w-full rounded">
      {LOCALES.map((option) => (
        <label
          className="btn btn-xs join-item flex-1 border-base-content/40 text-base-content/80 has-checked:bg-neutral has-checked:text-neutral-content"
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
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
