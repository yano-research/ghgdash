import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'

export default function IndustryPage() {
  const [industries, setIndustries] = useState([])
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    const fetchIndustries = async () => {
      const { data, error } = await supabase
        .from('emissions')
        .select('industry')
        .not('industry', 'is', null)

      if (!error && data) {
        const unique = [...new Set(data.map((d) => d.industry))]
        setIndustries(unique.sort())
      }
    }
    fetchIndustries()
  }, [])

  useEffect(() => {
    if (selectedIndustry) {
      const fetchCompanies = async () => {
        const { data, error } = await supabase
          .from('emissions')
          .select('name, industry3, s1_gov_2021, s2_gov_2021')
          .eq('industry', selectedIndustry)
          .not('gov_3yrs_avg', 'is', null) // 본사만
  
        if (!error && data) {
          const mapped = data.map((item) => {
            const s1 = Number(item.s1_gov_2021) || 0
            const s2 = Number(item.s2_gov_2021) || 0
            return {
              ...item,
              total: Math.round(s1 + s2),
            }
          })
          const sorted = mapped.sort((a, b) => b.total - a.total)
          setCompanies(sorted)
        }
      }
      fetchCompanies()
    } else {
      setCompanies([])
    }
  }, [selectedIndustry])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">業種別 企業リスト</h1>

      {/* 업종 선택 */}
      <div className="mb-6">
        <select
          className="w-full max-w-sm border border-gray-300 rounded-md p-2 text-sm"
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
        >
          <option value="">業種を選択してください</option>
          {industries.map((ind, i) => (
            <option key={i} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      {/* 기업 테이블 */}
      {selectedIndustry && (
        <table className="min-w-full text-sm border border-gray-200 divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600">企業名</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">詳細業種</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Scope1+2 (2021)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {companies.map((c, i) => (
              <tr key={i}>
                <td className="px-4 py-2 text-gray-900">
                  <Link to={`/company/${c.name}`} className="text-blue-900 hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-gray-900">{c.industry3 || '-'}</td>
                <td className="px-4 py-2 text-gray-900">{c.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}