import PropTypes from "prop-types";
import { NavLink, useLocation } from "react-router-dom";
import {
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  IconButton,
  Typography,
  Collapse,
} from "@material-tailwind/react";
import { useState, useEffect, useMemo } from "react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";


export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav, sidenavType } = controller;
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  // ---- Read role from multiple possible storage shapes ----
  const rawRole = localStorage.getItem("role");
  const rawUser = localStorage.getItem("user");
  let role = rawRole ?? null;
  try {
    if (!role && rawUser) {
      const parsed = JSON.parse(rawUser);
      role = parsed?.role ?? null;
    }
  } catch (e) {

    console.warn("Sidenav: failed to parse localStorage.user", e);
  }


  console.debug("Sidenav: detected role ->", role);
  console.debug("Sidenav: localStorage.role:", rawRole, " localStorage.user:", rawUser);

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-green-800 to-green-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  const handleToggle = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };


  useEffect(() => {
    routes.forEach(({ layout, pages }) => {
      pages.forEach(({ name, collapse }) => {
        if (
          collapse?.some(
            ({ path: subPath }) =>
              location.pathname === `/${layout}${subPath}`
          )
        ) {
          setOpenDropdown(name);
        }
      });
    });
  }, [location.pathname, routes]);


  const isPageAllowed = (page) => {

    if (page.allowedRoles && Array.isArray(page.allowedRoles)) {
      return page.allowedRoles.includes(role);
    }

    if (page.collapse && Array.isArray(page.collapse)) {
      const anyChildHasExplicitRoles = page.collapse.some(
        (sub) => Array.isArray(sub.allowedRoles)
      );
      if (anyChildHasExplicitRoles) {
        return page.collapse.some((sub) =>
          sub.allowedRoles ? sub.allowedRoles.includes(role) : false
        );
      }
    }

    // Default: no allowedRoles specified at all → show to everyone
    return true;
  };

  // Compute filtered routes (memoized for stability)
  const filteredRoutes = useMemo(() => {
    // debug: show incoming structure
    console.debug("Sidenav: original routes:", routes);

    return routes.map((routeGroup) => {
      const filteredPages = (routeGroup.pages || []).filter((page) => {
        // hide pages that are explicitly hidden
        if (page.hidden) return false;
        // use helper
        const allowed = isPageAllowed(page);
        console.debug(`Sidenav: page "${page.name}" allowed ->`, allowed);
        return allowed;
      }).map((page) => {
        // for pages with collapse, filter their children too
        if (Array.isArray(page.collapse)) {
          const filteredCollapse = page.collapse
            .filter((sub) => !sub.hidden)
            .filter((sub) => {
              // if sub.allowedRoles exists, use it
              if (sub.allowedRoles && Array.isArray(sub.allowedRoles)) {
                return sub.allowedRoles.includes(role);
              }
              // otherwise, fallback to parent allowedRoles (if any) or allow
              if (page.allowedRoles && Array.isArray(page.allowedRoles)) {
                return page.allowedRoles.includes(role);
              }
              return true;
            });
          return { ...page, collapse: filteredCollapse };
        }
        return page;
      });

      return { ...routeGroup, pages: filteredPages };
    });
  }, [routes, role]);

  // debug: final filtered structure
  console.debug("Sidenav: filteredRoutes ->", filteredRoutes);

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-green-500`}
    >
      {/* Logo */}
      <div>
        <NavLink
          to="/"
          className="py-6 px-8 flex flex-col items-center justify-center gap-2"
        >
          <img
            src={`${import.meta.env.BASE_URL}${brandImg.replace(/^\/+/, "")}`}
            alt="GrowPro Logo"
            className="h-20 w-auto object-contain"
          />
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
          >
            {brandName}
          </Typography>

          {/* show role visibly for quick verification */}
          {role ? (
            <p className="text-sm text-green-300 mt-1 capitalize">
              Role: {role}
            </p>
          ) : (
            <p className="text-sm text-red-300 mt-1">
              Role: (none)
            </p>
          )}
        </NavLink>

        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-3 top-3 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-7 w-7 text-black" />
        </IconButton>
      </div>

      {/* Routes */}
      <div className="m-4">
        {filteredRoutes.map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-1">
            {title && (
              <li className="mx-3.5 mt-4 mb-2">
                <Typography
                  variant="small"
                  color={sidenavType === "dark" ? "white" : "blue-gray"}
                  className="font-black uppercase opacity-75"
                >
                  {title}
                </Typography>
              </li>
            )}

            {pages.map(({ icon, name, path, collapse }) => (
              <li key={name}>
                {collapse && collapse.length > 0 ? (
                  <>
                    <Button
                      variant={openDropdown === name ? "gradient" : "text"}
                      color="green"
                      className={`flex items-center justify-between gap-4 px-4 capitalize w-full text-left ${
                        openDropdown === name
                          ? "bg-green-500 text-white"
                          : "text-green-700 hover:bg-green-700/30"
                      }`}
                      fullWidth
                      onClick={() => handleToggle(name)}
                    >
                      <div className="flex items-center gap-4">
                        {icon}
                        <Typography color="inherit" className="font-medium capitalize">
                          {name}
                        </Typography>
                      </div>

                      {openDropdown === name ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </Button>

                    <Collapse open={openDropdown === name}>
                      <ul className="ml-10 mt-1 flex flex-col gap-1 border-l border-green-400 pl-3">
                        {collapse.map(({ name: subName, path: subPath }) => (
                          <li key={subName}>
                            <NavLink to={`/${layout}${subPath}`}>
                              {({ isActive }) => (
                                <Button
                                  variant={isActive ? "gradient" : "text"}
                                  color="green"
                                  className={`flex items-center gap-4 px-4 text-sm capitalize ${
                                    isActive
                                      ? "bg-green-500 text-white"
                                      : "text-green-700 hover:bg-green-700/30"
                                  }`}
                                  fullWidth
                                >
                                  <Typography color="inherit">{subName}</Typography>
                                </Button>
                              )}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </Collapse>
                  </>
                ) : (
                  <NavLink to={`/${layout}${path}`}>
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "gradient" : "text"}
                        color="green"
                        className={`flex items-center gap-4 px-4 capitalize ${
                          isActive
                            ? "bg-green-500 text-white"
                            : "text-green-700 hover:bg-green-700/30"
                        }`}
                        fullWidth
                      >
                        {icon}
                        <Typography color="inherit" className="font-medium capitalize">
                          {name}
                        </Typography>
                      </Button>
                    )}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/growprologo.jpeg",
  brandName: "GrowPro",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidenav.jsx";

export default Sidenav;
