import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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

// 유틸 함수: 전각 영문 → 반각 영문으로 변환
const toHalfWidth = (str) => {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
    )
  }

export default function DashboardPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [allCompanies, setAllCompanies] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('emissions')
        .select('*')
        .not('gov_3yrs_avg', 'is', null) // 본사만
        .limit(2)

      if (error) console.error('Error:', error)
      else setData(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchAllCompanies = async () => {
      const { data, error } = await supabase
        .from('emissions')
        .select('name')
        .not('gov_3yrs_avg', 'is', null)

      if (!error && data) setAllCompanies(data.map(d => d.name))
    }
    fetchAllCompanies()
  }, [])

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = allCompanies.filter(name =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }, [searchQuery, allCompanies])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex-1 relative w-full max-w-md">
        <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
                const half = toHalfWidth(e.target.value)
                setSearchQuery(half)
            }}
            placeholder="Search"
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </div>
          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-56 overflow-y-auto">
              {suggestions.map((name, i) => (
                <li key={i}>
                  <Link
                    to={`/company/${name}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
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

        {/* Top Summary Cards */}
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

        {/* Recent Data Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            data.map((item) => (
              <Link
                to={`/company/${item.name}`}
                key={item.id}
                className="bg-white rounded-2xl p-6 shadow ring-1 ring-gray-200 hover:ring-green-500 hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h2>
                <p className="text-sm text-gray-600 mb-1">
                  업종: <span className="text-gray-900 font-medium">{item.industry}</span>
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Scope: <span className="text-gray-900 font-medium">{item.scope}</span>
                </p>
                <p className="text-sm text-gray-600">
                  총 배출량: <span className="text-gray-900 font-medium">{item.total_emission}</span>
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
