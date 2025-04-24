// App.jsx ✅ 수정 후
import { Routes, Route } from "react-router-dom"
import DashboardPage from "./pages/DashboardPage"
import SupabaseTestPage from "./pages/SupabaseTestPage"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/supabase-test" element={<SupabaseTestPage />} />
    </Routes>
  )
}