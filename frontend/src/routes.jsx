// src/routes.jsx
import {
  HomeIcon,
  UserCircleIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  IdentificationIcon,
  MapPinIcon,
  ServerStackIcon,
  ArrowRightOnRectangleIcon,

} from "@heroicons/react/24/solid";

import {
  Home,
  Profile,
  Customer,
  User,
} from "@/pages/dashboard";

import Addcustomer from "@/pages/dashboard/addcustomer";
import Viewcustomer from "@/pages/dashboard/viewcustomer";
import Editcustomer from "@/pages/dashboard/editcustomer";

import AddUser from "@/pages/dashboard/adduser";
import ViewUser from "@/pages/dashboard/viewuser";
import EditUserForm from "@/pages/dashboard/edituser";

import Amc from "@/pages/dashboard/amc";
import Addamc from "@/pages/dashboard/addamc";
import Viewamc from "@/pages/dashboard/viewamc";
import Editamc from "@/pages/dashboard/editamc";

import Sitevists from "@/pages/dashboard/sitevists";
import Createvisits from "@/pages/dashboard/createvisits";
import Viewvisits from "@/pages/dashboard/viewvisits";
import Revisit from "@/pages/dashboard/revisit";

import { SignIn } from "@/pages/auth";
import LogoutButton from "./Components/LogoutButton";

import RoleProtectedRoute from "@/components/RoleProtectedRoute";

const icon = { className: "w-5 h-5 text-inherit" };

const routes = [
  {
    layout: "dashboard",
    title: "Main",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Dashboard",
        path: "/home",
        allowedRoles: ["admin", "manager", "technician"],
        element: (
          <RoleProtectedRoute
            element={<Home />}
            allowedRoles={["admin", "manager", "technician"]}
          />
        ),
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Employee",
        allowedRoles: ["admin"],
        collapse: [
          {
            name: "Add Employee",
            path: "/users/add",
            allowedRoles: ["admin"],
            element: (
              <RoleProtectedRoute element={<AddUser />} allowedRoles={["admin"]} />
            ),
          },
          {
            name: "Manage Employees",
            path: "/users/viewusers",
            allowedRoles: ["admin"],
            element: (
              <RoleProtectedRoute element={<ViewUser />} allowedRoles={["admin"]} />
            ),
          },
          {
            name: "Edit Employee",
            path: "/users/edituser/:id",
            allowedRoles: ["admin"],
            element: (
              <RoleProtectedRoute element={<EditUserForm />} allowedRoles={["admin"]} />
            ),
            hidden: true,
          },
        ],
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "Customers",
        allowedRoles: ["admin", "manager"],
        collapse: [
          {
            name: "Add Customer",
            path: "/customers/add",
            allowedRoles: ["admin", "manager"],
            element: (
              <RoleProtectedRoute
                element={<Addcustomer />}
                allowedRoles={["admin", "manager"]}
              />
            ),
          },
          {
            name: "Manage Customers",
            path: "/customers/viewcustomers",
            allowedRoles: ["admin", "manager"],
            element: (
              <RoleProtectedRoute
                element={<Viewcustomer />}
                allowedRoles={["admin", "manager"]}
              />
            ),
          },
          {
            name: "Edit Customer",
            path: "/customers/editcustomer/:id",
            allowedRoles: ["admin", "manager"],
            element: (
              <RoleProtectedRoute
                element={<Editcustomer />}
                allowedRoles={["admin", "manager"]}
              />
            ),
            hidden: true,
          },
        ],
      },
      {
        icon: <WrenchScrewdriverIcon {...icon} />,
        name: "AMC",
        allowedRoles: ["admin", "manager"],
        collapse: [
          {
            name: "Add AMC",
            path: "/amc/addamc",
            allowedRoles: ["admin", "manager"],
            element: (
              <RoleProtectedRoute
                element={<Addamc />}
                allowedRoles={["admin", "manager"]}
              />
            ),
          },
          {
            name: "Manage AMC",
            path: "/amc/viewamc",
            allowedRoles: ["admin", "manager"],
            element: (
              <RoleProtectedRoute
                element={<Viewamc />}
                allowedRoles={["admin", "manager"]}
              />
            ),
          },
          {
            name: "Edit AMC",
            path: "/amc/editamc/:id",
            allowedRoles: ["admin", "manager"],
            element: (
              <RoleProtectedRoute
                element={<Editamc />}
                allowedRoles={["admin", "manager"]}
              />
            ),
            hidden: true,
          },
        ],
      },
      {
        icon: <MapPinIcon {...icon} />,
        name: "Site Visits",
        allowedRoles: ["admin", "manager", "technician"],
        collapse: [
          {
            name: "Create Visits",
            path: "/sitevisits/createvisits",
            allowedRoles: ["admin", "manager", "technician"],
            element: (
              <RoleProtectedRoute
                element={<Createvisits />}
                allowedRoles={["admin", "manager", "technician"]}
              />
            ),
          },
          {
            name: "Manage Visits",
            path: "/sitevisits/viewvisits",
            allowedRoles: ["admin", "manager", "technician"],
            element: (
              <RoleProtectedRoute
                element={<Viewvisits />}
                allowedRoles={["admin", "manager", "technician"]}
              />
            ),
          },
          // {
          //   name: "Revisit",
          //   path: "/sitevisits/revisit",
          //   allowedRoles: ["admin", "manager", "technician"],
          //   element: (
          //     <RoleProtectedRoute
          //       element={<Revisit />}
          //       allowedRoles={["admin", "manager", "technician"]}
          //     />
          //   ),
          // },
        ],
      },
      {
        icon: <IdentificationIcon {...icon} />,
        name: "Profile",
        path: "/profile",
        allowedRoles: ["admin", "manager", "technician"],
        element: (
          <RoleProtectedRoute
            element={<Profile />}
            allowedRoles={["admin", "manager", "technician"]}
          />
        ),
      },
    ],
  },
  {
    layout: "auth",
    title: "Auth Pages",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        hidden: true,
        name: "Sign In",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <ArrowRightOnRectangleIcon {...icon} />,
        name: "Sign Out",
        path: "auth/sign-in",
        element: <LogoutButton />,
      },
    ],
  },
];

export default routes;
