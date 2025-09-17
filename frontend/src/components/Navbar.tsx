import React, { useState } from 'react'
import { Bell, Search, User, ChevronDown, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NavbarProps {
	user: {
		name: string
		email: string
		role: 'ADMIN' | 'EMPLOYEE'
		avatar?: string
	}
	onLogout: () => void
	onMenuToggle: () => void
	isMobileMenuOpen: boolean
}

export default function Navbar({
	user,
	onLogout,
	onMenuToggle,
	isMobileMenuOpen,
}: NavbarProps) {
	const [showUserMenu, setShowUserMenu] = useState(false)
	const [showNotifications, setShowNotifications] = useState(false)

	const notifications = [
		{
			id: 1,
			message: 'New skill request from John Doe',
			time: '2 min ago',
			unread: true,
		},
		{
			id: 2,
			message: 'Skill approved: React Development',
			time: '1 hour ago',
			unread: false,
		},
		{
			id: 3,
			message: 'Company profile updated',
			time: '3 hours ago',
			unread: false,
		},
	]

	return (
		<nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex items-center">
						<Button
							variant="ghost"
							size="sm"
							className="lg:hidden mr-2"
							onClick={onMenuToggle}
						>
							{isMobileMenuOpen ? (
								<X size={20} />
							) : (
								<Menu size={20} />
							)}
						</Button>

						<div className="flex-shrink-0 flex items-center">
							<div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-sm">
									HR
								</span>
							</div>
							<span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
								SkillHub
							</span>
						</div>
					</div>

					<div className="hidden md:flex items-center flex-1 max-w-md mx-8">
						<div className="relative w-full">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Search className="h-4 w-4 text-gray-400" />
							</div>
							<Input
								className="pl-10 pr-4"
								placeholder="Search employees, skills..."
								type="search"
							/>
						</div>
					</div>

					<div className="flex items-center space-x-4">
						<div className="relative">
							<Button
								variant="ghost"
								size="sm"
								className="relative"
								onClick={() =>
									setShowNotifications(!showNotifications)
								}
							>
								<Bell size={20} />
								<span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
									3
								</span>
							</Button>

							{showNotifications && (
								<div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
									<div className="p-4 border-b border-gray-200">
										<h3 className="text-lg font-semibold text-gray-900">
											Notifications
										</h3>
									</div>
									<div className="max-h-64 overflow-y-auto">
										{notifications.map((notification) => (
											<div
												key={notification.id}
												className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
													notification.unread
														? 'bg-blue-50'
														: ''
												}`}
											>
												<p className="text-sm text-gray-800">
													{notification.message}
												</p>
												<p className="text-xs text-gray-500 mt-1">
													{notification.time}
												</p>
											</div>
										))}
									</div>
									<div className="p-2">
										<Button
											variant="ghost"
											size="sm"
											className="w-full"
										>
											View all notifications
										</Button>
									</div>
								</div>
							)}
						</div>

						<div className="relative">
							<Button
								variant="ghost"
								size="sm"
								className="flex items-center space-x-2"
								onClick={() => setShowUserMenu(!showUserMenu)}
							>
								<div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
									<span className="text-white text-sm font-medium">
										{user.name.charAt(0).toUpperCase()}
									</span>
								</div>
								<div className="hidden sm:block text-left">
									<p className="text-sm font-medium text-gray-700">
										{user.name}
									</p>
									<p className="text-xs text-gray-500">
										{user.role}
									</p>
								</div>
								<ChevronDown
									size={16}
									className="text-gray-400"
								/>
							</Button>

							{showUserMenu && (
								<div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
									<div className="p-4 border-b border-gray-100">
										<p className="text-sm font-medium text-gray-900">
											{user.name}
										</p>
										<p className="text-sm text-gray-500">
											{user.email}
										</p>
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
											{user.role}
										</span>
									</div>
									<div className="py-2">
										<button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
											<User size={16} className="mr-3" />
											Profile Settings
										</button>
										<button
											onClick={onLogout}
											className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
										>
											<svg
												className="w-4 h-4 mr-3"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
												/>
											</svg>
											Sign Out
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</nav>
	)
}
