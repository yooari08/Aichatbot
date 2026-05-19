import { createBrowserRouter } from 'react-router'
import { GuestRoute } from '@/app/components/auth/GuestRoute'
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute'
import Layout from '@/app/layouts/MainLayout'
import AdminPage from '@/app/pages/admin/AdminPage'
import LoginPage from '@/app/pages/auth/LoginPage'
import ChatbotPage from '@/app/pages/chat/ChatbotPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <ChatbotPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
])
