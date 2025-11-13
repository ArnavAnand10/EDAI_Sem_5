'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
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
import { Label } from '@/components/ui/label'
import { apiGet, apiPost } from '@/lib/api'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
	Users,
	Award,
	TrendingUp,
	Briefcase,
	Loader2,
	CheckCircle,
	Star,
} from 'lucide-react'

interface Project {
	id: number
	name: string
	description: string
	status: string
	requiredSkills: Array<{
		id: number
		skillId: number
		weight: number
		skill: {
			id: number
			name: string
			category: string
		}
	}>
}

interface Candidate {
	employeeId: number
	skillIndex: number
	matchPercentage: number
	employee: {
		id: number
		firstName: string
		lastName: string
		department?: string
		position?: string
	}
	matchedSkills: Array<{
		skill: {
			name: string
			category: string
		}
		employeeRating: number
		requiredWeight: number
	}>
}

export default function CandidateSelectionPage() {
	const [projects, setProjects] = useState<Project[]>([])
	const [selectedProjectId, setSelectedProjectId] = useState<string>('')
	const [candidates, setCandidates] = useState<Candidate[]>([])
	const [loading, setLoading] = useState(false)
	const [analyzing, setAnalyzing] = useState(false)
	const [assigning, setAssigning] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
	const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
	const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
	const [assignComments, setAssignComments] = useState('')

	useEffect(() => {
		loadProjects()
	}, [])

	const loadProjects = async () => {
		try {
			setLoading(true)
			const data = await apiGet('/projects/all')
			const activeProjects = data.filter(
				(p: Project) => p.status === 'ACTIVE' || p.status === 'PENDING'
			)
			setProjects(activeProjects)

			if (activeProjects.length > 0) {
				setSelectedProjectId(activeProjects[0].id.toString())
			}
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	const handleAnalyzeCandidates = async () => {
		if (!selectedProjectId) {
			setError('Please select a project')
			return
		}

		try {
			setAnalyzing(true)
			setError(null)
			const data = await apiGet(`/projects/${selectedProjectId}/candidates`)
			setCandidates(data)
		} catch (err: any) {
			setError(err.message)
			setCandidates([])
		} finally {
			setAnalyzing(false)
		}
	}

	const openDetailsDialog = (candidate: Candidate) => {
		setSelectedCandidate(candidate)
		setIsDetailsDialogOpen(true)
	}

	const openAssignDialog = (candidate: Candidate) => {
		setSelectedCandidate(candidate)
		setAssignComments('')
		setError(null)
		setIsAssignDialogOpen(true)
	}

	const handleAssign = async () => {
		if (!selectedCandidate || !selectedProjectId) return

		try {
			setAssigning(true)
			setError(null)

			await apiPost('/projects/assign', {
				projectId: parseInt(selectedProjectId),
				employeeId: selectedCandidate.employeeId,
				comments: assignComments,
			})

			// Remove assigned candidate from list
			setCandidates(
				candidates.filter((c) => c.employeeId !== selectedCandidate.employeeId)
			)
			setIsAssignDialogOpen(false)
			setSelectedCandidate(null)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setAssigning(false)
		}
	}

	const getScoreColor = (score: number) => {
		if (score >= 70) return 'text-green-600'
		if (score >= 50) return 'text-yellow-600'
		return 'text-red-600'
	}

	const getScoreBadge = (score: number) => {
		if (score >= 70)
			return <Badge className="bg-green-100 text-green-800">Excellent Match</Badge>
		if (score >= 50)
			return <Badge className="bg-yellow-100 text-yellow-800">Good Match</Badge>
		return <Badge className="bg-red-100 text-red-800">Weak Match</Badge>
	}

	const selectedProject = projects.find(
		(p) => p.id.toString() === selectedProjectId
	)

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
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Candidate Selection</h1>
					<p className="text-gray-600">
						AI-powered employee matching for projects
					</p>
				</div>

				{error && !isAssignDialogOpen && (
					<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6">
						{error}
					</div>
				)}

				{/* Project Selection */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Briefcase className="w-5 h-5 text-blue-600" />
							Select Project
						</CardTitle>
					</CardHeader>
					<CardContent>
						{projects.length === 0 ? (
							<div className="text-center py-8">
								<Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-600 mb-2">No active projects found</p>
								<p className="text-sm text-gray-500">
									Create a project first to start matching candidates
								</p>
							</div>
						) : (
							<div className="space-y-4">
								<div className="flex gap-4 items-end">
									<div className="flex-1">
										<Label>Project</Label>
										<Select
											value={selectedProjectId}
											onValueChange={setSelectedProjectId}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a project" />
											</SelectTrigger>
											<SelectContent>
												{projects.map((project) => (
													<SelectItem
														key={project.id}
														value={project.id.toString()}
													>
														{project.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<Button onClick={handleAnalyzeCandidates} disabled={analyzing}>
										{analyzing ? (
											<>
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												Analyzing...
											</>
										) : (
											<>
												<TrendingUp className="w-4 h-4 mr-2" />
												Analyze Candidates
											</>
										)}
									</Button>
								</div>

								{selectedProject && (
									<div className="bg-blue-50 p-4 rounded-lg">
										<h3 className="font-semibold mb-2">{selectedProject.name}</h3>
										<p className="text-sm text-gray-700 mb-3">
											{selectedProject.description}
										</p>
										<div>
											<p className="text-xs font-medium text-gray-600 mb-2">
												Required Skills:
											</p>
											<div className="flex flex-wrap gap-2">
												{selectedProject.requiredSkills.map((rs) => (
													<Badge
														key={rs.id}
														variant="outline"
														className="text-xs"
													>
														{rs.skill.name} (Weight: {rs.weight})
													</Badge>
												))}
											</div>
										</div>
									</div>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Candidates Results */}
				{candidates.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="w-5 h-5 text-green-600" />
								Top Candidates ({candidates.length})
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Employee</TableHead>
										<TableHead>Department</TableHead>
										<TableHead>Skill Index</TableHead>
										<TableHead>Match %</TableHead>
										<TableHead>Match Quality</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{candidates.map((candidate) => (
										<TableRow key={candidate.employeeId}>
											<TableCell>
												<div>
													<p className="font-medium">
														{candidate.employee.firstName}{' '}
														{candidate.employee.lastName}
													</p>
													<p className="text-xs text-gray-500">
														{candidate.employee.position || 'Employee'}
													</p>
												</div>
											</TableCell>
											<TableCell className="text-sm">
												{candidate.employee.department || 'N/A'}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Star className="w-4 h-4 text-yellow-600" />
													<span
														className={`font-bold ${getScoreColor(
															candidate.skillIndex
														)}`}
													>
														{candidate.skillIndex.toFixed(1)}
													</span>
													<span className="text-gray-400">/100</span>
												</div>
											</TableCell>
											<TableCell>
												<span
													className={`font-semibold ${getScoreColor(
														candidate.matchPercentage
													)}`}
												>
													{candidate.matchPercentage.toFixed(0)}%
												</span>
											</TableCell>
											<TableCell>{getScoreBadge(candidate.skillIndex)}</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														size="sm"
														variant="outline"
														onClick={() => openDetailsDialog(candidate)}
													>
														Details
													</Button>
													<Button
														size="sm"
														onClick={() => openAssignDialog(candidate)}
													>
														Assign
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				)}

				{/* No Results */}
				{!analyzing && candidates.length === 0 && selectedProjectId && (
					<Card>
						<CardContent className="text-center py-12">
							<Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-600 text-lg font-medium mb-2">
								No candidates analyzed yet
							</p>
							<p className="text-gray-500 text-sm">
								Click "Analyze Candidates" to find the best matches
							</p>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Details Dialog */}
			<Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Candidate Details</DialogTitle>
						<DialogDescription>
							Detailed skill match analysis for this candidate
						</DialogDescription>
					</DialogHeader>

					{selectedCandidate && (
						<div className="space-y-6">
							{/* Employee Info */}
							<div className="bg-gray-50 p-4 rounded-lg">
								<h3 className="font-semibold mb-2">Employee Information</h3>
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div>
										<span className="text-gray-600">Name:</span>{' '}
										<span className="font-medium">
											{selectedCandidate.employee.firstName}{' '}
											{selectedCandidate.employee.lastName}
										</span>
									</div>
									<div>
										<span className="text-gray-600">Department:</span>{' '}
										<span className="font-medium">
											{selectedCandidate.employee.department || 'N/A'}
										</span>
									</div>
									<div>
										<span className="text-gray-600">Position:</span>{' '}
										<span className="font-medium">
											{selectedCandidate.employee.position || 'N/A'}
										</span>
									</div>
								</div>
							</div>

							{/* Match Scores */}
							<div className="grid grid-cols-2 gap-4">
								<div className="bg-blue-50 p-4 rounded-lg">
									<p className="text-sm text-gray-600">Skill Index</p>
									<p className="text-3xl font-bold text-blue-600">
										{selectedCandidate.skillIndex.toFixed(1)}
									</p>
								</div>
								<div className="bg-green-50 p-4 rounded-lg">
									<p className="text-sm text-gray-600">Match Percentage</p>
									<p className="text-3xl font-bold text-green-600">
										{selectedCandidate.matchPercentage.toFixed(0)}%
									</p>
								</div>
							</div>

							{/* Matched Skills */}
							<div>
								<h3 className="font-semibold mb-3">Matched Skills</h3>
								<div className="space-y-2">
									{selectedCandidate.matchedSkills.map((ms, idx) => (
										<div
											key={idx}
											className="flex items-center justify-between p-3 bg-gray-50 rounded"
										>
											<div className="flex-1">
												<p className="font-medium">{ms.skill.name}</p>
												<p className="text-xs text-gray-500">{ms.skill.category}</p>
											</div>
											<div className="flex items-center gap-4">
												<div className="text-right">
													<p className="text-xs text-gray-600">Employee Rating</p>
													<p className="font-semibold">{ms.employeeRating}/10</p>
												</div>
												<div className="text-right">
													<p className="text-xs text-gray-600">Required Weight</p>
													<p className="font-semibold">{ms.requiredWeight}</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="flex gap-3 justify-end pt-4 border-t">
								<Button
									variant="outline"
									onClick={() => setIsDetailsDialogOpen(false)}
								>
									Close
								</Button>
								<Button
									onClick={() => {
										setIsDetailsDialogOpen(false)
										openAssignDialog(selectedCandidate)
									}}
								>
									Assign to Project
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Assign Dialog */}
			<Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Assign Employee to Project</DialogTitle>
						<DialogDescription>
							Send assignment request to manager for approval
						</DialogDescription>
					</DialogHeader>

					{selectedCandidate && (
						<div className="space-y-4">
							{error && (
								<div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-sm">
									{error}
								</div>
							)}

							<div className="bg-blue-50 p-4 rounded-lg">
								<p className="font-medium">
									{selectedCandidate.employee.firstName}{' '}
									{selectedCandidate.employee.lastName}
								</p>
								<p className="text-sm text-gray-600">
									Skill Index: {selectedCandidate.skillIndex.toFixed(1)} | Match:{' '}
									{selectedCandidate.matchPercentage.toFixed(0)}%
								</p>
							</div>

							<div>
								<Label htmlFor="comments">Comments (Optional)</Label>
								<textarea
									id="comments"
									value={assignComments}
									onChange={(e) => setAssignComments(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[80px]"
									placeholder="Add any notes for the manager..."
								/>
							</div>

							<div className="flex gap-3 justify-end pt-4">
								<Button
									variant="outline"
									onClick={() => setIsAssignDialogOpen(false)}
									disabled={assigning}
								>
									Cancel
								</Button>
								<Button onClick={handleAssign} disabled={assigning}>
									{assigning ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Assigning...
										</>
									) : (
										<>
											<CheckCircle className="w-4 h-4 mr-2" />
											Send to Manager
										</>
									)}
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</ProtectedRoute>
	)
}
