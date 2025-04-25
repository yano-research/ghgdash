import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
  } from 'chart.js'
  import { Line } from 'react-chartjs-2'
  


export default function CompanyDetailPage() {
  const { name } = useParams()
  const [company, setCompany] = useState(null)
  const [selectedYear, setSelectedYear] = useState('2019')
  const [dataSource, setDataSource] = useState('gov') // 'gov' 또는 'self'
  const decodedName = decodeURIComponent(name)


  useEffect(() => {
    const fetchCompany = async () => {
        const { data, error } = await supabase
        .from('emissions')
        .select('*')
        .eq('name', decodedName)
        .not('gov_3yrs_avg', 'is', null) // gov_3yrs_avg가 null이 아닌 데이터만
        .limit(1)
        .maybeSingle()

      if (error) console.error(error)
      else setCompany(data)
    }

    fetchCompany()
  }, [name])

  useEffect(() => {
    setSelectedYear(dataSource === 'gov' ? '2019' : '2021')
  }, [dataSource])

  const yearOptions = dataSource === 'gov'
    ? ['2019', '2020', '2021']
    : ['2021', '2022', '2023']

    const getValue = (scope) => {
  if (!company) return '情報なし'

  if (dataSource === 'gov') {
    const key = `${scope}_gov_${selectedYear}`
    const value = company[key]
    if (value === null || value === undefined) return '情報なし'

    const parsed = parseFloat(value)
    if (isNaN(parsed)) return value

    return Math.round(parsed).toLocaleString()
  }

  

  // self 데이터 처리 (Scope 1~3)
  const key = scope === 's3'
    ? `s3_self_${selectedYear}`
    : `${scope}_self_${selectedYear}`

  const value = company[key]
  if (value === null || value === undefined) return '情報なし'

  const parsed = parseFloat(value)
  if (isNaN(parsed)) return value

  return Math.round(parsed).toLocaleString()
}

        // Chart.js 컴포넌트 등록
  ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

  const getS3ChartData = () => {
    const years = ['2021', '2022', '2023']
    const values = years.map((y) => {
      const key = `s3_self_${y}`
      const val = parseFloat(company?.[key])
      return isNaN(val) ? null : val
    })
  
    return {
      labels: years,
      datasets: [
        {
          label: 'Scope 3 排出量 (千t-CO₂)',
          data: values,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#3B82F6',
        },
      ],
    }
  }

  if (!company) {
    return <div className="p-6 text-gray-500">Loading company data...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{company.name}</h1>
      <p className="text-gray-600 mb-6">{company.prefecture || '도시 情報なし'}</p>

      {/* 기업 요약 카드 */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">企業情報</h2>
        <p className="text-sm text-gray-700 mb-1">
          業種: <span className="text-gray-900 font-medium">{company.industry} / {company.industry2} / {company.industry3}</span>
        </p>
        <p className="text-sm text-gray-700 mb-1">
          地域: <span className="text-gray-900 font-medium">{company.city || '情報なし'}</span>
        </p>
        <p className="text-sm text-gray-700 mb-1">
  上場区分:{' '}
  <span className="text-gray-900 font-medium">
    {company.plc === true ? '◯' : company.plc === false ? '×' : '情報なし'}
  </span>
</p>
        <p className="text-sm text-gray-700 mb-1">
        時価総額: <span className="text-gray-900 font-medium">
        {company.market_capitalization !== null && company.market_capitalization !== undefined
            ? `${company.market_capitalization}億円`
            : '情報なし'}
        </span>

        </p>
        <p className="text-sm text-gray-700">
  算定範囲:{' '}
  <span className="text-gray-900 font-medium">
    {company.s2_self_area_2021 || '情報なし'}
  </span>
</p>

      </div>

      {/* GHG 목표 카드 */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold mb-2">GHG 削減目標</h2>
        <p className="text-gray-700">{company.goal || '情報なし'}</p>
      </div>

      {/* 하단 카드 2개 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 좌측: 연도별 S1/S2(+S3) + 기준 탭 */}
        <div className="bg-white p-4 rounded-xl shadow ring-1 ring-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-gray-800">GHG 排出量</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDataSource('gov')
                  setSelectedYear('2019')
                }}
                className={`px-3 py-1 text-sm rounded-md border ${
                  dataSource === 'gov'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                温対法データ
              </button>
              <button
                onClick={() => {
                  setDataSource('self')
                  setSelectedYear('2019')
                }}
                className={`px-3 py-1 text-sm rounded-md border ${
                  dataSource === 'self'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                自己申告データ
              </button>
            </div>
          </div>

          {/* 연도 선택 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {yearOptions.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1 text-sm rounded-md border ${
                  selectedYear === year
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          {/* 값 표시 */}
          <table className="min-w-full text-sm border border-gray-200 divide-y mb-2">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-4 py-2 text-left text-gray-600 font-medium">Scope</th>
      <th className="px-4 py-2 text-left text-gray-600 font-medium">排出量 (千t-CO₂)</th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-100 text-gray-900">
    {/* Scope 1 */}
    <tr>
      <td className="px-4 py-2">Scope 1</td>
      <td className="px-4 py-2">{getValue('s1')}</td>
    </tr>

    {/* Scope 2 (self 탭만 조건 분기) */}
    {dataSource === 'gov' ? (
      <tr>
        <td className="px-4 py-2">Scope 2</td>
        <td className="px-4 py-2">{getValue('s2')}</td>
      </tr>
    ) : (
      <>
        {company[`s2_self_location_${selectedYear}`] != null && (
          <tr>
            <td className="px-4 py-2">Scope 2 (location)</td>
            <td className="px-4 py-2">
              {parseFloat(company[`s2_self_location_${selectedYear}`]).toLocaleString()}
            </td>
          </tr>
        )}
        {company[`s2_self_market_${selectedYear}`] != null && (
          <tr>
            <td className="px-4 py-2">Scope 2 (market)</td>
            <td className="px-4 py-2">
              {parseFloat(company[`s2_self_market_${selectedYear}`]).toLocaleString()}
            </td>
          </tr>
        )}
      </>
    )}

    {/* Scope 3 (self 탭일 때만 표시) */}
    {dataSource === 'self' && (
      <tr>
        <td className="px-4 py-2">Scope 3</td>
        <td className="px-4 py-2">{getValue('s3')}</td>
      </tr>
    )}
  </tbody>
</table>

          
          {dataSource === 'self' && (
  <>
    {/* {(() => {
      const locKey = `s2_self_location_${selectedYear}`
      const marKey = `s2_self_market_${selectedYear}`
      const locRaw = company[locKey]
      const marRaw = company[marKey]
      const locVal = parseFloat(locRaw)
      const marVal = parseFloat(marRaw)

      return (
        <>
          {!isNaN(locVal) && (
            <p className="text-sm text-gray-700 mb-1">
              Scope 2 (location): <span className="font-medium text-gray-900">{Math.round(locVal).toLocaleString()}</span> 千t-CO₂
            </p>
          )}
          {!isNaN(marVal) && (
            <p className="text-sm text-gray-700 mb-1">
              Scope 2 (market): <span className="font-medium text-gray-900">{Math.round(marVal).toLocaleString()}</span> 千t-CO₂
            </p>
          )}
          {isNaN(locVal) && isNaN(marVal) && (
            <p className="text-sm text-gray-700 mb-1">
              Scope 2: <span className="font-medium text-gray-900">情報なし</span>
            </p>
          )}
        </>
      )
    })()} */}


  </>
)}
        </div>

        {/* 우측: 그래프 placeholder */}
        <div className="bg-white p-4 rounded-xl shadow ring-1 ring-gray-200">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Scope 3 排出量 推移</h3>
            <Line data={getS3ChartData()} />
        </div>
      </div>
    </div>
  )
}