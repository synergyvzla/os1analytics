
import { Routes as RouterRoutes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Documentation } from "@/pages/Documentation";
import { Profile } from "@/pages/Profile";
import CRM from "@/pages/CRM";

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/docs" element={<Documentation />} />
      <Route path="/crm" element={<CRM />} />
      <Route path="/profile" element={<Profile />} />
    </RouterRoutes>
  );
}
