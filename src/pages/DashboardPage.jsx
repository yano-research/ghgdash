import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import {
  BanknotesIcon,
  BuildingOfficeIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

// 전각 영문 → 반각 변환
const toHalfWidth = (str) => {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
  )
}

export default function DashboardPage() {
  const [summary, setSummary] = useState({ companyCount: 0, industryCount: 0, topIndustry: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [allCompanies, setAllCompanies] = useState([])
  const [industryData, setIndustryData] = useState({ labels: [], values: [] })

  useEffect(() => {
    const fetchSummary = async () => {
      const { data, error } = await supabase
        .from('emissions')
        .select('industry')
        .order('gov_2019', { ascending: false })

      if (!error && data) {
        const uniqueNames = new Set()
        const filtered = data.filter((d) => {
          if (uniqueNames.has(d.industry)) return false
          uniqueNames.add(d.industry)
          return true
        })
        const industries = data.map((d) => d.industry)
        const freq = industries.reduce((acc, cur) => {
          acc[cur] = (acc[cur] || 0) + 1
          return acc
        }, {})
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
        setSummary({
          companyCount: data.length,
          industryCount: [...new Set(industries)].length,
          topIndustry: top,
        })
      }
    }
    fetchSummary()
  }, [])

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase.from('emissions').select('name')
      if (!error && data) setAllCompanies(data.map((d) => d.name))
    }
    fetchCompanies()
  }, [])

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = allCompanies.filter((name) =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }, [searchQuery, allCompanies])

  useEffect(() => {
    const fetchIndustryData = async () => {
      const { data, error } = await supabase
        .from('emissions')
        .select('industry, s3_self_2023')
        .not('s3_self_2023', 'is', null)

      if (!error && data) {
        const grouped = data.reduce((acc, cur) => {
          const { industry, s3_self_2023 } = cur
          if (!industry) return acc
          if (!acc[industry]) acc[industry] = []
          acc[industry].push(parseFloat(s3_self_2023) || 0)
          return acc
        }, {})

        const labels = Object.keys(grouped)
        const values = labels.map((ind) => {
          const total = grouped[ind].reduce((sum, val) => sum + val, 0)
          return Math.round(total)
        })

        setIndustryData({ labels, values })
      }
    }
    fetchIndustryData()
  }, [])

  const cards = [
    { name: '전체 등록 기업 수', stat: `${summary.companyCount}社`, icon: BuildingOfficeIcon },
    { name: '업종 수', stat: `${summary.industryCount}種`, icon: BanknotesIcon },
    { name: '가장 많이 등록된 업종', stat: summary.topIndustry, icon: ChartPieIcon },
  ]

  const chartData = {
    labels: industryData.labels,
    datasets: [
      {
        label: 'Scope 3 배출량 (2023, 천tCO₂)',
        data: industryData.values,
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex-1 relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(toHalfWidth(e.target.value))}
            placeholder="Search"
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm"
          />
        </div>
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">GHG Dashboard</h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
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

        {/* Graph Section */}
        <div className="bg-white p-6 rounded-xl shadow ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">2023년 Scope 3 배출량 (업종별)</h2>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      </div>
    </div>
  )
}