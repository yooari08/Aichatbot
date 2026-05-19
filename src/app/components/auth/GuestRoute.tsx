import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/app/contexts/AuthContext'

type Props = {
  children: React.ReactNode
}

export function GuestRoute({ children }: Props) {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F5F6FA]">
        <p className="text-[13px] text-muted-foreground">로딩 중…</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to={from} replace />
  }

  return children
}
