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
import { apiGet, apiPut } from '@/lib/api'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Briefcase, Clock, CheckCircle, XCircle, Award } from 'lucide-react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

interface ProjectAssignment {
	id: number
	projectId: number
	employeeId: number
	status: string
	hrComments?: string
	managerComments?: string
	createdAt: string
	project: {
		id: number
		name: string
		description: string
		status: string
	}
	employee: {
		id: number
		firstName: string
		lastName: string
		position?: string
	}
	candidateMatch?: {
		skillIndex: number
		matchPercentage: number
		matchedSkills: Array<{
			skill: { name: string; category: string }
			employeeRating: number
			requiredWeight: number
		}>
	}
}

export default function ManagerProjectsPage() {
	const [assignments, setAssignments] = useState<ProjectAssignment[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedAssignment, setSelectedAssignment] = useState<ProjectAssignment | null>(null)
	const [comments, setComments] = useState('')
	const [processing, setProcessing] = useState(false)

	useEffect(() => {
		loadProjectRequests()
	}, [])

	const loadProjectRequests = async () => {
		try {
			setLoading(true)
			const data = await apiGet('/projects/my/requests')
			// Map backend response to expected frontend structure
			if (Array.isArray(data?.requests)) {
				setAssignments(
					data.requests.map((a: any) => ({
						id: a.assignmentId,
						projectId: a.projectId,
						employeeId: a.employee.id,
						status: a.status,
						createdAt: a.requestedAt,
						project: {
							id: a.projectId,
							name: a.projectName,
							description: a.projectDescription,
							status: a.status,
						},
						employee: {
							id: a.employee.id,
							firstName: a.employee.name.split(' ')[0] || '',
							lastName: a.employee.name.split(' ').slice(1).join(' ') || '',
							position: a.employee.position,
						},
					}))
				);
			} else {
				setAssignments([]);
			}
		} catch (err: any) {
			setError(err.message)
			setAssignments([])
		} finally {
			setLoading(false)
		}
	}

	const openReviewDialog = (assignment: ProjectAssignment) => {
		setSelectedAssignment(assignment)
		setComments('')
		setError(null)
	}

	const handleApproval = async (status: 'APPROVED' | 'REJECTED') => {
		if (!selectedAssignment) return

		try {
			setProcessing(true)
			setError(null)

			await apiPut(`/projects/assignments/${selectedAssignment.id}/approve`, {
				action: status === 'APPROVED' ? 'APPROVE' : 'REJECT',
				comments,
			})

			// Update local state
			setAssignments(
				assignments.map((a) =>
					a.id === selectedAssignment.id ? { ...a, status, managerComments: comments } : a
				)
			)
			setSelectedAssignment(null)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setProcessing(false)
		}
	}

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'APPROVED':
				return <Badge className="bg-green-100 text-green-800">Approved</Badge>
			case 'REJECTED':
				return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
			case 'PENDING':
				return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
			default:
				return <Badge>{status}</Badge>
		}
	}

	const pendingCount = assignments.filter((a) => a.status === 'PENDING').length

	if (loading) {
		return (
			<ProtectedRoute allowedRoles={['MANAGER']}>
				<Navigation />
				<div className="container mx-auto px-4 py-8 text-center">
					Loading project requests...
				</div>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute allowedRoles={['MANAGER']}>
			<Navigation />
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Project Assignment Requests</h1>
					<p className="text-gray-600">
						Review and approve employee assignments from HR
					</p>
				</div>

				{error && !selectedAssignment && (
					<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6">
						{error}
					</div>
				)}

				{/* Summary Cards */}
				<div className="grid md:grid-cols-3 gap-4 mb-6">
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold">{assignments.length}</p>
							<p className="text-sm text-gray-600">Total Requests</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold text-yellow-600">
								{pendingCount}
							</p>
							<p className="text-sm text-gray-600">Pending Review</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold text-green-600">
								{assignments.filter((a) => a.status === 'APPROVED').length}
							</p>
							<p className="text-sm text-gray-600">Approved</p>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Briefcase className="w-5 h-5 text-purple-600" />
							Project Assignments
						</CardTitle>
					</CardHeader>
					<CardContent>
						{assignments.length === 0 ? (
							<div className="text-center py-12">
								<Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-600 text-lg font-medium">
									No project requests yet
								</p>
								<p className="text-gray-500 text-sm">
									HR will send project assignments for your approval
								</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Project</TableHead>
										<TableHead>Employee</TableHead>
										<TableHead>Match Score</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Action</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{assignments.map((assignment) => (
										<TableRow key={assignment.id}>
											<TableCell>
												<div>
													<p className="font-medium">
														{assignment.project.name}
													</p>
													<p className="text-xs text-gray-500 max-w-xs truncate">
														{assignment.project.description}
													</p>
												</div>
											</TableCell>
											<TableCell>
												<div>
													<p className="font-medium">
														{assignment.employee.firstName}{' '}
														{assignment.employee.lastName}
													</p>
													<p className="text-xs text-gray-500">
														{assignment.employee.position || 'Employee'}
													</p>
												</div>
											</TableCell>
											<TableCell>
												{assignment.candidateMatch ? (
													<div className="flex items-center gap-2">
														<Award className="w-4 h-4 text-blue-600" />
														<span className="font-semibold">
															{assignment.candidateMatch.skillIndex.toFixed(1)}
														</span>
														<span className="text-xs text-gray-500">
															({assignment.candidateMatch.matchPercentage.toFixed(0)}%)
														</span>
													</div>
												) : (
													<span className="text-gray-400">-</span>
												)}
											</TableCell>
											<TableCell>{getStatusBadge(assignment.status)}</TableCell>
											<TableCell className="text-sm text-gray-600">
												{new Date(assignment.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell>
												{assignment.status === 'PENDING' ? (
													<Button
														size="sm"
														onClick={() => openReviewDialog(assignment)}
													>
														Review
													</Button>
												) : (
													<Button
														size="sm"
														variant="outline"
														onClick={() => openReviewDialog(assignment)}
													>
														View
													</Button>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Review Dialog */}
			<Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Project Assignment Review</DialogTitle>
						<DialogDescription>
							Review employee assignment details and approve or reject
						</DialogDescription>
					</DialogHeader>

					{selectedAssignment && (
						<div className="space-y-6">
							{error && (
								<div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-sm">
									{error}
								</div>
							)}

							{/* Project Info */}
							<div className="bg-blue-50 p-4 rounded">
								<h3 className="font-semibold mb-2 flex items-center gap-2">
									<Briefcase className="w-4 h-4" />
									Project Details
								</h3>
								<div className="space-y-2">
									<div>
										<span className="text-sm text-gray-600">Name:</span>{' '}
										<span className="font-medium">
											{selectedAssignment.project.name}
										</span>
									</div>
									<div>
										<span className="text-sm text-gray-600">Description:</span>
										<p className="text-sm mt-1">
											{selectedAssignment.project.description}
										</p>
									</div>
								</div>
							</div>

							{/* Employee Info */}
							<div className="bg-gray-50 p-4 rounded">
								<h3 className="font-semibold mb-2">Employee Details</h3>
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div>
										<span className="text-gray-600">Name:</span>{' '}
										<span className="font-medium">
											{selectedAssignment.employee.firstName}{' '}
											{selectedAssignment.employee.lastName}
										</span>
									</div>
									<div>
										<span className="text-gray-600">Position:</span>{' '}
										<span className="font-medium">
											{selectedAssignment.employee.position || 'N/A'}
										</span>
									</div>
								</div>
							</div>

							{/* AI Match Score */}
							{selectedAssignment.candidateMatch && (
								<div className="bg-green-50 p-4 rounded">
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										<Award className="w-4 h-4" />
										AI Match Analysis
									</h3>
									<div className="grid grid-cols-2 gap-4 mb-4">
										<div>
											<p className="text-sm text-gray-600">Skill Index</p>
											<p className="text-2xl font-bold text-green-600">
												{selectedAssignment.candidateMatch.skillIndex.toFixed(1)}/100
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-600">Match Percentage</p>
											<p className="text-2xl font-bold text-blue-600">
												{selectedAssignment.candidateMatch.matchPercentage.toFixed(0)}%
											</p>
										</div>
									</div>

									{selectedAssignment.candidateMatch.matchedSkills.length > 0 && (
										<div>
											<p className="text-sm font-medium mb-2">Matched Skills:</p>
											<div className="space-y-2">
												{selectedAssignment.candidateMatch.matchedSkills.map((ms, idx) => (
													<div key={idx} className="flex justify-between items-center text-sm bg-white p-2 rounded">
														<span className="font-medium">{ms.skill.name}</span>
														<div className="flex items-center gap-3">
															<span className="text-gray-600">
																Rating: {ms.employeeRating}/10
															</span>
															<Badge variant="outline">
																Weight: {ms.requiredWeight}
															</Badge>
														</div>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							)}

							{/* HR Comments */}
							{selectedAssignment.hrComments && (
								<div>
									<h3 className="font-semibold mb-2">HR Comments</h3>
									<p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
										{selectedAssignment.hrComments}
									</p>
								</div>
							)}

							{/* Manager Comments */}
							{selectedAssignment.status === 'PENDING' ? (
								<div>
									<label className="font-semibold block mb-2">
										Your Comments (Optional)
									</label>
									<textarea
										value={comments}
										onChange={(e) => setComments(e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[80px]"
										placeholder="Add your feedback or comments..."
									/>
								</div>
							) : (
								selectedAssignment.managerComments && (
									<div>
										<h3 className="font-semibold mb-2">Manager Comments</h3>
										<p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
											{selectedAssignment.managerComments}
										</p>
									</div>
								)
							)}

							{/* Action Buttons */}
							<div className="flex gap-3 justify-end border-t pt-4">
								<Button
									variant="outline"
									onClick={() => setSelectedAssignment(null)}
									disabled={processing}
								>
									{selectedAssignment.status === 'PENDING' ? 'Cancel' : 'Close'}
								</Button>
								{selectedAssignment.status === 'PENDING' && (
									<>
										<Button
											variant="outline"
											onClick={() => handleApproval('REJECTED')}
											disabled={processing}
											className="text-red-600 hover:bg-red-50"
										>
											<XCircle className="w-4 h-4 mr-2" />
											Reject
										</Button>
										<Button
											onClick={() => handleApproval('APPROVED')}
											disabled={processing}
										>
											<CheckCircle className="w-4 h-4 mr-2" />
											{processing ? 'Approving...' : 'Approve Assignment'}
										</Button>
									</>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</ProtectedRoute>
	)
}
