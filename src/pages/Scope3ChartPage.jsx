import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const categories = Array.from({ length: 15 }, (_, i) => `Category ${i + 1}`)

export default function Scope3ChartPage() {
  const [tab, setTab] = useState('company') // company or category
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Category 1')
  const [lineData, setLineData] = useState(null)
  const [barData, setBarData] = useState(null)

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from('emissions')
        .select('name')
      if (data) {
        const unique = [...new Set(data.map(d => d.name))]
        setCompanies(unique)
        setSelectedCompany(unique[0])
      }
    }
    fetchCompanies()
  }, [])

  useEffect(() => {
    if (tab === 'company' && selectedCompany) {
      const fetchCompanyScope3 = async () => {
        const years = ['2021', '2022', '2023']
        const cols = years.flatMap(y =>
          Array.from({ length: 15 }, (_, i) => `s3_self_c${i + 1}_${y}`)
        )

        const { data } = await supabase
          .from('emissions')
          .select(['name', ...cols].join(','))
          .eq('name', selectedCompany)
          .limit(1)

        if (data && data.length > 0) {
          const datasets = years.map((year, yIdx) => ({
            label: year,
            data: Array.from({ length: 15 }, (_, i) =>
              Number(data[0][`s3_self_c${i + 1}_${year}`]) || 0
            ),
            borderWidth: 2,
            fill: false,
            tension: 0.3,
          }))

          setLineData({
            labels: categories,
            datasets,
          })
        }
      }
      fetchCompanyScope3()
    }
  }, [selectedCompany, tab])

  useEffect(() => {
    if (tab === 'category' && selectedCategory) {
      const idx = Number(selectedCategory.split(' ')[1])
      const col = `s3_self_c${idx}_2021`

      const fetchCategoryCompare = async () => {
        const { data } = await supabase
          .from('emissions')
          .select(`name, ${col}`)
          .not(col, 'is', null)

        const filtered = data.filter(row => !isNaN(row[col]))

        setBarData({
          labels: filtered.map(d => d.name),
          datasets: [
            {
              label: `${selectedCategory} (2021年)`,
              data: filtered.map(d => Number(d[col])),
              backgroundColor: 'rgba(59, 130, 246, 0.6)',
            },
          ],
        })
      }

      fetchCategoryCompare()
    }
  }, [selectedCategory, tab])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Scope 3 チャート</h1>

      {/* 탭 버튼 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('company')}
          className={`px-4 py-2 rounded-md text-sm font-medium border ${
            tab === 'company'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-800 border-gray-300'
          }`}
        >
          企業別推移
        </button>
        <button
          onClick={() => setTab('category')}
          className={`px-4 py-2 rounded-md text-sm font-medium border ${
            tab === 'category'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-800 border-gray-300'
          }`}
        >
          カテゴリ別比較
        </button>
      </div>

      {/* 1번: 기업별 추이 */}
      {tab === 'company' && (
        <>
          <div className="mb-4">
            
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="border border-gray-300 rounded-md p-2 text-sm"
            >
              {companies.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {lineData ? (
            <div className="bg-white p-4 rounded-xl shadow ring-1 ring-gray-200">
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom' },
                  },
                }}
              />
            </div>
          ) : (
            <p className="text-gray-500">Loading company chart...</p>
          )}
        </>
      )}

      {/* 3번: 카테고리별 기업 비교 */}
      {tab === 'category' && (
        <>
          <div className="mb-4">
          <div className='text-sm mb-2 text-gray-500'>2021年基準</div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md p-2 text-sm"
            >
              {categories.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {barData ? (
            <div className="bg-white p-4 rounded-xl shadow ring-1 ring-gray-200">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />
            </div>
          ) : (
            <p className="text-gray-500">Loading category chart...</p>
          )}
        </>
      )}
    </div>
  )
}