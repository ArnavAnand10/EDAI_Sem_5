'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { API_BASE } from '@/lib/api'

export default function TopNav() {
	const router = useRouter()
	const path = usePathname()
	const [user, setUser] = useState<any>(null)
	useEffect(() => {
		const token =
			localStorage.getItem('auth_token') ||
			sessionStorage.getItem('auth_token')
		if (!token) return
		fetch(`${API_BASE}/users/me`, {
			headers: { Authorization: `Bearer ${token}` },
			cache: 'no-store',
		})
			.then((r) => (r.ok ? r.json() : null))
			.then(setUser)
			.catch(() => {})
	}, [path])
	function logout() {
		localStorage.removeItem('auth_token')
		sessionStorage.removeItem('auth_token')
		document.cookie = 'auth_token=; Max-Age=0; path=/'
		router.replace('/auth/login')
	}
	return (
		<div className="w-full border-b bg-white">
			<div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link
						className="font-semibold"
						href={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
					>
						SkillHub
					</Link>
					{user?.role === 'ADMIN' && (
						<>
							<Link href="/admin/employees">Employees</Link>
							<Link href="/companies">Companies</Link>
							<Link href="/skills">Skills</Link>
							<Link href="/admin/skill-requests">Requests</Link>
						</>
					)}
					{user?.role === 'EMPLOYEE' && (
						<>
							<Link href="/skills">Skills</Link>
							<Link href="/skills/request">Request Skill</Link>
						</>
					)}
				</div>
				<div className="flex items-center gap-3">
					{user && (
						<span className="text-sm text-gray-600">
							{user.email}
						</span>
					)}
					{user ? (
						<button
							onClick={logout}
							className="text-sm text-blue-600"
						>
							Logout
						</button>
					) : (
						<Link
							className="text-sm text-blue-600"
							href="/auth/login"
						>
							Login
						</Link>
					)}
				</div>
			</div>
		</div>
	)
}
