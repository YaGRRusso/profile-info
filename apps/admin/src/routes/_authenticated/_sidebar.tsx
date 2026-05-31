import {
  CertificateIcon,
  GraduationCapIcon,
  HouseIcon,
  ListIcon,
  PackageIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
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
      { icon: <HouseIcon size={24} />, label: "Home", to: "/", type: "link" },
      {
        icon: <PackageIcon size={24} />,
        label: "Skills",
        to: "/skills",
        type: "link",
      },
      {
        icon: <CertificateIcon size={24} />,
        label: "Courses",
        to: "/courses",
        type: "link",
      },
      {
        icon: <GraduationCapIcon size={24} />,
        label: "Educations",
        to: "/educations",
        type: "link",
      },
    ],
  },
  {
    label: "Actions",
    items: [
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

function RouteComponent() {
  const { user } = useAuthStore();

  return (
    <div className="drawer lg:drawer-open">
      <input className="drawer-toggle" id="drawer" type="checkbox" />
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
          <div className="flex w-full items-center gap-2 p-4">
            <div className="avatar avatar-placeholder">
              <div className="is-drawer-close:w-8 w-10 rounded-full bg-neutral text-neutral-content transition-all">
                <span>{user?.name?.charAt(0)}</span>
              </div>
            </div>
            <div className="flex is-drawer-close:hidden flex-col">
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
