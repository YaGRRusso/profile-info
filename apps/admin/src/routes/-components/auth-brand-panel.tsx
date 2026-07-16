import {
  BrowserIcon,
  CaretDownIcon,
  CaretUpIcon,
  FilePdfIcon,
  SparkleIcon,
  StackIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
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

  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

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
      description: tAuth("marketing.features.resume.description"),
      Icon: FilePdfIcon,
      title: tAuth("marketing.features.resume.title"),
    },
    {
      description: tAuth("marketing.features.api.description"),
      Icon: BrowserIcon,
      title: tAuth("marketing.features.api.title"),
    },
  ];

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-linear-to-br from-primary/80 via-primary/80 to-secondary/80 p-6 text-primary-content sm:p-8 lg:p-10",
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

        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          {features.map(({ description, Icon, title }) => (
            <article
              className="flex flex-col items-center gap-2 rounded border border-base-content/20 bg-base-200/10 p-4 backdrop-blur-sm"
              key={title}
            >
              <div className="flex w-full gap-2 sm:flex-col">
                <Icon className="shrink-0" size={22} weight="duotone" />
                <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
              </div>
              <p
                className={cn(
                  "text-sm opacity-lg",
                  isDetailsVisible && "max-sm:hidden"
                )}
              >
                {description}
              </p>
            </article>
          ))}
          <button
            className="btn btn-ghost btn-sm col-span-full border-none shadow-none hover:bg-base-content/10 hover:text-base-content sm:hidden"
            onClick={() => setIsDetailsVisible(!isDetailsVisible)}
            type="button"
          >
            {isDetailsVisible
              ? tAuth("marketing.showDetails")
              : tAuth("marketing.hideDetails")}
            {isDetailsVisible ? <CaretDownIcon /> : <CaretUpIcon />}
          </button>
        </div>
      </div>
    </section>
  );
}
