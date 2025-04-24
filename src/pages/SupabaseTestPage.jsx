import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

export default function SupabaseTestPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data, error } = await supabase
        .from("emissions") // ← 여기에 본인 테이블 이름 입력
        .select("*")
        .limit(5) // 테스트용으로 5개만 불러옴

      if (error) {
        setError(error.message)
        setData([])
      } else {
        setData(data)
        setError(null)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Supabase 연결 테스트</h1>

      {loading && <p className="text-gray-500">불러오는 중...</p>}
      {error && <p className="text-red-500">에러: {error}</p>}

      {!loading && !error && (
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              {data.length > 0 &&
                Object.keys(data[0]).map((key) => (
                  <th key={key} className="p-2 border">
                    {key}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((value, i) => (
                  <td key={i} className="p-2 border">
                    {String(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}