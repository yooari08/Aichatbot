/** 개발 기간 전용 — 백엔드 SEED_DEV_TEST_USERS 와 동일하게 유지 */
export const DEV_TEST_ACCOUNTS = {
  user: {
    label: '일반 사용자',
    email: 'user@test.company.com',
    password: 'TestUser123!',
  },
  admin: {
    label: '관리자',
    email: 'admin@test.company.com',
    password: 'TestAdmin123!',
  },
} as const

export const isDevLoginEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_LOGIN === 'true'
