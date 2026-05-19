import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/app/contexts/AuthContext'
import type { UserRole } from '@/app/types/auth'

type Props = {
  children: React.ReactNode
  requiredRole?: UserRole
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <p className="text-[13px] text-muted-foreground">세션 확인 중…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}
