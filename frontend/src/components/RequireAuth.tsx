'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet } from '@/lib/api'

export default function RequireAuth({
	children,
	role,
}: {
	children: React.ReactNode
	role?: 'ADMIN' | 'EMPLOYEE'
}) {
	const router = useRouter()
	const [ok, setOk] = useState(false)
	useEffect(() => {
		const token =
			localStorage.getItem('auth_token') ||
			sessionStorage.getItem('auth_token')
		if (!token) {
			router.replace('/auth/login')
			return
		}
		apiGet('/users/me')
			.then((u) => {
				if (role && u.role !== role) throw new Error('role')
				setOk(true)
			})
			.catch(() => router.replace('/auth/login'))
	}, [router, role])
	if (!ok) return null
	return <>{children}</>
}
