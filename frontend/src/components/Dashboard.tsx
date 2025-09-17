import React from 'react'
import {
	Users,
	Trophy,
	Building2,
	TrendingUp,
	Clock,
	CheckCircle,
	XCircle,
	Star,
	Award,
	Target,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface DashboardProps {
	userRole: 'ADMIN' | 'EMPLOYEE'
	stats: {
		totalEmployees?: number
		totalSkills?: number
		pendingRequests?: number
		approvedSkills?: number
		mySkills?: number
		skillLevel?: string
		completionRate?: number
	}
}

export default function Dashboard({ userRole, stats }: DashboardProps) {
	const adminStats = [
		{
			title: 'Total Employees',
			value: stats.totalEmployees || 0,
			icon: Users,
			color: 'bg-blue-500',
			trend: '+12%',
			description: 'Active employees',
		},
		{
			title: 'Total Skills',
			value: stats.totalSkills || 0,
			icon: Trophy,
			color: 'bg-yellow-500',
			trend: '+8%',
			description: 'Available skills',
		},
		{
			title: 'Pending Requests',
			value: stats.pendingRequests || 0,
			icon: Clock,
			color: 'bg-orange-500',
			trend: '-3%',
			description: 'Awaiting approval',
		},
		{
			title: 'Companies',
			value: 5,
			icon: Building2,
			color: 'bg-green-500',
			trend: '+2%',
			description: 'Registered companies',
		},
	]

	const employeeStats = [
		{
			title: 'My Skills',
			value: stats.mySkills || 0,
			icon: Trophy,
			color: 'bg-yellow-500',
			trend: '+2',
			description: 'Skills acquired',
		},
		{
			title: 'Skill Level',
			value: stats.skillLevel || 'Intermediate',
			icon: Star,
			color: 'bg-purple-500',
			trend: 'Growing',
			description: 'Average level',
		},
		{
			title: 'Completion Rate',
			value: `${stats.completionRate || 75}%`,
			icon: Target,
			color: 'bg-green-500',
			trend: '+5%',
			description: 'Goal progress',
		},
		{
			title: 'Achievements',
			value: 8,
			icon: Award,
			color: 'bg-blue-500',
			trend: '+1',
			description: 'Badges earned',
		},
	]

	const statsToShow = userRole === 'ADMIN' ? adminStats : employeeStats

	const recentActivities =
		userRole === 'ADMIN'
			? [
					{
						id: 1,
						user: 'John Doe',
						action: 'requested',
						skill: 'React Development',
						time: '2 hours ago',
						status: 'pending',
					},
					{
						id: 2,
						user: 'Jane Smith',
						action: 'completed',
						skill: 'Node.js',
						time: '4 hours ago',
						status: 'approved',
					},
					{
						id: 3,
						user: 'Mike Johnson',
						action: 'requested',
						skill: 'Python',
						time: '6 hours ago',
						status: 'pending',
					},
					{
						id: 4,
						user: 'Sarah Wilson',
						action: 'achieved',
						skill: 'Advanced SQL',
						time: '1 day ago',
						status: 'approved',
					},
			  ]
			: [
					{
						id: 1,
						action: 'Skill request approved',
						skill: 'React Development',
						time: '2 hours ago',
						status: 'approved',
					},
					{
						id: 2,
						action: 'New skill available',
						skill: 'TypeScript',
						time: '1 day ago',
						status: 'new',
					},
					{
						id: 3,
						action: 'Achievement unlocked',
						skill: 'Frontend Expert',
						time: '3 days ago',
						status: 'achievement',
					},
					{
						id: 4,
						action: 'Skill request submitted',
						skill: 'GraphQL',
						time: '5 days ago',
						status: 'pending',
					},
			  ]

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'approved':
				return <CheckCircle className="w-4 h-4 text-green-500" />
			case 'pending':
				return <Clock className="w-4 h-4 text-orange-500" />
			case 'rejected':
				return <XCircle className="w-4 h-4 text-red-500" />
			default:
				return <Star className="w-4 h-4 text-blue-500" />
		}
	}

	const getStatusBadge = (status: string) => {
		const variants: {
			[key: string]: 'default' | 'secondary' | 'destructive' | 'outline'
		} = {
			approved: 'default',
			pending: 'secondary',
			rejected: 'destructive',
			new: 'default',
			achievement: 'default',
		}

		return (
			<Badge variant={variants[status] || 'outline'}>
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</Badge>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						{userRole === 'ADMIN'
							? 'Admin Dashboard'
							: 'My Dashboard'}
					</h1>
					<p className="text-gray-600 mt-1">
						{userRole === 'ADMIN'
							? 'Manage your organization and track employee progress'
							: 'Track your skills and career development'}
					</p>
				</div>
				<div className="mt-4 sm:mt-0">
					<Button>
						{userRole === 'ADMIN'
							? 'Add Employee'
							: 'Request New Skill'}
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statsToShow.map((stat, index) => (
					<Card
						key={index}
						className="hover:shadow-lg transition-shadow duration-200"
					>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<p className="text-sm font-medium text-gray-600">
										{stat.title}
									</p>
									<p className="text-2xl font-bold text-gray-900 mt-2">
										{stat.value}
									</p>
									<div className="flex items-center mt-2">
										<span className="text-sm text-green-600 font-medium">
											{stat.trend}
										</span>
										<span className="text-sm text-gray-500 ml-2">
											{stat.description}
										</span>
									</div>
								</div>
								<div
									className={`p-3 rounded-full ${stat.color}`}
								>
									<stat.icon className="w-6 h-6 text-white" />
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<TrendingUp className="w-5 h-5 mr-2" />
								Recent Activities
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recentActivities.map((activity) => (
									<div
										key={activity.id}
										className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
									>
										<div className="flex items-center space-x-3">
											{getStatusIcon(activity.status)}
											<div>
												<p className="text-sm font-medium text-gray-900">
													{userRole === 'ADMIN' &&
													'user' in activity ? (
														<>
															<span className="font-semibold">
																{activity.user}
															</span>{' '}
															{activity.action}{' '}
															{activity.skill}
														</>
													) : (
														<>
															{activity.action}:{' '}
															<span className="font-semibold">
																{activity.skill}
															</span>
														</>
													)}
												</p>
												<p className="text-xs text-gray-500">
													{activity.time}
												</p>
											</div>
										</div>
										{getStatusBadge(activity.status)}
									</div>
								))}
							</div>
							<div className="mt-4">
								<Button variant="outline" className="w-full">
									View All Activities
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{userRole === 'ADMIN' ? (
								<>
									<Button
										variant="outline"
										className="w-full justify-start"
									>
										<Users className="w-4 h-4 mr-2" />
										Add New Employee
									</Button>
									<Button
										variant="outline"
										className="w-full justify-start"
									>
										<Trophy className="w-4 h-4 mr-2" />
										Create Skill
									</Button>
									<Button
										variant="outline"
										className="w-full justify-start"
									>
										<Building2 className="w-4 h-4 mr-2" />
										Add Company
									</Button>
								</>
							) : (
								<>
									<Button
										variant="outline"
										className="w-full justify-start"
									>
										<Trophy className="w-4 h-4 mr-2" />
										Request Skill
									</Button>
									<Button
										variant="outline"
										className="w-full justify-start"
									>
										<Star className="w-4 h-4 mr-2" />
										View Progress
									</Button>
									<Button
										variant="outline"
										className="w-full justify-start"
									>
										<Target className="w-4 h-4 mr-2" />
										Set Goals
									</Button>
								</>
							)}
						</CardContent>
					</Card>

					{userRole === 'EMPLOYEE' && (
						<Card>
							<CardHeader>
								<CardTitle>Skill Progress</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<div className="flex justify-between text-sm">
											<span>Frontend Development</span>
											<span>85%</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2 mt-1">
											<div
												className="bg-blue-600 h-2 rounded-full"
												style={{ width: '85%' }}
											></div>
										</div>
									</div>
									<div>
										<div className="flex justify-between text-sm">
											<span>Backend Development</span>
											<span>60%</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2 mt-1">
											<div
												className="bg-green-600 h-2 rounded-full"
												style={{ width: '60%' }}
											></div>
										</div>
									</div>
									<div>
										<div className="flex justify-between text-sm">
											<span>DevOps</span>
											<span>40%</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2 mt-1">
											<div
												className="bg-yellow-600 h-2 rounded-full"
												style={{ width: '40%' }}
											></div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	)
}
