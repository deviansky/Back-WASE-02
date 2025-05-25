import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  ChevronDownIcon,
  GridIcon,
  ListIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

// Define the NavItem type
type NavItem = {
  icon: React.ReactNode;
  name: string;
  path?: string;
  roles?: string[];
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// Define navItems
const navItems: NavItem[] = [
  // Page Admin
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/home",
    roles: ["admin"],
  },
  {
    icon: <TableIcon />,
    name: "Keuangan",
    path: "/Pemasukan",
    roles: ["admin"],
  },
  {
    name: "Kegiatan",
    icon: <ListIcon />,
    path: "/kegiatan",
    roles: ["admin"],
  },
  {
    name: "Penghuni",
    icon: <UserCircleIcon />,
    path: "/penghuni",
    roles: ["admin"],
  },
  {
    name: "Logout",
    icon: (
      <svg
        className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484H16.0007C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484H5.81528L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
          fill="currentColor"
        />
      </svg>
    ),
    path: "/user",
    roles: ["admin"],
  },


  // Page Penghuni
    {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
    roles: ["penghuni"],
  },
  {
    name: "Kegiatan",
    icon: <ListIcon />,
    path: "/kegiatan.",
    roles: ["penghuni"],
  },
  {
    name: "Penghuni",
    icon: <UserCircleIcon />,
    path: "/penghuni.",
    roles: ["penghuni"],
  }
];

// AppSidebar component
const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Get user role from localStorage safely
  const storedUser = localStorage.getItem("user");
  let userRole = "penghuni"; // default role

  try {
    const parsed = JSON.parse(storedUser || "{}");
    if (parsed.role) userRole = parsed.role;
  } catch (err) {
    console.error("Failed to parse user from localStorage", err);
  }

  // Filter menu by role
  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    filteredNavItems.forEach((nav, index) => {
      nav.subItems?.forEach((subItem) => {
        if (isActive(subItem.path)) {
          setOpenSubmenu({ type: "main", index });
          submenuMatched = true;
        }
      });
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [location, isActive, filteredNavItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `main-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) =>
      prev && prev.index === index ? null : { type: "main", index }
    );
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`menu-item group ${
                openSubmenu?.index === index ? "menu-item-active" : "menu-item-inactive"
              } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
            >
              <span className="menu-item-icon-size">{nav.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <>
                  <span className="menu-item-text">{nav.name}</span>
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform ${
                      openSubmenu?.index === index ? "rotate-180 text-indigo-500" : ""
                    }`}
                  />
                </>
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span className="menu-item-icon-size">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`main-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.index === index
                    ? `${subMenuHeight[`main-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-8 flex flex-col top-0 px-5 left-0 bg-white dark:bg-gray-900 text-white h-screen transition-all duration-300 border-r border-gray-200 z-50 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`pb-9 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img src="/images/logo/logo.svg" alt="Logo" width={150} height={40} className="dark:hidden" />
              <img src="/images/logo/logo-dark.svg" alt="Logo" width={150} height={40} className="hidden dark:block" />
            </>
          ) : (
            <img src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto no-scrollbar">
        <nav className="mb-6">{renderMenuItems(filteredNavItems)}</nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
