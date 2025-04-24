import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import {
  ArrowTrendingUpIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

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
  const [summary, setSummary] = useState({
    companyCount: 0,
    industryCount: 0,
    topIndustry: '',
  })
  const [industryChartData, setIndustryChartData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('emissions')
        .select('*')
        .order('gov_2019', { ascending: false })

      if (error) {
        console.error('Error:', error)
      } else {
        const seen = new Set()
        const filtered = data.filter((d) => {
          if (seen.has(d.name)) return false
          seen.add(d.name)
          return true
        })
        setData(filtered)
      }
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
    const fetchSummary = async () => {
      const { data, error } = await supabase
        .from('emissions')
        .select('industry, gov_3yrs_avg')
        .not('gov_3yrs_avg', 'is', null)

      if (error) {
        console.error('Summary fetch error:', error)
        return
      }

      const industries = data.map(d => d.industry)
      const industrySet = [...new Set(industries)]
      const freq = industries.reduce((acc, cur) => {
        acc[cur] = (acc[cur] || 0) + 1
        return acc
      }, {})
      const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]

      setSummary({
        companyCount: data.length,
        industryCount: industrySet.length,
        topIndustry: top,
      })
    }
    fetchSummary()
  }, [])

  useEffect(() => {
    const fetchIndustryChartData = async () => {
      const { data, error } = await supabase
        .from('emissions')
        .select('industry, s3_self_2023')

      if (!error && data) {
        const grouped = data.reduce((acc, cur) => {
          const key = cur.industry || '기타'
          const value = parseFloat(cur.s3_self_2023)
          if (!isNaN(value)) {
            acc[key] = (acc[key] || 0) + value
          }
          return acc
        }, {})

        const sorted = Object.entries(grouped)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)

        setIndustryChartData({
          labels: sorted.map(([industry]) => industry),
          datasets: [
            {
              label: 'Scope 3 排出量 (2023)',
              data: sorted.map(([, value]) => value),
              borderColor: '#10b981',
              backgroundColor: '#10b981',
              tension: 0.4,
            },
          ],
        })
      }
    }
    fetchIndustryChartData()
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

  const cards = [
    { name: '登録企業数', stat: `${summary.companyCount}社`, icon: BuildingOfficeIcon },
    { name: '業種数', stat: `${summary.industryCount}種`, icon: BanknotesIcon },
    { name: '最も多く登録された業種', stat: summary.topIndustry, icon: ChartPieIcon },
  ]

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
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
        <div className="ml-6 flex items-center gap-x-4">
        <Link to="/login">
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Login
        </button>
        </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">GHG Dashboard</h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <div key={i} className="rounded-2xl bg-white px-6 py-5 shadow ring-1 ring-gray-200">
              <div className="flex items-center gap-x-4">
                <card.icon className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500">{card.name}</div>
                  <div className="text-xl font-bold text-gray-900">{card.stat}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 라인 그래프 */}
        {industryChartData && (
          <div className="mt-10 bg-white p-6 rounded-2xl shadow ring-1 ring-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">業種別 Scope 3 排出量 (2023年)</h2>
            <Line data={industryChartData} />
          </div>
        )}
      </div>
    </div>
  )
}