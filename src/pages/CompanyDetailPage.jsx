import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function CompanyDetailPage() {
  const { name } = useParams()
  const [company, setCompany] = useState(null)

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

  if (!company) {
    return <div className="p-6 text-gray-500">Loading company data...</div>
  }

  return (
    <div className="p-6">
      {/* 기업명 */}
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

      {/* 목표 카드 */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">GHG 배출 목표</h2>
        <p className="text-sm text-gray-700">{company.goal || '정보 없음'}</p>
      </div>

      {/* 하단 카드 2개 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-4 rounded-xl shadow ring-1 ring-gray-200">
          <h3 className="text-sm font-medium text-gray-500">사업장 위치</h3>
          <p className="mt-1 text-lg font-semibold text-gray-900">{company.prefecture || '정보 없음'}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow ring-1 ring-gray-200">
          <h3 className="text-sm font-medium text-gray-500">총 배출량 (tCO₂)</h3>
          <p className="mt-1 text-lg font-semibold text-gray-900">{company.total_emission || '정보 없음'}</p>
        </div>
      </div>
    </div>
  )
}