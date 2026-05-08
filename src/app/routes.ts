import { createBrowserRouter, Navigate } from "react-router";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { Rooms } from "./pages/Rooms";
import { Tenants } from "./pages/Tenants";
import { Contracts } from "./pages/Contracts";
import { Payments } from "./pages/Payments";
import { Maintenance } from "./pages/Maintenance";
import { Expenses } from "./pages/Expenses";
import { Utilities } from "./pages/Utilities";
import { Settings } from "./pages/Settings";
import { Reports } from "./pages/Reports";
import { Calendar } from "./pages/Calendar";
import { Communications } from "./pages/Communications";
import { Login } from "./pages/Login";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "rooms", Component: Rooms },
      { path: "tenants", Component: Tenants },
      { path: "contracts", Component: Contracts },
      { path: "payments", Component: Payments },
      { path: "maintenance", Component: Maintenance },
      { path: "expenses", Component: Expenses },
      { path: "utilities", Component: Utilities },
      { path: "reports", Component: Reports },
      { path: "calendar", Component: Calendar },
      { path: "communications", Component: Communications },
      { path: "settings", Component: Settings },
    ],
  },
]);
