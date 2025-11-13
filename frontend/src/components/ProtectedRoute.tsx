'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, UserRole } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
	children: React.ReactNode
	allowedRoles?: UserRole[]
	redirectTo?: string
}

export default function ProtectedRoute({
	children,
	allowedRoles,
	redirectTo = '/auth/login',
}: ProtectedRouteProps) {
	const { user, isLoading, isAuthenticated } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!isLoading) {
			if (!isAuthenticated) {
				router.push(redirectTo)
				return
			}

			if (allowedRoles && user && !allowedRoles.includes(user.role)) {
				// Redirect to appropriate page based on role
				switch (user.role) {
					case 'ADMIN':
					case 'HR':
						router.push('/dashboard')
						break
					case 'MANAGER':
						router.push('/manager/approvals')
						break
					case 'EMPLOYEE':
						router.push('/employee/profile')
						break
				}
			}
		}
	}, [isLoading, isAuthenticated, user, allowedRoles, router, redirectTo])

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading...</p>
				</div>
			</div>
		)
	}

	if (!isAuthenticated) {
		return null
	}

	if (allowedRoles && user && !allowedRoles.includes(user.role)) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-red-600 mb-2">
						Access Denied
					</h2>
					<p className="text-gray-600">
						You don't have permission to access this page.
					</p>
					<p className="text-sm text-gray-500 mt-2">
						Required role: {allowedRoles.join(', ')}
					</p>
				</div>
			</div>
		)
	}

	return <>{children}</>
}
