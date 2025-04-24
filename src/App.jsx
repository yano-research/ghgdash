import { Routes, Route, Outlet } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import SupabaseTestPage from './pages/SupabaseTestPage'
import Sidebar from './components/Sidebar'

function Layout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="supabase-test" element={<SupabaseTestPage />} />
      </Route>
    </Routes>
  )
}