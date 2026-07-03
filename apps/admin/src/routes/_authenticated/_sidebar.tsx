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
import { useEffect, useState } from "react";
import { Avatar } from "@/components/display/avatar";
import { useDebounce } from "@/hooks/custom/use-debounce";
import { useMediaQuery } from "@/hooks/custom/use-media-query";
import { useAuthStore } from "@/stores/auth";
import { MenuAction, type MenuActionProps } from "./-components/menu-action";
import { MenuLink, type MenuLinkProps } from "./-components/menu-link";
import { ThemeSwitch } from "./-components/theme-switch";

interface MenuSection {
  items: (MenuLinkProps | MenuActionProps)[];
  label?: string;
}

const MENU_SECTIONS: MenuSection[] = [
  {
    label: "Navigation",
    items: [
      {
        icon: <HouseIcon size={24} weight="duotone" />,
        label: "Home",
        to: "/",
        type: "link",
      },
      {
        icon: <PackageIcon size={24} weight="duotone" />,
        label: "Skills",
        to: "/skills",
        type: "link",
      },
      {
        icon: <CertificateIcon size={24} weight="duotone" />,
        label: "Courses",
        to: "/courses",
        type: "link",
      },
      {
        icon: <GraduationCapIcon size={24} weight="duotone" />,
        label: "Educations",
        to: "/educations",
        type: "link",
      },
      {
        icon: <BuildingsIcon size={24} weight="duotone" />,
        label: "Organizations",
        to: "/organizations",
        type: "link",
      },
      {
        icon: <RocketLaunchIcon size={24} weight="duotone" />,
        label: "Projects",
        to: "/projects",
        type: "link",
      },
      {
        icon: <BriefcaseIcon size={24} weight="duotone" />,
        label: "Experiences",
        to: "/experiences",
        type: "link",
      },
    ],
  },
  {
    label: "Actions",
    items: [
      {
        icon: <KeyIcon size={24} weight="duotone" />,
        label: "Tokens",
        to: "/api-tokens",
        type: "link",
      },
      {
        icon: <GearIcon size={24} />,
        label: "Settings",
        to: "/settings",
        type: "link",
      },
      {
        icon: <SignOutIcon size={24} />,
        label: "Sign Out",
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
        <nav className="navbar sticky top-0 z-30 w-full gap-2 bg-base bg-base-100">
          <label
            aria-label="open sidebar"
            className="btn btn-square btn-ghost group"
            htmlFor="drawer"
          >
            <ListIcon size={24} weight="bold" />
          </label>
        </nav>
        <main className="container">
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
          <ThemeSwitch />
          <div className="flex w-full flex-1 flex-col justify-between gap-2">
            {MENU_SECTIONS.map((section, i) => (
              <ul className="menu w-full gap-2" key={section.label ?? i}>
                {section.items.map((item) => (
                  <li key={item.label}>
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
