'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { apiGet } from '@/lib/api'
import { Trophy, User, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TopNav() {
	const router = useRouter()
	const path = usePathname()
	const [user, setUser] = useState<any>(null)
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	useEffect(() => {
		const token =
			localStorage.getItem('auth_token') ||
			sessionStorage.getItem('auth_token')
		if (!token) return
		apiGet('/users/me')
			.then(setUser)
			.catch(() => {})
	}, [path])

	function logout() {
		localStorage.removeItem('auth_token')
		localStorage.removeItem('user')
		sessionStorage.removeItem('auth_token')
		document.cookie = 'auth_token=; Max-Age=0; path=/'
		router.replace('/auth/login')
	}

	const isActive = (href: string) => path === href

	return (
		<nav className="w-full border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<div className="flex items-center space-x-2">
						<Link
							href={
								user?.role === 'ADMIN' ? '/admin' : '/dashboard'
							}
							className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
						>
							<div className="p-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
								<Trophy className="h-5 w-5 text-white" />
							</div>
							<span className="text-xl font-bold text-gray-900">
								SkillHub
							</span>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-8">
						{user?.role === 'ADMIN' && (
							<>
								<Link
									href="/admin"
									className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
										isActive('/admin')
											? 'text-indigo-600'
											: 'text-gray-700'
									}`}
								>
									Dashboard
								</Link>
								<Link
									href="/admin/employees"
									className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
										isActive('/admin/employees')
											? 'text-indigo-600'
											: 'text-gray-700'
									}`}
								>
									Employees
								</Link>
								<Link
									href="/companies"
									className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
										isActive('/companies')
											? 'text-indigo-600'
											: 'text-gray-700'
									}`}
								>
									Companies
								</Link>
								<Link
									href="/skills"
									className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
										isActive('/skills')
											? 'text-indigo-600'
											: 'text-gray-700'
									}`}
								>
									Skills
								</Link>
								<Link
									href="/admin/skill-request"
									className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
										isActive('/admin/skill-request')
											? 'text-indigo-600'
											: 'text-gray-700'
									}`}
								>
									Requests
								</Link>
							</>
						)}
						{user?.role === 'EMPLOYEE' && (
							<>
								<Link
									href="/dashboard"
									className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
										isActive('/dashboard')
											? 'text-indigo-600'
											: 'text-gray-700'
									}`}
								>
									Dashboard
								</Link>
								<Link
									href="/skills"
									className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
										isActive('/skills')
											? 'text-indigo-600'
											: 'text-gray-700'
									}`}
								>
									Browse Skills
								</Link>
								<Link
									href="/skills/request"
									className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
										isActive('/skills/request')
											? 'text-indigo-600'
											: 'text-gray-700'
									}`}
								>
									Request Skill
								</Link>
							</>
						)}
					</div>

					{/* User Menu */}
					<div className="hidden md:flex items-center space-x-4">
						{user ? (
							<div className="flex items-center space-x-4">
								<div className="flex items-center space-x-2">
									<div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full">
										<User className="h-4 w-4 text-gray-600" />
										<span className="text-sm font-medium text-gray-700">
											{user.email.split('@')[0]}
										</span>
										<Badge
											variant="secondary"
											className="text-xs"
										>
											{user.role}
										</Badge>
									</div>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={logout}
									className="text-gray-600 hover:text-gray-900"
								>
									<LogOut className="h-4 w-4 mr-2" />
									Logout
								</Button>
							</div>
						) : (
							<div className="flex items-center space-x-2">
								<Link href="/auth/login">
									<Button variant="ghost" size="sm">
										Login
									</Button>
								</Link>
								<Link href="/auth/register">
									<Button size="sm">Sign Up</Button>
								</Link>
							</div>
						)}
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							{mobileMenuOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</Button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{mobileMenuOpen && (
					<div className="md:hidden border-t bg-white">
						<div className="px-2 pt-2 pb-3 space-y-1">
							{user?.role === 'ADMIN' && (
								<>
									<Link
										href="/admin"
										className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
									>
										Dashboard
									</Link>
									<Link
										href="/admin/employees"
										className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
									>
										Employees
									</Link>
									<Link
										href="/companies"
										className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
									>
										Companies
									</Link>
									<Link
										href="/skills"
										className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
									>
										Skills
									</Link>
									<Link
										href="/admin/skill-request"
										className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
									>
										Requests
									</Link>
								</>
							)}
							{user?.role === 'EMPLOYEE' && (
								<>
									<Link
										href="/dashboard"
										className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
									>
										Dashboard
									</Link>
									<Link
										href="/skills"
										className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
									>
										Browse Skills
									</Link>
									<Link
										href="/skills/request"
										className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
									>
										Request Skill
									</Link>
								</>
							)}

							{user && (
								<div className="border-t pt-4 mt-4">
									<div className="px-3 py-2">
										<div className="flex items-center space-x-2 mb-3">
											<User className="h-4 w-4 text-gray-600" />
											<span className="text-sm font-medium text-gray-700">
												{user.email}
											</span>
											<Badge
												variant="secondary"
												className="text-xs"
											>
												{user.role}
											</Badge>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={logout}
											className="w-full justify-start text-gray-600 hover:text-gray-900"
										>
											<LogOut className="h-4 w-4 mr-2" />
											Logout
										</Button>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</nav>
	)
}
