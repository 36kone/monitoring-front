import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) { const { user, isLoading, isAdmin } = useAuth(); const location = useLocation(); if (isLoading) return <div className="route-loading">Loading your workspace...</div>; if (!user) return <Navigate to="/login" replace state={{ from: location }} />; if (adminOnly && !isAdmin) return <Navigate to="/" replace />; return <Outlet /> }
