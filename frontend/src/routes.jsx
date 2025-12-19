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
  EyeIcon 

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
import ManageSchedulevisit from "@/pages/dashboard/viewschedulevisit";
import EditScheduleVisit from "@/pages/dashboard/editschedulevisit";
import Createvisits from "@/pages/dashboard/createvisits-old";
import Viewvisits from "@/pages/dashboard/viewvisits";
import Editvisit from "@/pages/dashboard/editvisit-old";
import Schedulevisit from "@/pages/dashboard/schedulevisit";
import ManageMaterialDeliver from "@/pages/dashboard/manage-material-deliver";
import EditMaterialDeliver from "@/pages/dashboard/editmaterialdeliver";
import Reports from "@/pages/dashboard/reports";

import { SignIn } from "@/pages/auth";
import LogoutButton from "./Components/LogoutButton";

import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import { Eye, FileText  } from "lucide-react";


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
        allowedRoles: ["admin", "co-ordinator", "technician"],
        element: (
          <RoleProtectedRoute
            element={<Home />}
            allowedRoles={["admin", "co-ordinator", "technician"]}
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
        allowedRoles: ["admin", "co-ordinator"],
        collapse: [
          {
            name: "Add Customer",
            path: "/customers/add",
            allowedRoles: ["admin", "co-ordinator"],
            element: (
              <RoleProtectedRoute
                element={<Addcustomer />}
                allowedRoles={["admin", "co-ordinator"]}
              />
            ),
          },
          {
            name: "Manage Customers",
            path: "/customers/viewcustomers",
            allowedRoles: ["admin", "co-ordinator"],
            element: (
              <RoleProtectedRoute
                element={<Viewcustomer />}
                allowedRoles={["admin", "co-ordinator"]}
              />
            ),
          },
          {
            name: "Edit Customer",
            path: "/customers/editcustomer/:id",
            allowedRoles: ["admin", "co-ordinator"],
            element: (
              <RoleProtectedRoute
                element={<Editcustomer />}
                allowedRoles={["admin", "co-ordinator"]}
              />
            ),
            hidden: true,
          },
        ],
      },
      {
        icon: <WrenchScrewdriverIcon {...icon} />,
        name: "AMC",
        allowedRoles: ["admin", "co-ordinator", "technician"],
        collapse: [
          {
            name: "Add AMC",
            path: "/amc/addamc",
            allowedRoles: ["admin", "co-ordinator"],
            element: (
              <RoleProtectedRoute
                element={<Addamc />}
                allowedRoles={["admin", "co-ordinator"]}
              />
            ),
          },
          {
            name: "Manage AMC",
            path: "/amc/viewamc",
            allowedRoles: ["admin", "co-ordinator", "technician"],
            element: (
              <RoleProtectedRoute
                element={<Viewamc />}
                allowedRoles={["admin", "co-ordinator", "technician"]}
              />
            ),
          },
          {
            name: "Edit AMC",
            path: "/amc/editamc/:id",
            allowedRoles: ["admin", "co-ordinator"],
            element: (
              <RoleProtectedRoute
                element={<Editamc />}
                allowedRoles={["admin", "co-ordinator"]}
              />
            ),
            hidden: true,
          },
        ],
      },
      {
        icon: <MapPinIcon {...icon} />,
        name: "Schedule Site Visits",
        allowedRoles: ["admin", "co-ordinator", "technician"],
        collapse: [
          {
            name: "Schedule Visit",
            path: "/sitevisits/schedulevisit",
            allowedRoles: ["admin", "co-ordinator"],
            element: (
              <RoleProtectedRoute
                element={<Schedulevisit />}
                allowedRoles={["admin", "co-ordinator"]}
              />
            ),
          },
          {
            name: "Manage Schedule Visit",
            path: "/sitevisits/viewschedulevisit",
            allowedRoles: ["admin", "co-ordinator", "technician"],
            element: (
              <RoleProtectedRoute
                element={<ManageSchedulevisit />}
                allowedRoles={["admin", "co-ordinator", "technician"]}
              />
            ),
          },
          {
            name: "Edit Visit",
            path: "/sitevisits/editschedulevisit/:id",
            allowedRoles: ["admin", "co-ordinator"],
            element: (
              <RoleProtectedRoute
                element={<EditScheduleVisit />}
                allowedRoles={["admin", "co-ordinator"]}
              />
            ),
            hidden: true,
          }
        ],
      },
      {
        icon: <Eye {...icon} />,
        name: "Site Observation Visits",
        allowedRoles: ["admin", "co-ordinator", "technician"],
        collapse: [
          
          {
            name: "Create Observation Visits",
            path: "/sitevisits/createvisits",
            allowedRoles: ["admin", "co-ordinator", "technician"],
            element: (
              <RoleProtectedRoute
                element={<Createvisits />}
                allowedRoles={["admin", "co-ordinator", "technician"]}
              />
            ),
          },
          {
            name: "Manage Observation Visits",
            path: "/sitevisits/viewvisits",
            allowedRoles: ["admin", "co-ordinator", "technician"],
            element: (
              <RoleProtectedRoute
                element={<Viewvisits />}
                allowedRoles={["admin", "co-ordinator", "technician"]}
              />
            ),
          },
          {
            name: "Edit Visit",
            path: "/sitevisits/editvisit/:id",
            allowedRoles: ["admin", "co-ordinator"],
            element: (
              <RoleProtectedRoute
                element={<Editvisit />}
                allowedRoles={["admin", "co-ordinator"]}
              />
            ),
            hidden: true,
          },
        ],
      },
      {
        icon: <FileText {...icon} />,
        name: "Manage Material Deliver",
        path: "/manage-material-deliver",
        allowedRoles: ["admin", "co-ordinator", "technician"],
        element: (
          <RoleProtectedRoute
            element={<ManageMaterialDeliver />}
            allowedRoles={["admin", "co-ordinator", "technician"]}
          />
        ),
      },
      {
            name: "Edit Material Deliver",
            path: "/editmaterialdeliver/:id",
            allowedRoles: ["admin", "co-ordinator"],
            element: (
              <RoleProtectedRoute
                element={<EditMaterialDeliver />}
                allowedRoles={["admin", "co-ordinator"]}
              />
            ),
            hidden: true,
      },
      {
        icon: <FileText {...icon} />,
        name: "Reports",
        path: "/reports",
        allowedRoles: ["admin", "co-ordinator", "technician"],
        element: (
          <RoleProtectedRoute
            element={<Reports />}
            allowedRoles={["admin", "co-ordinator", "technician"]}
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
