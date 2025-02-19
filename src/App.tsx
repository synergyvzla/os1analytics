
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"
import Index from "@/pages/Index"
import { Login } from "@/pages/Login"
import { Dashboard } from "@/pages/Dashboard"
import { Documentation } from "@/pages/Documentation"
import { Profile } from "@/pages/Profile"
import CRM from "@/pages/CRM"
import Admin from "@/pages/Admin"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
