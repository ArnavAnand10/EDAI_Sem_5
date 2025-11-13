'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiGet } from '@/lib/api'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Clock, CheckCircle, Users, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface DashboardStats {
	pendingApprovals: number
	teamMembers: number
	approvedRatings: number
	projectRequests: number
}

export default function ManagerDashboard() {
	const [stats, setStats] = useState<DashboardStats>({
		pendingApprovals: 0,
		teamMembers: 0,
		approvedRatings: 0,
		projectRequests: 0,
	})
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		loadStats()
	}, [])

	const loadStats = async () => {
		try {
			setLoading(true)
			const [pending, team, projects] = await Promise.all([
				apiGet('/ratings/pending'),
				apiGet('/ratings/team'),
				apiGet('/projects/my/requests').catch(() => []),
			])

			const approved = team.filter((r: any) => r.managerStatus === 'APPROVED')

			setStats({
				pendingApprovals: pending.length,
				teamMembers: new Set(team.map((r: any) => r.employeeId)).size,
				approvedRatings: approved.length,
				projectRequests: projects.length || 0,
			})
		} catch (err) {
			console.error('Failed to load stats:', err)
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return (
			<ProtectedRoute allowedRoles={['MANAGER']}>
				<Navigation />
				<div className="container mx-auto px-4 py-8 text-center">
					Loading dashboard...
				</div>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute allowedRoles={['MANAGER']}>
			<Navigation />
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="mb-8">
					<h1 className="text-3xl font-bold">Manager Dashboard</h1>
					<p className="text-gray-600">
						Manage team skill approvals and project assignments
					</p>
				</div>

				{/* Stats Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<Card className="border-l-4 border-l-yellow-500">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-sm font-medium text-gray-600">
									Pending Approvals
								</CardTitle>
								<Clock className="w-5 h-5 text-yellow-500" />
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold text-yellow-600">
								{stats.pendingApprovals}
							</p>
							<p className="text-xs text-gray-500 mt-1">
								Skill ratings awaiting review
							</p>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-blue-500">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-sm font-medium text-gray-600">
									Team Members
								</CardTitle>
								<Users className="w-5 h-5 text-blue-500" />
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold text-blue-600">
								{stats.teamMembers}
							</p>
							<p className="text-xs text-gray-500 mt-1">
								Direct reports
							</p>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-green-500">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-sm font-medium text-gray-600">
									Approved Ratings
								</CardTitle>
								<CheckCircle className="w-5 h-5 text-green-500" />
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold text-green-600">
								{stats.approvedRatings}
							</p>
							<p className="text-xs text-gray-500 mt-1">
								Skills approved
							</p>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-purple-500">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-sm font-medium text-gray-600">
									Project Requests
								</CardTitle>
								<Briefcase className="w-5 h-5 text-purple-500" />
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold text-purple-600">
								{stats.projectRequests}
							</p>
							<p className="text-xs text-gray-500 mt-1">
								Assignments to review
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Quick Actions */}
				<div className="grid md:grid-cols-3 gap-6">
					<Card className="hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="w-5 h-5 text-yellow-600" />
								Pending Approvals
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600 mb-4">
								Review and approve skill ratings submitted by your team members.
							</p>
							<Link href="/manager/approvals">
								<Button className="w-full" variant={stats.pendingApprovals > 0 ? "default" : "outline"}>
									{stats.pendingApprovals > 0 ? `Review ${stats.pendingApprovals} Pending` : 'View Approvals'}
								</Button>
							</Link>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="w-5 h-5 text-blue-600" />
								Team Overview
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600 mb-4">
								View all skill ratings and profiles of your team members.
							</p>
							<Link href="/manager/team">
								<Button className="w-full" variant="outline">
									View Team
								</Button>
							</Link>
						</CardContent>
					</Card>

					<Card className="hover:shadow-lg transition-shadow">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Briefcase className="w-5 h-5 text-purple-600" />
								Project Requests
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600 mb-4">
								Review project assignments from HR and approve team member allocations.
							</p>
							<Link href="/manager/projects">
								<Button className="w-full" variant="outline">
									View Projects
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			</div>
		</ProtectedRoute>
	)
}
