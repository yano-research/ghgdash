import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function CompanyDetailPage() {
  const { name } = useParams()
  const [company, setCompany] = useState(null)
  const [selectedYear, setSelectedYear] = useState('2019')
  const [dataSource, setDataSource] = useState('gov') // 'gov' 또는 'self'

  useEffect(() => {
    const fetchCompany = async () => {
      const { data, error } = await supabase
        .from('emissions')
        .select('*')
        .eq('name', name)
        .limit(1)
        .maybeSingle()

      if (error) console.error(error)
      else setCompany(data)
    }

    fetchCompany()
  }, [name])

  const yearOptions = dataSource === 'gov'
    ? ['2019', '2020', '2021']
    : ['2019', '2020', '2021', '2022', '2023', '2024', '2025']

    const getValue = (scope) => {
        if (!company) return '정보 없음'
        const key = `${scope}_${dataSource}_${selectedYear}`
        if (key.endsWith('_3yrs_avg')) return '정보 없음'
      
        const value = company[key]
        if (value === null || value === undefined) return '정보 없음'
      
        const parsed = parseFloat(value)
        if (isNaN(parsed)) return value
      
        return Math.round(parsed).toLocaleString() // 또는 Math.floor(parsed) 도 가능
      }

  if (!company) {
    return <div className="p-6 text-gray-500">Loading company data...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{company.name}</h1>
      <p className="text-gray-600 mb-6">{company.prefecture || '도시 정보 없음'}</p>

      {/* 기업 요약 카드 */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">기업 정보</h2>
        <p className="text-sm text-gray-700 mb-1">
          업종: <span className="text-gray-900 font-medium">{company.industry} / {company.industry2} / {company.industry3}</span>
        </p>
        <p className="text-sm text-gray-700 mb-1">
          지역: <span className="text-gray-900 font-medium">{company.city || '정보 없음'}</span>
        </p>
        <p className="text-sm text-gray-700 mb-1">
          상장 여부: <span className="text-gray-900 font-medium">{company.PLC || '정보 없음'}</span>
        </p>
        <p className="text-sm text-gray-700 mb-1">
          시가총액: <span className="text-gray-900 font-medium">{company.market_capitalization || '정보 없음'}억엔</span>
        </p>
        <p className="text-sm text-gray-700">
          산정 범위: <span className="text-gray-900 font-medium">Scope {company.scope || '정보 없음'}</span>
        </p>
      </div>

      {/* GHG 목표 카드 */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold mb-2">GHG 배출 목표</h2>
        <p className="text-gray-700">{company.goal || '정보 없음'}</p>
      </div>

      {/* 하단 카드 2개 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 좌측: 연도별 S1/S2(+S3) + 기준 탭 */}
        <div className="bg-white p-4 rounded-xl shadow ring-1 ring-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-gray-800">GHG 배출량</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDataSource('gov')
                  setSelectedYear('2019')
                }}
                className={`px-3 py-1 text-sm rounded-md border ${
                  dataSource === 'gov'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                gov
              </button>
              <button
                onClick={() => {
                  setDataSource('self')
                  setSelectedYear('2019')
                }}
                className={`px-3 py-1 text-sm rounded-md border ${
                  dataSource === 'self'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                self
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
          <p className="text-sm text-gray-700 mb-1">
            Scope 1: <span className="font-medium text-gray-900">{getValue('s1')}</span> 千t-CO₂
          </p>
          <p className="text-sm text-gray-700 mb-1">
            Scope 2: <span className="font-medium text-gray-900">{getValue('s2')}</span> 千t-CO₂
          </p>
          {dataSource === 'self' && (
            <p className="text-sm text-gray-700">
              Scope 3: <span className="font-medium text-gray-900">{getValue('s3')}</span> 千t-CO₂
            </p>
          )}
        </div>

        {/* 우측: 그래프 placeholder */}
        <div className="bg-white p-4 rounded-xl shadow ring-1 ring-gray-200 h-64 flex items-center justify-center">
          <span className="text-gray-400">[그래프 영역 - 추후 구현]</span>
        </div>
      </div>
    </div>
  )
}