// src/pages/Scope3ChartPage.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function Scope3ChartPage() {
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    const fetchScope3 = async () => {
      const cols = Array.from({ length: 15 }, (_, i) => `s3_self_c${i + 1}_2021`)
      const { data, error } = await supabase
        .from('emissions')
        .select(['name', ...cols].join(','))

      if (error) {
        console.error(error)
        return
      }

      const filtered = data.filter(row =>
        cols.some(col => row[col] !== null && !isNaN(row[col]))
      )

      const datasets = filtered.map((row) => ({
        label: row.name,
        data: cols.map(col => Number(row[col]) || 0),
        borderWidth: 2,
        fill: false,
      }))

      setChartData({
        labels: cols.map(c => c.replace('s3_self_c', 'Category ')),
        datasets,
      })
    }

    fetchScope3()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900">2021年 Scope 3 (Category 1~15)</h1>
      {chartData ? (
        <div className="bg-white p-4 rounded-xl shadow ring-1 ring-gray-200">
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' },
              },
            }}
          />
        </div>
      ) : (
        <p className="text-gray-500">Loading chart data...</p>
      )}
    </div>
  )
}