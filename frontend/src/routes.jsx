import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  UsersIcon,
  ServerStackIcon,
  RectangleStackIcon,
  IdentificationIcon,
  WrenchScrewdriverIcon
} from "@heroicons/react/24/solid";

import {
  Home,
  Profile,
  Tables,
  Notifications,
  Customer,
  User
} from "@/pages/dashboard";



import Addcustomer from "@/pages/dashboard/addcustomer";
import Viewcustomer from "@/pages/dashboard/viewcustomer";
import EditUserForm from "./pages/dashboard/edituser";
import AddUser from "@/pages/dashboard/adduser"; // <-- New
import ViewUser from "@/pages/dashboard/viewuser"; // <-- New
import { SignIn, SignUp } from "@/pages/auth";
import Editcustomer from "./pages/dashboard/editcustomer";
import Amc from "./pages/dashboard/amc";
import Addamc from "./pages/dashboard/addamc";
import Viewamc from "./pages/dashboard/viewamc";
import Editamc from "./pages/dashboard/editamc";


const icon = {
  className: "w-5 h-5 text-inherit",
};

const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Employee", // <-- New main tab
        path: "/users",
        element: <User />, // optional if you have a main Users page, otherwise null
        collapse: [
          {
            name: "Add Employee",
            path: "/users/add",
            element: <AddUser />,
          },
          {
            name: "View Employees",
            path: "/users/viewusers",
            element: <ViewUser />,
          },
          {
            path: "/users/edituser",
            element: <EditUserForm />,
            hidden: true,
          },
        ],
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "customers",
        path: "/customers",
        element: <Customer />,
        collapse: [
          {
            name: "Add Customer",
            path: "/customers/add",
            element: <Addcustomer />,
          },
          {
            name: "View Customer",
            path: "/customers/viewcustomers",
            element: <Viewcustomer />,
          },
          {
            path: "/customers/editcustomer",
            element: <Editcustomer />,
            hidden: true,
          },
        ],
      },
      {
        icon: <WrenchScrewdriverIcon {...icon} />,
        name: "AMC", // 
        path: "/amc",
        element: <Amc />,
        collapse: [
          {
            name: "Add AMC",
            path: "/amc/addamc",
            element: <Addamc />,
          },
          {
            name: "View AMC",
            path: "/amc/viewamc",
            element: <Viewamc />,
          },
          {
            name: "Edit AMC",
            path: "/amc/editamc",
            element: <Editamc />,
            hidden: true,
          },
        ],
      },

      {
        icon: <IdentificationIcon {...icon} />, // 👈 changed to ID card style
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
      // {
      //   icon: <TableCellsIcon {...icon} />,
      //   name: "tables",
      //   path: "/tables",
      //   element: <Tables />,
      // },
      // {
      //   icon: <InformationCircleIcon {...icon} />,
      //   name: "notifications",
      //   path: "/notifications",
      //   element: <Notifications />,
      // },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      // {
      //   icon: <RectangleStackIcon {...icon} />,
      //   name: "sign up",
      //   path: "/sign-up",
      //   element: <SignUp />,
      // },
    ],
  },
];

export default routes;
