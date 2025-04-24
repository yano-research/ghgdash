import { Routes, Route, Outlet,Link } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import SupabaseTestPage from './pages/SupabaseTestPage'
import Sidebar from './components/Sidebar'
import CompanyDetailPage from './pages/CompanyDetailPage'
import IndustryListPage from './pages/IndustryListPage'


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
        <Route path="/company/:name" element={<CompanyDetailPage />} />
        <Route path="supabase-test" element={<SupabaseTestPage />} />
        <Route path="/industry" element={<IndustryListPage />} />
      </Route>
    </Routes>
  )
}