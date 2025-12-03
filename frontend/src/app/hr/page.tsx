'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiGet } from '@/lib/api'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
	Briefcase,
	Users,
	Award,
	FileText,
	ArrowRight,
	TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
	totalProjects: number
	activeProjects: number
	totalSkills: number
	pendingAssignments: number
	totalEmployees: number
	recentProjects: Array<{
		id: number
		name: string
		status: string
		createdAt: string
	}>
}

export default function HRDashboardPage() {
	const [stats, setStats] = useState<DashboardStats>({
		totalProjects: 0,
		activeProjects: 0,
		totalSkills: 0,
		pendingAssignments: 0,
		totalEmployees: 0,
		recentProjects: [],
	})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		loadDashboardData()
	}, [])

	const loadDashboardData = async () => {
		try {
			setLoading(true)
			setError(null)

			const [projectsResp, skillsData, employeesData] = await Promise.all(
				[
					apiGet('/projects/all').catch(() => []),
					apiGet('/skills').catch(() => []),
					apiGet('/employees').catch(() => []),
				]
			)

			const projectsData = Array.isArray(projectsResp)
				? projectsResp
				: projectsResp.projects || []

			const activeProjects = projectsData.filter(
				(p: any) => p.status === 'ACTIVE'
			).length

			const pendingAssignments = projectsData.reduce(
				(sum: number, p: any) =>
					sum +
					(p.assignments?.filter((a: any) => a.status === 'PENDING')
						.length || 0),
				0
			)

			const recentProjects = projectsData
				.sort(
					(a: any, b: any) =>
						new Date(b.createdAt).getTime() -
						new Date(a.createdAt).getTime()
				)
				.slice(0, 5)

			setStats({
				totalProjects: projectsData.length,
				activeProjects,
				totalSkills: skillsData.length,
				pendingAssignments,
				totalEmployees: employeesData.length,
				recentProjects,
			})
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return (
			<ProtectedRoute allowedRoles={['HR']}>
				<Navigation />
				<div className="container mx-auto px-4 py-8 text-center">
					Loading dashboard...
				</div>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute allowedRoles={['HR']}>
			<Navigation />
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">HR Dashboard</h1>
					<p className="text-gray-600">
						Manage skills, projects, and employee assignments
					</p>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6">
						{error}
					</div>
				)}

				{/* Stats Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">
										Total Projects
									</p>
									<p className="text-3xl font-bold">
										{stats.totalProjects}
									</p>
									<p className="text-xs text-gray-500 mt-1">
										{stats.activeProjects} active
									</p>
								</div>
								<Briefcase className="w-8 h-8 text-blue-600" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">
										Skills Database
									</p>
									<p className="text-3xl font-bold">
										{stats.totalSkills}
									</p>
									<p className="text-xs text-gray-500 mt-1">
										Available skills
									</p>
								</div>
								<Award className="w-8 h-8 text-purple-600" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">
										Employees
									</p>
									<p className="text-3xl font-bold">
										{stats.totalEmployees}
									</p>
									<p className="text-xs text-gray-500 mt-1">
										In system
									</p>
								</div>
								<Users className="w-8 h-8 text-green-600" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">
										Pending
									</p>
									<p className="text-3xl font-bold">
										{stats.pendingAssignments}
									</p>
									<p className="text-xs text-gray-500 mt-1">
										Assignments
									</p>
								</div>
								<TrendingUp className="w-8 h-8 text-yellow-600" />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Quick Actions */}
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<Link href="/hr/skills">
						<Card className="hover:shadow-lg transition-shadow cursor-pointer">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Award className="w-5 h-5 text-purple-600" />
									Manage Skills
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-gray-600 mb-3">
									Add, edit, or remove skills from the
									database
								</p>
								<Button
									variant="outline"
									size="sm"
									className="w-full"
								>
									Open <ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							</CardContent>
						</Card>
					</Link>

					<Link href="/hr/projects/create">
						<Card className="hover:shadow-lg transition-shadow cursor-pointer">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Briefcase className="w-5 h-5 text-blue-600" />
									Create Project
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-gray-600 mb-3">
									Use AI to create new projects with skill
									requirements
								</p>
								<Button
									variant="outline"
									size="sm"
									className="w-full"
								>
									Create{' '}
									<ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							</CardContent>
						</Card>
					</Link>

					<Link href="/hr/candidates">
						<Card className="hover:shadow-lg transition-shadow cursor-pointer">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Users className="w-5 h-5 text-green-600" />
									Select Candidates
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-gray-600 mb-3">
									Find and assign best employees to projects
								</p>
								<Button
									variant="outline"
									size="sm"
									className="w-full"
								>
									Select{' '}
									<ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							</CardContent>
						</Card>
					</Link>

					<Link href="/hr/projects">
						<Card className="hover:shadow-lg transition-shadow cursor-pointer">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<FileText className="w-5 h-5 text-orange-600" />
									All Projects
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-gray-600 mb-3">
									View and manage all projects and assignments
								</p>
								<Button
									variant="outline"
									size="sm"
									className="w-full"
								>
									View All{' '}
									<ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							</CardContent>
						</Card>
					</Link>
				</div>

				{/* Recent Projects */}
				{stats.recentProjects.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="w-5 h-5 text-blue-600" />
								Recent Projects
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{stats.recentProjects.map((project) => (
									<div
										key={project.id}
										className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
									>
										<div>
											<p className="font-medium">
												{project.name}
											</p>
											<p className="text-xs text-gray-500">
												Created{' '}
												{new Date(
													project.createdAt
												).toLocaleDateString()}
											</p>
										</div>
										<div className="flex items-center gap-3">
											<span
												className={`px-3 py-1 rounded-full text-xs font-medium ${
													project.status === 'ACTIVE'
														? 'bg-green-100 text-green-800'
														: project.status ===
														  'PENDING'
														? 'bg-yellow-100 text-yellow-800'
														: 'bg-gray-100 text-gray-800'
												}`}
											>
												{project.status}
											</span>
											<Link href={`/hr/projects`}>
												<Button
													size="sm"
													variant="ghost"
												>
													View
												</Button>
											</Link>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</ProtectedRoute>
	)
}
