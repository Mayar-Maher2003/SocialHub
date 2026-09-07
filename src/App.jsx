import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { routes } from './Routing/AppRouting'
import AuthProvider from './context/AuthContext'
import UserProvider from './context/UserContext'
import { QueryClient , QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from './context/ToastContext'
import { SettingsProvider } from './context/SettingsContext'

export default function App() {

  const queryClient = new QueryClient()
  return (
    <>
    <SettingsProvider>
    <AuthProvider>
    <UserProvider>
    <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <RouterProvider router ={routes}/>
    </ToastProvider>

    </QueryClientProvider>

    </UserProvider>
    </AuthProvider>
    </SettingsProvider>
    </>
  )
}
