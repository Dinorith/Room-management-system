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
import { PublicPaymentPage } from "./pages/PublicPaymentPage";
import { PublicContractSignPage } from "./pages/PublicContractSignPage";

// Super Admin Imports
import { SuperAdminLayout } from "./components/layout/SuperAdminLayout";
import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
import { OwnerManagement } from "./pages/OwnerManagement";
import { PropertyOverview } from "./pages/PropertyOverview";
import { SuperAdminInvoices } from "./pages/SuperAdminInvoices";
import { SuperAdminPayments } from "./pages/SuperAdminPayments";
import { SuperAdminAnalytics } from "./pages/SuperAdminAnalytics";
import { SuperAdminActivityLogs } from "./pages/SuperAdminActivityLogs";
import { SuperAdminSettings } from "./pages/SuperAdminSettings";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/pay/:paymentId",
    Component: PublicPaymentPage,
  },
  {
    path: "/sign/:contractId",
    Component: PublicContractSignPage,
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
  {
    path: "/super-admin",
    Component: SuperAdminLayout,
    children: [
      { index: true, Component: SuperAdminDashboard },
      { path: "owners", Component: OwnerManagement },
      { path: "properties", Component: PropertyOverview },
      { path: "invoices", Component: SuperAdminInvoices },
      { path: "payments", Component: SuperAdminPayments },
      { path: "analytics", Component: SuperAdminAnalytics },
      { path: "activity-logs", Component: SuperAdminActivityLogs },
      { path: "settings", Component: SuperAdminSettings },
    ],
  },
]);
