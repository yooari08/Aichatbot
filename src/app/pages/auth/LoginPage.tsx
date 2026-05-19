import { useState } from 'react'
import { Building2, Shield } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { BotBadge } from '@/app/components/atoms/BotBadge'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { DEV_TEST_ACCOUNTS, isDevLoginEnabled } from '@/app/constants/devAuth'
import { useAuth } from '@/app/contexts/AuthContext'
import { ApiError } from '@/app/lib/api/errors'
import { cn } from '@/app/lib/utils'

const ALLOW_REGISTRATION = import.meta.env.VITE_ALLOW_REGISTRATION === 'true'

function formatLoginError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.message
  }
  if (err instanceof TypeError && err.message.includes('fetch')) {
    return 'API 서버에 연결할 수 없습니다. 백엔드(포트 8080)가 실행 중인지 확인해 주세요.'
  }
  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

export default function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showManualLogin, setShowManualLogin] = useState(false)

  const runLogin = async (credentials: { email: string; password: string }) => {
    setError(null)
    setIsSubmitting(true)
    try {
      if (mode === 'register') {
        await register(credentials)
      } else {
        await login(credentials)
      }
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(formatLoginError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmployeeAuth = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('사내 이메일과 비밀번호를 입력한 뒤 사원 인증을 진행해 주세요.')
      return
    }
    await runLogin({ email: trimmedEmail, password })
  }

  const handleDevLogin = async (account: keyof typeof DEV_TEST_ACCOUNTS) => {
    const { email: devEmail, password: devPassword } = DEV_TEST_ACCOUNTS[account]
    setEmail(devEmail)
    setPassword(devPassword)
    setMode('login')
    await runLogin({ email: devEmail, password: devPassword })
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-[#F5F6FA] px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center justify-center gap-2 mb-8">
          <BotBadge />
          <span className="text-[17px] font-bold text-[#0A0A0A]">사내 AI 챗봇</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm p-8">
          <h1 className="text-[18px] font-bold text-[#0A0A0A] mb-1">로그인</h1>
          <p className="text-[13px] text-muted-foreground mb-6">
            사원 인증 후 사내 문서 Q&A 챗봇을 이용할 수 있습니다.
          </p>

          <form onSubmit={handleEmployeeAuth} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-[13px]">
                사내 이메일
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-[13px]">
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
              />
            </div>

            {error && (
              <p className="text-[12px] text-[#dc2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] h-11"
              disabled={isSubmitting}
            >
              <Building2 className="size-4" />
              {isSubmitting ? '인증 중…' : '사원 인증'}
            </Button>
          </form>

          {isDevLoginEnabled && (
            <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#878B95] mb-3">
                개발용 테스트 로그인
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2 h-10 border-[#E5E5E5]"
                  disabled={isSubmitting}
                  onClick={() => void handleDevLogin('user')}
                >
                  <Building2 className="size-4 text-[#2563EB]" />
                  {DEV_TEST_ACCOUNTS.user.label} ({DEV_TEST_ACCOUNTS.user.email})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start gap-2 h-10 border-[#E5E5E5]',
                    'hover:border-[#dc2626]/40 hover:bg-[#FEF2F2]'
                  )}
                  disabled={isSubmitting}
                  onClick={() => void handleDevLogin('admin')}
                >
                  <Shield className="size-4 text-[#dc2626]" />
                  {DEV_TEST_ACCOUNTS.admin.label} ({DEV_TEST_ACCOUNTS.admin.email})
                </Button>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
                비밀번호: 일반 <code className="text-[10px]">TestUser123!</code> · 관리자{' '}
                <code className="text-[10px]">TestAdmin123!</code>
                <br />
                API 서버 실행: <code className="text-[10px]">uvicorn app.main:app --reload --port 8080</code>
              </p>
            </div>
          )}

          {(ALLOW_REGISTRATION || isDevLoginEnabled) && (
            <div className="mt-4">
              <button
                type="button"
                className="text-[12px] text-[#2563EB] hover:underline"
                onClick={() => setShowManualLogin((v) => !v)}
              >
                {showManualLogin ? '추가 옵션 숨기기' : '이메일 직접 가입 / 로그인 옵션'}
              </button>
            </div>
          )}

          {showManualLogin && ALLOW_REGISTRATION && (
            <div className="mt-4 pt-4 border-t border-dashed border-[#E5E5E5]">
              <p className="text-[12px] text-muted-foreground mb-3">
                {mode === 'login' ? '신규 계정 등록' : '이미 계정이 있으신가요?'}
              </p>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={isSubmitting}
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login')
                  setError(null)
                }}
              >
                {mode === 'login' ? '회원가입으로 전환' : '로그인으로 전환'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
