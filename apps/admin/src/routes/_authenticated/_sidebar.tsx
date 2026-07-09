import {
  BriefcaseIcon,
  BuildingsIcon,
  CertificateIcon,
  GearIcon,
  GraduationCapIcon,
  HouseIcon,
  KeyIcon,
  ListIcon,
  PackageIcon,
  RocketLaunchIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/components/display/avatar";
import { SystemMessages } from "@/components/display/system-messages";
import { useDebounce } from "@/hooks/custom/use-debounce";
import { useMediaQuery } from "@/hooks/custom/use-media-query";
import { useAuthStore } from "@/stores/auth";
import { LocaleSwitch } from "./-components/locale-switch";
import { MenuAction, type MenuActionProps } from "./-components/menu-action";
import { MenuLink, type MenuLinkProps } from "./-components/menu-link";
import { ThemeSwitch } from "./-components/theme-switch";

type NavKey =
  | "home"
  | "skills"
  | "courses"
  | "educations"
  | "organizations"
  | "projects"
  | "experiences"
  | "apiTokens"
  | "settings"
  | "signOut";

type MenuLinkItem = Omit<MenuLinkProps, "label"> & {
  id: NavKey;
  type: "link";
};

type MenuActionItem = Omit<MenuActionProps, "label"> & {
  id: NavKey;
  type: "action";
};

type MenuItem = MenuLinkItem | MenuActionItem;

interface MenuSection {
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    items: [
      {
        id: "home",
        icon: <HouseIcon size={24} weight="duotone" />,
        to: "/",
        type: "link",
      },
      {
        id: "skills",
        icon: <PackageIcon size={24} weight="duotone" />,
        to: "/skills",
        type: "link",
      },
      {
        id: "courses",
        icon: <CertificateIcon size={24} weight="duotone" />,
        to: "/courses",
        type: "link",
      },
      {
        id: "educations",
        icon: <GraduationCapIcon size={24} weight="duotone" />,
        to: "/educations",
        type: "link",
      },
      {
        id: "organizations",
        icon: <BuildingsIcon size={24} weight="duotone" />,
        to: "/organizations",
        type: "link",
      },
      {
        id: "projects",
        icon: <RocketLaunchIcon size={24} weight="duotone" />,
        to: "/projects",
        type: "link",
      },
      {
        id: "experiences",
        icon: <BriefcaseIcon size={24} weight="duotone" />,
        to: "/experiences",
        type: "link",
      },
    ],
  },
  {
    items: [
      {
        id: "apiTokens",
        icon: <KeyIcon size={24} weight="duotone" />,
        to: "/api-tokens",
        type: "link",
      },
      {
        id: "settings",
        icon: <GearIcon size={24} />,
        to: "/settings",
        type: "link",
      },
      {
        id: "signOut",
        icon: <SignOutIcon size={24} />,
        onClick: () => useAuthStore.getState().clearAuth(),
        type: "action",
      },
    ],
  },
];

export const Route = createFileRoute("/_authenticated/_sidebar")({
  component: RouteComponent,
});

const LG_MEDIA_QUERY = "(min-width: 1024px)";
const DRAWER_SYNC_DEBOUNCE_MS = 100;

function RouteComponent() {
  const { t } = useTranslation("nav");
  const { user } = useAuthStore();
  const isLg = useMediaQuery(LG_MEDIA_QUERY);
  const isLgDebounced = useDebounce(isLg, DRAWER_SYNC_DEBOUNCE_MS);
  const [drawerExpanded, setDrawerExpanded] = useState(isLg);

  const menuSections = useMemo(
    () =>
      MENU_SECTIONS.map((section) => ({
        items: section.items.map((item) => ({
          ...item,
          label: t(item.id),
        })),
      })),
    [t]
  );

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
            {menuSections.map((section, i) => (
              <ul className="menu w-full gap-2" key={i}>
                {section.items.map((item) => (
                  <li key={item.id}>
                    {item.type === "link" && <MenuLink {...item} />}
                    {item.type === "action" && <MenuAction {...item} />}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
