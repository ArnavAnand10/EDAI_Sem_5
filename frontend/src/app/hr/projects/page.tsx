'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { apiGet } from '@/lib/api'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Briefcase, Award, Users, Eye, Plus } from 'lucide-react'
import Link from 'next/link'

interface Project {
	id: number
	name: string
	description: string
	status: string
	createdAt: string
	requiredSkills: Array<{
		id: number
		weight: number
		skill: {
			id: number
			name: string
			category: string
		}
	}>
	assignments: Array<{
		id: number
		status: string
		employee: {
			id: number
			firstName: string
			lastName: string
		}
	}>
	assignmentsCount: number
}

export default function AllProjectsPage() {
	const [projects, setProjects] = useState<Project[]>([])
	const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [statusFilter, setStatusFilter] = useState('all')
	const [selectedProject, setSelectedProject] = useState<Project | null>(null)
	const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

	useEffect(() => {
		loadProjects()
	}, [])

	useEffect(() => {
		filterProjects()
	}, [projects, statusFilter])

	const loadProjects = async () => {
		try {
			setLoading(true)
			const data = await apiGet('/projects/all')
			const projectsData = Array.isArray(data)
				? data
				: data.projects || []
			setProjects(projectsData)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	const filterProjects = () => {
		if (statusFilter === 'all') {
			setFilteredProjects(projects)
		} else {
			setFilteredProjects(
				projects.filter((p) => p.status === statusFilter)
			)
		}
	}

	const openDetailsDialog = (project: Project) => {
		setSelectedProject(project)
		setIsDetailsDialogOpen(true)
	}

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'ACTIVE':
				return (
					<Badge className="bg-green-100 text-green-800">
						Active
					</Badge>
				)
			case 'PENDING':
				return (
					<Badge className="bg-yellow-100 text-yellow-800">
						Pending
					</Badge>
				)
			case 'COMPLETED':
				return (
					<Badge className="bg-blue-100 text-blue-800">
						Completed
					</Badge>
				)
			case 'CANCELLED':
				return (
					<Badge className="bg-gray-100 text-gray-800">
						Cancelled
					</Badge>
				)
			default:
				return <Badge>{status}</Badge>
		}
	}

	const getAssignmentStats = (project: Project) => {
		const total = project.assignmentsCount
		const pending = project.assignments.filter(
			(a) => a.status === 'PENDING'
		).length
		const approved = project.assignments.filter(
			(a) => a.status === 'APPROVED'
		).length
		return { total, pending, approved }
	}

	if (loading) {
		return (
			<ProtectedRoute allowedRoles={['HR']}>
				<Navigation />
				<div className="container mx-auto px-4 py-8 text-center">
					Loading projects...
				</div>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute allowedRoles={['HR']}>
			<Navigation />
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">All Projects</h1>
						<p className="text-gray-600">
							Manage and track all projects and assignments
						</p>
					</div>
					<Link href="/hr/projects/create">
						<Button>
							<Plus className="w-4 h-4 mr-2" />
							Create Project
						</Button>
					</Link>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6">
						{error}
					</div>
				)}

				{/* Summary Cards */}
				<div className="grid md:grid-cols-4 gap-4 mb-6">
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold">
								{projects.length}
							</p>
							<p className="text-sm text-gray-600">
								Total Projects
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold text-green-600">
								{
									projects.filter(
										(p) => p.status === 'ACTIVE'
									).length
								}
							</p>
							<p className="text-sm text-gray-600">Active</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold text-yellow-600">
								{
									projects.filter(
										(p) => p.status === 'PENDING'
									).length
								}
							</p>
							<p className="text-sm text-gray-600">Pending</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold text-blue-600">
								{projects.reduce(
									(sum, p) => sum + (p.assignmentsCount || 0),
									0
								)}
							</p>
							<p className="text-sm text-gray-600">
								Total Assignments
							</p>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<Briefcase className="w-5 h-5 text-blue-600" />
								Projects List
							</CardTitle>
							<div className="w-48">
								<Select
									value={statusFilter}
									onValueChange={setStatusFilter}
								>
									<SelectTrigger>
										<SelectValue placeholder="Filter by status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All Statuses
										</SelectItem>
										<SelectItem value="ACTIVE">
											Active
										</SelectItem>
										<SelectItem value="PENDING">
											Pending
										</SelectItem>
										<SelectItem value="COMPLETED">
											Completed
										</SelectItem>
										<SelectItem value="CANCELLED">
											Cancelled
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{filteredProjects.length === 0 ? (
							<div className="text-center py-12">
								<Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-600 text-lg font-medium mb-2">
									{projects.length === 0
										? 'No projects yet'
										: 'No projects match the filter'}
								</p>
								<p className="text-gray-500 text-sm">
									{projects.length === 0
										? 'Create your first project to get started'
										: 'Try adjusting your filters'}
								</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Project Name</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Required Skills</TableHead>
										<TableHead>Assignments</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="text-right">
											Action
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredProjects.map((project) => {
										const stats =
											getAssignmentStats(project)
										return (
											<TableRow key={project.id}>
												<TableCell>
													<div>
														<p className="font-medium">
															{project.name}
														</p>
														<p className="text-xs text-gray-500 max-w-xs truncate">
															{
																project.description
															}
														</p>
													</div>
												</TableCell>
												<TableCell>
													{getStatusBadge(
														project.status
													)}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Award className="w-4 h-4 text-purple-600" />
														<span className="font-medium">
															{
																project
																	.requiredSkills
																	.length
															}
														</span>
														<span className="text-xs text-gray-500">
															skills
														</span>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Users className="w-4 h-4 text-green-600" />
														<span className="font-medium">
															{stats.total}
														</span>
														<span className="text-xs text-gray-500">
															({stats.pending}{' '}
															pending,{' '}
															{stats.approved}{' '}
															approved)
														</span>
													</div>
												</TableCell>
												<TableCell className="text-sm text-gray-600">
													{new Date(
														project.createdAt
													).toLocaleDateString()}
												</TableCell>
												<TableCell className="text-right">
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															openDetailsDialog(
																project
															)
														}
													>
														<Eye className="w-4 h-4 mr-1" />
														View
													</Button>
												</TableCell>
											</TableRow>
										)
									})}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Details Dialog */}
			<Dialog
				open={isDetailsDialogOpen}
				onOpenChange={setIsDetailsDialogOpen}
			>
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Project Details</DialogTitle>
						<DialogDescription>
							Complete information about the project
						</DialogDescription>
					</DialogHeader>

					{selectedProject && (
						<div className="space-y-6">
							{/* Project Info */}
							<div className="bg-blue-50 p-4 rounded-lg">
								<div className="flex items-start justify-between mb-2">
									<h3 className="font-semibold text-lg">
										{selectedProject.name}
									</h3>
									{getStatusBadge(selectedProject.status)}
								</div>
								<p className="text-sm text-gray-700 mb-2">
									{selectedProject.description}
								</p>
								<p className="text-xs text-gray-500">
									Created:{' '}
									{new Date(
										selectedProject.createdAt
									).toLocaleDateString()}
								</p>
							</div>

							{/* Required Skills */}
							<div>
								<h3 className="font-semibold mb-3 flex items-center gap-2">
									<Award className="w-4 h-4 text-purple-600" />
									Required Skills (
									{selectedProject.requiredSkills.length})
								</h3>
								<div className="grid grid-cols-2 gap-2">
									{selectedProject.requiredSkills.map(
										(rs) => (
											<div
												key={rs.id}
												className="flex items-center justify-between p-3 bg-gray-50 rounded"
											>
												<div>
													<p className="font-medium text-sm">
														{rs.skill.name}
													</p>
													<p className="text-xs text-gray-500">
														{rs.skill.category}
													</p>
												</div>
												<Badge variant="outline">
													Weight: {rs.weight}
												</Badge>
											</div>
										)
									)}
								</div>
							</div>

							{/* Assignments */}
							<div>
								<h3 className="font-semibold mb-3 flex items-center gap-2">
									<Users className="w-4 h-4 text-green-600" />
									Employee Assignments (
									{selectedProject.assignmentsCount})
								</h3>
								{selectedProject.assignmentsCount === 0 ? (
									<p className="text-sm text-gray-500 text-center py-4">
										No assignments yet
									</p>
								) : (
									<div className="space-y-2">
										{selectedProject.assignments.map(
											(assignment) => (
												<div
													key={assignment.id}
													className="flex items-center justify-between p-3 bg-gray-50 rounded"
												>
													<p className="font-medium">
														{
															assignment.employee
																.firstName
														}{' '}
														{
															assignment.employee
																.lastName
														}
													</p>
													{assignment.status ===
													'APPROVED' ? (
														<Badge className="bg-green-100 text-green-800">
															Approved
														</Badge>
													) : assignment.status ===
													  'PENDING' ? (
														<Badge className="bg-yellow-100 text-yellow-800">
															Pending Manager
														</Badge>
													) : (
														<Badge className="bg-red-100 text-red-800">
															Rejected
														</Badge>
													)}
												</div>
											)
										)}
									</div>
								)}
							</div>

							<div className="flex justify-end pt-4 border-t">
								<Button
									onClick={() =>
										setIsDetailsDialogOpen(false)
									}
								>
									Close
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</ProtectedRoute>
	)
}
