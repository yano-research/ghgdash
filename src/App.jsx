import { Routes, Route } from "react-router-dom"
import SupabaseTestPage from "./pages/SupabaseTestPage"

export default function App() {
  return (
    <Routes>
      <Route path="/supabase-test" element={<SupabaseTestPage />} />
    </Routes>
  )
}