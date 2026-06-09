const TOKEN_KEY = 'ai_chatbot_access_token'

export const getStoredToken = (): string | null => localStorage.getItem(TOKEN_KEY)

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const clearStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}
