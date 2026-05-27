import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import * as adminApi from '@/app/lib/api/admin'
import type { AdminHealthResponse } from '@/app/lib/api/admin'

const labelMap: Record<string, string> = {
  api: 'API',
  postgres: 'PostgreSQL',
  chroma: 'ChromaDB',
  bedrock: 'Bedrock',
}

export function SettingsView() {
  const [health, setHealth] = useState<AdminHealthResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchHealth = async () => {
    setLoading(true)
    try {
      setHealth(await adminApi.getAdminHealth())
    } catch {
      toast.error('시스템 상태를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchHealth()
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-foreground">시스템 상태</h2>
        <Button size="sm" variant="outline" onClick={() => void fetchHealth()} disabled={loading}>
          <RefreshCw className={`size-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-[13px] font-bold">
            전체 상태: {health?.status ?? (loading ? '확인 중...' : '알 수 없음')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {Object.entries(health?.checks ?? {}).map(([key, value]) => (
            <div key={key} className="rounded border border-[#E5E7EB] bg-white px-3 py-2">
              <p className="text-[11px] text-muted-foreground">{labelMap[key] ?? key}</p>
              <p className="text-[12px] font-medium text-foreground">{value}</p>
            </div>
          ))}
          <div className="rounded border border-[#E5E7EB] bg-white px-3 py-2 col-span-2">
            <p className="text-[11px] text-muted-foreground">Bedrock 모드</p>
            <p className="text-[12px] font-medium text-foreground">
              {health?.bedrock_mock_enabled ? 'Mock' : 'Real'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
