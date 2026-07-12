import {
  BriefcaseIcon,
  BuildingsIcon,
  CertificateIcon,
  GraduationCapIcon,
  HouseIcon,
  KeyIcon,
  ListIcon,
  PackageIcon,
  RocketLaunchIcon,
  SignOutIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/components/display/avatar";
import { SystemMessages } from "@/components/display/system-messages";
import { useDebounce } from "@/hooks/custom/use-debounce";
import { useMediaQuery } from "@/hooks/custom/use-media-query";
import { useAuthStore } from "@/stores/auth";
import { LocaleSwitch } from "./-components/locale-switch";
import { MenuAction } from "./-components/menu-action";
import { MenuLink } from "./-components/menu-link";
import { ThemeSwitch } from "./-components/theme-switch";

export const Route = createFileRoute("/_authenticated/_sidebar")({
  component: RouteComponent,
});

const LG_MEDIA_QUERY = "(min-width: 1024px)";
const DRAWER_SYNC_DEBOUNCE_MS = 100;

function RouteComponent() {
  const { t: tNav } = useTranslation("nav");
  const { user } = useAuthStore();
  const isLg = useMediaQuery(LG_MEDIA_QUERY);
  const isLgDebounced = useDebounce(isLg, DRAWER_SYNC_DEBOUNCE_MS);
  const [drawerExpanded, setDrawerExpanded] = useState(isLg);

  useEffect(() => {
    setDrawerExpanded((current) =>
      current === isLgDebounced ? current : isLgDebounced
    );
  }, [isLgDebounced]);

  return (
    <div className="drawer lg:drawer-open">
      <input
        checked={drawerExpanded}
        className="drawer-toggle"
        id="drawer"
        onChange={(event) => setDrawerExpanded(event.target.checked)}
        type="checkbox"
      />
      <div className="drawer-content">
        <nav className="navbar sticky top-0 z-30 w-full gap-2 bg-base-100">
          <label
            aria-label="open sidebar"
            className="btn btn-square btn-ghost group shrink-0"
            htmlFor="drawer"
          >
            <ListIcon size={24} weight="bold" />
          </label>
          <SystemMessages />
        </nav>
        <main className="container overflow-x-clip">
          <Outlet />
        </main>
      </div>

      <aside className="drawer-side z-50 is-drawer-close:overflow-visible">
        <label
          aria-label="close sidebar"
          className="drawer-overlay"
          htmlFor="drawer"
        />
        <div className="flex min-h-full is-drawer-close:w-16 is-drawer-open:w-64 flex-col items-start bg-base-200">
          <div className="flex w-full items-center gap-2 p-4 pb-2">
            <Avatar
              avatar={user?.avatar}
              className="size-8"
              name={user?.name}
            />
            <div className="flex is-drawer-close:hidden flex-1 flex-col">
              <strong className="line-clamp-1 text-sm">{user?.name}</strong>
              <p className="line-clamp-1 text-xs opacity-md">{user?.role}</p>
            </div>
          </div>
          <div className="flex w-full items-center gap-2 px-3 pt-1">
            <ThemeSwitch />
            <LocaleSwitch />
          </div>
          <div className="flex w-full flex-1 flex-col justify-between gap-2">
            <ul className="menu w-full gap-2">
              <li>
                <MenuLink
                  icon={<HouseIcon size={24} weight="duotone" />}
                  label={tNav("home")}
                  to="/"
                />
              </li>
              <li>
                <MenuLink
                  icon={<PackageIcon size={24} weight="duotone" />}
                  label={tNav("skills")}
                  to="/skills"
                />
              </li>
              <li>
                <MenuLink
                  icon={<CertificateIcon size={24} weight="duotone" />}
                  label={tNav("courses")}
                  to="/courses"
                />
              </li>
              <li>
                <MenuLink
                  icon={<GraduationCapIcon size={24} weight="duotone" />}
                  label={tNav("educations")}
                  to="/educations"
                />
              </li>
              <li>
                <MenuLink
                  icon={<BuildingsIcon size={24} weight="duotone" />}
                  label={tNav("organizations")}
                  to="/organizations"
                />
              </li>
              <li>
                <MenuLink
                  icon={<RocketLaunchIcon size={24} weight="duotone" />}
                  label={tNav("projects")}
                  to="/projects"
                />
              </li>
              <li>
                <MenuLink
                  icon={<BriefcaseIcon size={24} weight="duotone" />}
                  label={tNav("experiences")}
                  to="/experiences"
                />
              </li>
            </ul>
            <ul className="menu w-full gap-2">
              <li>
                <MenuLink
                  icon={<KeyIcon size={24} weight="duotone" />}
                  label={tNav("apiTokens")}
                  to="/api-tokens"
                />
              </li>
              <li>
                <MenuLink
                  icon={<UserIcon size={24} weight="duotone" />}
                  label={tNav("settings")}
                  to="/settings"
                />
              </li>
              <li>
                <MenuAction
                  className="text-error"
                  icon={<SignOutIcon size={24} />}
                  label={tNav("signOut")}
                  onClick={() => useAuthStore.getState().clearAuth()}
                />
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
