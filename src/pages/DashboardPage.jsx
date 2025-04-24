import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  ArrowTrendingUpIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline'

const cards = [
  { name: '전체 등록 기업 수', stat: '120', icon: BuildingOfficeIcon },
  { name: '총 배출량 (톤)', stat: '2,400,000', icon: BanknotesIcon },
  { name: '가장 많은 업종', stat: '제조업', icon: ChartPieIcon },
  { name: '배출량 상위 업종', stat: '화학', icon: ArrowTrendingUpIcon },
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('emissions3').select('*').limit(5)
      if (error) console.error('Error:', error)
      else setData(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
        {/* Search */}
        <div className="flex-1">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="ml-6 flex items-center gap-x-4">
          
          <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Login
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">GHG Dashboard</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (
            <div key={i} className="rounded-2xl bg-white px-6 py-5 shadow ring-1 ring-gray-200">
              <div className="flex items-center gap-x-4">
                <card.icon className="h-6 w-6 text-green-600" />
                <div>
                  <div className="text-sm text-gray-500">{card.name}</div>
                  <div className="text-xl font-bold text-gray-900">{card.stat}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">최근 등록된 데이터</h2>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">기업명</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">업종</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Scope</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">총 배출량</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 text-gray-900">{item.name}</td>
                    <td className="px-3 py-2 text-gray-900">{item.industry}</td>
                    <td className="px-3 py-2 text-gray-900">{item.scope}</td>
                    <td className="px-3 py-2 text-gray-900">{item.total_emission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}