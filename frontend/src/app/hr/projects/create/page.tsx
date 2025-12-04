'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { apiPost, apiGet } from '@/lib/api'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Sparkles, Briefcase, Award, Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GeneratedSkill {
	skillName: string
	category: string
	weight: number
}

interface AIResponse {
	projectName: string
	description: string
	requiredSkills: GeneratedSkill[]
}

export default function CreateProjectPage() {
	const router = useRouter()
	const [prompt, setPrompt] = useState('')
	const [loading, setLoading] = useState(false)
	const [generating, setGenerating] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
	const [editedProject, setEditedProject] = useState({
		name: '',
		description: '',
	})
	const [editedSkills, setEditedSkills] = useState<GeneratedSkill[]>([])

	// Candidate selection state (single declaration)

		// Candidate selection state and functions
		const [createdProjectId, setCreatedProjectId] = useState<number | null>(null);
		const [candidates, setCandidates] = useState<any[]>([]);
		const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
		const [assigning, setAssigning] = useState(false);

		const fetchCandidates = async (projectId: number) => {
			try {
				// Use apiGet for fetching candidates (GET request)
				const res = await apiGet(`/projects/${projectId}/candidates`);
				setCandidates(res.candidates || []);
			} catch (err) {
				setError('Failed to fetch candidates');
			}
		};

		const handleGenerate = async () => {
			if (!prompt.trim()) {
				setError('Please enter a project description');
				return;
			}
			try {
				setGenerating(true);
				setError(null);
				setAiResponse(null);
				const response = await apiPost('/projects/generate', {
					prompt: prompt.trim(),
				});
				setAiResponse(response);
				setEditedProject({
					name: response.projectName,
					description: response.description,
				});
				setEditedSkills(response.requiredSkills);
			} catch (err: any) {
				setError(err.message || 'Failed to generate project');
			} finally {
				setGenerating(false);
			}
		};
	const handleCreateProject = async () => {
		if (!editedProject.name || !editedProject.description) {
			setError('Please fill in project name and description')
			return
		}

		if (editedSkills.length === 0) {
			setError('Please add at least one required skill')
			return
		}

		try {
			setLoading(true)
			setError(null)

			const result = await apiPost('/projects', {
				name: editedProject.name,
				description: editedProject.description,
				requiredSkills: editedSkills,
			})

			setCreatedProjectId(result.project.id)
			await fetchCandidates(result.project.id)
		} catch (err: any) {
			setError(err.message || 'Failed to create project')
		} finally {
			setLoading(false)
		}
	}

	const updateSkillWeight = (index: number, newWeight: number) => {
		const updated = [...editedSkills]
		updated[index].weight = Math.max(1, Math.min(10, newWeight))
		setEditedSkills(updated)
	}

	const removeSkill = (index: number) => {
		setEditedSkills(editedSkills.filter((_, i) => i !== index))
	}

	const getCategoryColor = (category: string) => {
		const colors: Record<string, string> = {
			Programming: 'bg-blue-100 text-blue-800',
			Frontend: 'bg-purple-100 text-purple-800',
			Backend: 'bg-green-100 text-green-800',
			Database: 'bg-yellow-100 text-yellow-800',
			DevOps: 'bg-red-100 text-red-800',
			Cloud: 'bg-indigo-100 text-indigo-800',
			Mobile: 'bg-pink-100 text-pink-800',
			Design: 'bg-orange-100 text-orange-800',
			Testing: 'bg-teal-100 text-teal-800',
		}
		return colors[category] || 'bg-gray-100 text-gray-800'
	}


	if (createdProjectId) {
		// Handler for assigning employees
		const handleAssignEmployees = async () => {
			setAssigning(true);
			setError(null);
			setSuccess(false);
			try {
				await apiPost(`/projects/${createdProjectId}/select-employees`, {
					employeeIds: selectedEmployeeIds,
				});
				setSuccess(true);
				setSelectedEmployeeIds([]);
				// Optionally, you can refetch candidates or redirect
			} catch (err: any) {
				setError(err.message || 'Failed to assign employees');
			} finally {
				setAssigning(false);
			}
		};
		return (
			<ProtectedRoute allowedRoles={['HR']}>
				<Navigation />
				<div className="container mx-auto px-4 py-8 max-w-4xl">
					<h2 className="text-2xl font-bold mb-4">Select Employees for Assignment</h2>
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6">{error}</div>
					)}
					{success && (
						<div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded mb-6">
							<CheckCircle className="inline w-5 h-5 mr-2 text-green-600" />
							Employees assigned successfully! Managers will be notified for approval.
						</div>
					)}
					<div className="mb-6">
						<p className="text-gray-600">Choose employees to assign to this project. Managers will receive approval requests.</p>
					</div>
					<div className="overflow-x-auto mb-6">
						<table className="min-w-full border">
							<thead>
								<tr className="bg-gray-100">
									<th className="px-4 py-2">Select</th>
									<th className="px-4 py-2">Name</th>
									<th className="px-4 py-2">Email</th>
									<th className="px-4 py-2">Department</th>
									<th className="px-4 py-2">Position</th>
									<th className="px-4 py-2">Skill Index</th>
									<th className="px-4 py-2">Match %</th>
								</tr>
							</thead>
							<tbody>
								{candidates.map((c) => (
									<tr key={c.employeeId}>
										<td className="px-4 py-2 text-center">
											<input
												type="checkbox"
												checked={selectedEmployeeIds.includes(c.employeeId)}
												onChange={(e) => {
													if (e.target.checked) {
														setSelectedEmployeeIds([...selectedEmployeeIds, c.employeeId])
													} else {
														setSelectedEmployeeIds(selectedEmployeeIds.filter((id) => id !== c.employeeId))
													}
												}}
											/>
										</td>
										<td className="px-4 py-2">{c.name}</td>
										<td className="px-4 py-2">{c.email}</td>
										<td className="px-4 py-2">{c.department || '-'}</td>
										<td className="px-4 py-2">{c.position || '-'}</td>
										<td className="px-4 py-2">{c.skillIndex}</td>
										<td className="px-4 py-2">{c.matchPercentage}%</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="flex gap-3 justify-end">
						<Button variant="outline" onClick={() => router.push('/hr/projects')}>Cancel</Button>
						<Button onClick={handleAssignEmployees} disabled={selectedEmployeeIds.length === 0 || assigning}>
							{assigning ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Assigning...
								</>
							) : (
								'Assign Selected Employees'
							)}
						</Button>
					</div>
				</div>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute allowedRoles={['HR']}>
			<Navigation />
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Create Project with AI</h1>
					<p className="text-gray-600">
						Describe your project and let AI generate skill requirements
					</p>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6">
						{error}
					</div>
				)}

				{/* AI Generation Card */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Sparkles className="w-5 h-5 text-purple-600" />
							AI Project Generator
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="prompt">Project Description</Label>
							<textarea
								id="prompt"
								value={prompt}
								onChange={(e) => setPrompt(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[120px] mt-1"
								placeholder="Describe your project in detail. For example: 'We need to build a modern e-commerce platform with real-time inventory management, payment processing, and mobile app support. The system should handle high traffic and be scalable.'"
								disabled={generating}
							/>
							<p className="text-xs text-gray-500 mt-1">
								Be specific about technologies, requirements, and project goals
							</p>
						</div>

						<Button
							onClick={handleGenerate}
							disabled={generating || !prompt.trim()}
							className="w-full"
						>
							{generating ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Generating with AI...
								</>
							) : (
								<>
									<Sparkles className="w-4 h-4 mr-2" />
									Generate Project
								</>
							)}
						</Button>
					</CardContent>
				</Card>

				{/* Generated Project Preview */}
				{aiResponse && (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Briefcase className="w-5 h-5 text-blue-600" />
									Project Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="project-name">Project Name</Label>
									<Input
										id="project-name"
										value={editedProject.name}
										onChange={(e) =>
											setEditedProject({ ...editedProject, name: e.target.value })
										}
										placeholder="Project name"
									/>
								</div>
								<div>
									<Label htmlFor="project-description">Description</Label>
									<textarea
										id="project-description"
										value={editedProject.description}
										onChange={(e) =>
											setEditedProject({
												...editedProject,
												description: e.target.value,
											})
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
										placeholder="Project description"
									/>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Award className="w-5 h-5 text-purple-600" />
									Required Skills ({editedSkills.length})
								</CardTitle>
							</CardHeader>
							<CardContent>
								{editedSkills.length === 0 ? (
									<p className="text-gray-500 text-center py-8">
										No skills generated. Try regenerating the project.
									</p>
								) : (
									<div className="space-y-3">
										{editedSkills.map((skill, index) => (
											<div
												key={index}
												className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
											>
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<p className="font-medium">{skill.skillName}</p>
														<Badge className={getCategoryColor(skill.category)}>
															{skill.category}
														</Badge>
													</div>
													<div className="flex items-center gap-3">
														<Label className="text-xs text-gray-600">
															Weight:
														</Label>
														<input
															type="range"
															min="1"
															max="10"
															value={skill.weight}
															onChange={(e) =>
																updateSkillWeight(
																	index,
																	parseInt(e.target.value)
																)
															}
															className="flex-1"
														/>
														<span className="font-semibold text-sm w-8">
															{skill.weight}
														</span>
													</div>
												</div>
												<Button
													size="sm"
													variant="outline"
													onClick={() => removeSkill(index)}
													className="text-red-600 hover:bg-red-50"
												>
													Remove
												</Button>
											</div>
										))}
									</div>
								)}
								<p className="text-xs text-gray-500 mt-4">
									Adjust skill weights (1-10) to indicate importance for the project
								</p>
							</CardContent>
						</Card>

						{/* Action Buttons */}
						<div className="flex gap-3 justify-end">
							<Button
								variant="outline"
								onClick={() => {
									setAiResponse(null)
									setEditedSkills([])
									setError(null)
								}}
								disabled={loading}
							>
								Start Over
							</Button>
							<Button onClick={handleCreateProject} disabled={loading}>
								{loading ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Creating...
									</>
								) : (
									'Create Project & Select Candidates'
								)}
							</Button>
						</div>
					</div>
				)}

				{/* Help Text */}
				{!aiResponse && (
					<Card className="bg-blue-50 border-blue-200">
						<CardContent className="pt-6">
							<h3 className="font-semibold mb-2">How it works:</h3>
							<ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
								<li>Describe your project requirements in detail</li>
								<li>AI will analyze and generate project details with required skills</li>
								<li>Review and adjust skill weights based on importance</li>
								<li>Create the project and proceed to candidate selection</li>
							</ol>
						</CardContent>
					</Card>
				)}
			</div>
		</ProtectedRoute>
	)
}
