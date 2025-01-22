import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { Index } from "@/pages/Index"
import { Login } from "@/pages/Login"
import { Dashboard } from "@/pages/Dashboard"
import { Documentation } from "@/pages/Documentation"
import { CRM } from "@/pages/CRM"
import { Profile } from "@/pages/Profile"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/crm" element={<CRM />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Toaster />
    </Router>
  )
}