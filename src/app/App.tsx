import { RouterProvider } from 'react-router'
import { Toaster } from '@/app/components/ui/sonner'
import { AuthProvider } from '@/app/contexts/AuthContext'
import { router } from './routes'

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </AuthProvider>
  )
}
