import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
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
import { useState } from "react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav, sidenavType } = controller;
  const [openDropdown, setOpenDropdown] = useState(null);

  // ✅ Make sidenav background green instead of dark gray
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-green-800 to-green-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  const handleToggle = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-green-500`}
    >
      {/* ✅ Logo Section */}
      <div>
        <Link
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
        </Link>

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

      {/* ✅ Navigation Section */}
      <div className="m-4">
        {routes.map(({ layout, title, pages }, key) => (
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

            {pages
              .filter(({ hidden }) => !hidden)
              .map(({ icon, name, path, collapse }) => (
                <li key={name}>
                  {collapse ? (
                    <>
                      <div className="flex items-center justify-between">
                        {/* Parent NavLink */}
                        <NavLink
                          to={`/${layout}${path}`}
                          className="flex-1"
                          onClick={() => handleToggle(name)}
                        >
                          {({ isActive }) => (
                            <Button
                              variant={isActive ? "gradient" : "text"}
                              color="green"
                              className={`flex items-center gap-4 px-4 capitalize w-full text-left ${
                                isActive
                                  ? "bg-green-500 text-white"
                                  : "text-green-700 hover:bg-green-700/30"
                              }`}
                              fullWidth
                            >
                              {icon}
                              <Typography
                                color="inherit"
                                className="font-medium capitalize"
                              >
                                {name}
                              </Typography>
                            </Button>
                          )}
                        </NavLink>

                        {/* Dropdown toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggle(name);
                          }}
                          className="px-2 text-green-300 hover:text-white"
                        >
                          {openDropdown === name ? (
                            <ChevronUpIcon className="h-4 w-4" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Submenu */}
                      <Collapse open={openDropdown === name}>
                        <ul className="ml-10 mt-1 flex flex-col gap-1 border-l border-green-400 pl-3">
                          {collapse
                            .filter(({ hidden }) => !hidden)
                            .map(({ name: subName, path: subPath }) => (
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
                                      <Typography color="inherit">
                                        {subName}
                                      </Typography>
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
                          <Typography
                            color="inherit"
                            className="font-medium capitalize"
                          >
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
