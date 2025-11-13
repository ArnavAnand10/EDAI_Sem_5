'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Award, LogOut, User, Shield, BriefcaseIcon, Users } from 'lucide-react'
import { Button } from './ui/button'

export default function Navigation() {
	const { user, logout } = useAuth()
	const pathname = usePathname()

	if (!user) return null

	const isActive = (path: string) => pathname?.startsWith(path)

	const roleLinks = {
		EMPLOYEE: [
			{ href: '/employee', label: 'Profile', icon: User },
			{ href: '/employee/rate-skills', label: 'Rate Skills', icon: Award },
			{ href: '/employee/my-ratings', label: 'My Ratings', icon: Award },
		],
		MANAGER: [
			{ href: '/manager', label: 'Dashboard', icon: BriefcaseIcon },
			{ href: '/manager/approvals', label: 'Approvals', icon: Award },
			{ href: '/manager/projects', label: 'Projects', icon: BriefcaseIcon },
			{ href: '/manager/team', label: 'Team', icon: Users },
		],
		HR: [
			{ href: '/hr', label: 'Dashboard', icon: BriefcaseIcon },
			{ href: '/hr/skills', label: 'Skills', icon: Award },
			{ href: '/hr/projects', label: 'Projects', icon: BriefcaseIcon },
			{ href: '/hr/projects/create', label: 'Create Project', icon: BriefcaseIcon },
		],
		ADMIN: [
			{ href: '/admin', label: 'Dashboard', icon: Shield },
			{ href: '/admin/users', label: 'Users', icon: Users },
			{ href: '/admin/roles', label: 'Roles', icon: Shield },
		],
	}

	const links = roleLinks[user.role as keyof typeof roleLinks] || []

	return (
		<nav className="bg-white border-b">
			<div className="container mx-auto px-4">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link
						href="/"
						className="flex items-center space-x-2 font-bold text-lg"
					>
						<Award className="w-6 h-6 text-blue-600" />
						<span>Skill Rating System</span>
					</Link>

					{/* Navigation Links */}
					<div className="flex items-center space-x-1">
						{links.map((link) => {
							const Icon = link.icon
							const active = isActive(link.href)
							return (
								<Link key={link.href} href={link.href}>
									<Button
										variant={active ? 'default' : 'ghost'}
										size="sm"
										className="flex items-center gap-2"
									>
										<Icon className="w-4 h-4" />
										{link.label}
									</Button>
								</Link>
							)
						})}

						{/* User Info & Logout */}
						<div className="ml-4 pl-4 border-l flex items-center space-x-3">
							<div className="text-sm">
								<p className="font-medium">{user.email}</p>
								<p className="text-xs text-gray-500">
									{user.role}
								</p>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={logout}
								className="text-red-600 hover:text-red-700 hover:bg-red-50"
							>
								<LogOut className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</nav>
	)
}
