import {
  BrowserIcon,
  FilePdfIcon,
  SparkleIcon,
  StackIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

function AuthBrandUnderground() {
  return (
    <>
      <div
        aria-hidden
        className="absolute -top-24 -right-20 -z-10 size-80 rounded-full border border-white/20"
      />
      <div
        aria-hidden
        className="absolute top-12 right-12 -z-10 size-32 rounded-full bg-white/10 blur-sm"
      />
      <div
        aria-hidden
        className="absolute -bottom-28 -left-20 -z-10 size-80 rounded-full bg-black/10"
      />
    </>
  );
}

export interface AuthBrandPanelProps {
  className?: string;
}

export function AuthBrandPanel({ className }: AuthBrandPanelProps) {
  const { t: tAuth } = useTranslation("auth");

  const features = [
    {
      description: tAuth("marketing.features.profile.description"),
      Icon: StackIcon,
      title: tAuth("marketing.features.profile.title"),
    },
    {
      description: tAuth("marketing.features.ai.description"),
      Icon: SparkleIcon,
      title: tAuth("marketing.features.ai.title"),
    },
    {
      description: tAuth("marketing.features.portfolio.description"),
      Icon: BrowserIcon,
      title: tAuth("marketing.features.portfolio.title"),
    },
    {
      description: tAuth("marketing.features.resume.description"),
      Icon: FilePdfIcon,
      title: tAuth("marketing.features.resume.title"),
    },
  ];

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-base-content bg-linear-to-br from-primary via-primary to-secondary p-5 text-primary-content sm:p-6 lg:p-10",
        className
      )}
    >
      <AuthBrandUnderground />
      <div className="flex h-full flex-col items-center justify-evenly gap-4 sm:gap-8">
        <div className="flex flex-col gap-2 sm:gap-4">
          <h2 className="text-balance font-bold text-3xl leading-tight tracking-tight sm:text-4xl">
            {tAuth("marketing.title")}
          </h2>
          <p className="text-pretty text-sm opacity-lg sm:text-base">
            {tAuth("marketing.description")}
          </p>
        </div>

        <div className="grid w-full gap-2 sm:grid-cols-2">
          {features.map(({ description, Icon, title }) => (
            <article
              className="flex items-center gap-2 rounded border border-black/10 bg-black/10 p-3 backdrop-blur-sm sm:block"
              key={title}
            >
              <Icon className="shrink-0 sm:mb-2" size={22} weight="duotone" />
              <div>
                <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
                <p className="mt-1 hidden text-sm opacity-lg sm:block">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
