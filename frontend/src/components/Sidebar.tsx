import React from 'react'
import { useRouter } from 'next/navigation'
import {
	LayoutDashboard,
	Users,
	Trophy,
	Building2,
	FileText,
	Settings,
	UserCheck,
	Plus,
	TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
	userRole: 'ADMIN' | 'EMPLOYEE'
	currentPath: string
	isOpen: boolean
	onClose: () => void
}

export default function Sidebar({
	userRole,
	currentPath,
	isOpen,
	onClose,
}: SidebarProps) {
	const router = useRouter()

	const adminMenuItems = [
		{
			icon: LayoutDashboard,
			label: 'Dashboard',
			href: '/dashboard',
			color: 'text-blue-600',
		},
		{
			icon: Users,
			label: 'Employees',
			href: '/employees',
			color: 'text-green-600',
		},
		{
			icon: Trophy,
			label: 'Skills Management',
			href: '/skills',
			color: 'text-yellow-600',
		},
		{
			icon: Building2,
			label: 'Companies',
			href: '/companies',
			color: 'text-purple-600',
		},
		{
			icon: FileText,
			label: 'Skill Requests',
			href: '/skill-requests',
			color: 'text-red-600',
		},
		{
			icon: TrendingUp,
			label: 'Analytics',
			href: '/analytics',
			color: 'text-indigo-600',
		},
		{
			icon: Settings,
			label: 'Settings',
			href: '/settings',
			color: 'text-gray-600',
		},
	]

	const employeeMenuItems = [
		{
			icon: LayoutDashboard,
			label: 'Dashboard',
			href: '/dashboard',
			color: 'text-blue-600',
		},
		{
			icon: Trophy,
			label: 'My Skills',
			href: '/my-skills',
			color: 'text-yellow-600',
		},
		{
			icon: Plus,
			label: 'Request Skills',
			href: '/request-skills',
			color: 'text-green-600',
		},
		{
			icon: UserCheck,
			label: 'Profile',
			href: '/profile',
			color: 'text-purple-600',
		},
		{
			icon: Settings,
			label: 'Settings',
			href: '/settings',
			color: 'text-gray-600',
		},
	]

	const menuItems = userRole === 'ADMIN' ? adminMenuItems : employeeMenuItems

	const handleNavigation = (href: string) => {
		router.push(href)
		onClose()
	}

	return (
		<>
			<div
				className={cn(
					'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
					isOpen ? 'translate-x-0' : '-translate-x-full'
				)}
			>
				<div className="flex flex-col h-full">
					<div className="flex items-center justify-center h-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
								<Trophy className="w-5 h-5 text-blue-600" />
							</div>
							<span className="text-xl font-bold text-white">
								SkillHub
							</span>
						</div>
					</div>

					<nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
						{menuItems.map((item) => {
							const isActive = currentPath === item.href
							return (
								<button
									key={item.href}
									onClick={() => handleNavigation(item.href)}
									className={cn(
										'flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
										isActive
											? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
											: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
									)}
								>
									<item.icon
										className={cn(
											'w-5 h-5 mr-3',
											isActive
												? 'text-blue-600'
												: item.color
										)}
									/>
									{item.label}
									{isActive && (
										<div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
									)}
								</button>
							)
						})}
					</nav>

					<div className="p-4 border-t border-gray-200">
						<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
							<h3 className="text-sm font-semibold text-gray-900 mb-2">
								{userRole === 'ADMIN'
									? 'Admin Tools'
									: 'Quick Actions'}
							</h3>
							<p className="text-xs text-gray-600 mb-3">
								{userRole === 'ADMIN'
									? 'Manage your organization efficiently'
									: 'Enhance your skill portfolio'}
							</p>
							<button className="w-full px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-md hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
								{userRole === 'ADMIN'
									? 'Add Employee'
									: 'Request Skill'}
							</button>
						</div>
					</div>
				</div>
			</div>

			{isOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
					onClick={onClose}
				/>
			)}
		</>
	)
}
