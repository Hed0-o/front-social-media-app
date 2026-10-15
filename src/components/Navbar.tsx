import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Button, Dropdown } from "@heroui/react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { isLoggedIn, user, logout } = useContext(AuthContext)!;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleLogout = () => {
    logout();
    navigate("/auth/signin", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-default-200/70 bg-background/90 backdrop-blur-xl">
      <nav className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:h-72px lg:px-8">
        <Link
          to="/social/feed"
          className="group flex w-fit items-center gap-2.5"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-black text-primary-foreground shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
            S
          </div>

          <div className="hidden sm:block">
            <span className="block text-base font-bold leading-tight tracking-tight">
              Social
            </span>
            <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.15em] text-default-400">
              Connect. Share. Discover.
            </span>
          </div>
        </Link>

        <div className="flex items-center justify-center">
          {isLoggedIn && (
            <NavItem
              to="/social/feed"
              label="Explore"
              active={isActive("/social/feed")}
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {!isLoggedIn ? (
            <>
              <Link
                to="/auth/signin"
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-default-600 transition-all duration-200 hover:bg-default-100 hover:text-foreground sm:px-4"
              >
                Sign In
              </Link>

              <Link
                to="/auth/signup"
                className="rounded-xl bg-primary px-3.5 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:translate-y-0 sm:px-5"
              >
                Get Started
              </Link>
            </>
          ) : (
            <Dropdown>
              <Dropdown.Trigger>
                <Button
                  isIconOnly
                  variant="primary"
                  aria-label="Open user menu"
                  className="size-10 min-w-10 rounded-full p-0 transition-transform duration-200 hover:scale-105"
                >
                  <Avatar className="size-9">
                    <Avatar.Image
                      src={user?.photo}
                      alt={user?.name ?? "User"}
                    />
                    <Avatar.Fallback>
                      {user?.name?.charAt(0).toUpperCase() ?? "U"}
                    </Avatar.Fallback>
                  </Avatar>
                </Button>
              </Dropdown.Trigger>

              <Dropdown.Popover>
                <Dropdown.Menu aria-label="User menu" className="min-w-52">
                  <Dropdown.Item
                    key="user"
                    textValue={user?.name ?? "Account"}
                    className="cursor-default"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate font-semibold text-foreground">
                        {user?.name}
                      </span>
                      <span className="truncate text-xs text-default-400">
                        @{user?.username}
                      </span>
                    </div>
                  </Dropdown.Item>

                  <Dropdown.Item
                    key="profile"
                    onAction={() => navigate("/social/profile")}
                  >
                    Profile
                  </Dropdown.Item>

                  <Dropdown.Item
                    key="logout"
                    className="text-danger"
                    onAction={handleLogout}
                  >
                    Log out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          )}
        </div>
      </nav>
    </header>
  );
}

function NavItem({
  to,
  label,
  active,
}: {
  to: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-background text-primary shadow-sm"
          : "text-default-500 hover:bg-background/70 hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
