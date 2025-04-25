import {
    HomeIcon,
    UsersIcon,
    FolderIcon,
    CalendarIcon,
    DocumentDuplicateIcon,
    ChartPieIcon,
  } from '@heroicons/react/24/outline'
  import { useNavigate, useLocation } from 'react-router-dom'
  
  const navigation = [
    { name: 'ダッシュボード', icon: HomeIcon, path: '/' },
    { name: '業種別一覧', icon: DocumentDuplicateIcon, path: '/industry' },
    { name: 'Scope3のチャート', icon: ChartPieIcon, path: '/scope3' },
  ]
  
  export default function Sidebar() {
    const navigate = useNavigate()
    const location = useLocation()
  
    return (
      <div className="flex h-full flex-col bg-gray-900 text-white w-64">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <img
          className="mx-auto h-10 w-auto"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
          alt="Your Company"
        />
      </div>
  
        {/* Menu */}
        <nav className="flex flex-1 flex-col p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium 
                      ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    )
  }