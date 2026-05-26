import {
  HouseIcon,
  ListIcon,
  MoonIcon,
  SignOutIcon,
  SquaresFourIcon,
  SunIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";

export const Route = createFileRoute("/_authenticated/_sidebar")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex h-screen">
      <div className="drawer lg:drawer-open">
        <input className="drawer-toggle" id="drawer" type="checkbox" />
        <div className="drawer-content">
          <nav className="navbar fixed top-0 w-full gap-2 bg-base max-md:sticky">
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

        <aside className="drawer-side is-drawer-close:overflow-visible">
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
                <p className="line-clamp-1 text-xs opacity-60">{user?.role}</p>
              </div>
            </div>
            <div className="join mb-4 is-drawer-close:hidden w-full rounded px-4">
              <label className="btn btn-sm join-item has-checked:btn-primary flex-1">
                <input
                  aria-label="dark"
                  checked={theme === "dark"}
                  className="theme-controller hidden"
                  name="theme-buttons"
                  onChange={() => setTheme("dark")}
                  type="radio"
                  value="dark"
                />
                <MoonIcon />
                <span>Dark</span>
              </label>
              <label className="btn btn-sm join-item has-checked:btn-primary flex-1">
                <input
                  aria-label="light"
                  checked={theme === "light"}
                  className="theme-controller hidden"
                  name="theme-buttons"
                  onChange={() => setTheme("light")}
                  type="radio"
                  value="light"
                />
                <SunIcon />
                <span>Light</span>
              </label>
            </div>
            <div className="flex w-full flex-1 flex-col justify-between gap-2">
              <ul className="menu w-full gap-2">
                <li>
                  <Link
                    activeProps={{ className: "menu-active" }}
                    className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                    data-tip="Home"
                    to="/"
                  >
                    <HouseIcon size={24} />
                    <span className="is-drawer-close:hidden">Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    activeProps={{ className: "menu-active" }}
                    className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                    data-tip="Skills"
                    to="/skills"
                  >
                    <SquaresFourIcon size={24} />
                    <span className="is-drawer-close:hidden">Skills</span>
                  </Link>
                </li>
              </ul>
              <ul className="menu w-full gap-2">
                <li>
                  <button
                    className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                    data-tip="Sign Out"
                    type="button"
                  >
                    <SignOutIcon size={24} />
                    <span className="line-clamp-1 is-drawer-close:hidden">
                      Sign Out
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
