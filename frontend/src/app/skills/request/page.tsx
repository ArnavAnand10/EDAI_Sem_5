'use client'
import RequireAuth from '@/components/RequireAuth'
import TopNav from '@/components/TopNav'
import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Trophy, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

type Skill = {
	id: number
	name: string
	category?: string
}

type EmployeeSkill = {
	id: number
	level: string
	status: string
	requestedAt: string
	skill: Skill
}

export default function RequestSkillPage() {
	const router = useRouter()
	const [skills, setSkills] = useState<Skill[]>([])
	const [mySkills, setMySkills] = useState<EmployeeSkill[]>([])
	const [selectedSkill, setSelectedSkill] = useState('')
	const [selectedLevel, setSelectedLevel] = useState('')
	const [loading, setLoading] = useState(true)
	const [requesting, setRequesting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	useEffect(() => {
		loadData()
	}, [])

	const loadData = async () => {
		try {
			setLoading(true)
			const [allSkills, userSkills] = await Promise.all([
				apiGet('/skills'),
				apiGet('/skills/my')
			])
			setSkills(allSkills)
			setMySkills(userSkills)
		} catch (error) {
			console.error('Failed to load data:', error)
			setError('Failed to load skills data')
		} finally {
			setLoading(false)
		}
	}

	const handleRequestSkill = async () => {
		if (!selectedSkill || !selectedLevel) {
			setError('Please select both a skill and level')
			return
		}

		try {
			setRequesting(true)
			setError(null)
			await apiPost('/skills/request', {
				skillId: parseInt(selectedSkill),
				level: selectedLevel
			})
			setSuccess('Skill request submitted successfully!')
			setSelectedSkill('')
			setSelectedLevel('')
			await loadData()
		} catch (error: any) {
			setError(error.message || 'Failed to submit skill request')
		} finally {
			setRequesting(false)
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'APPROVED': return 'bg-green-100 text-green-800'
			case 'REJECTED': return 'bg-red-100 text-red-800'
			default: return 'bg-yellow-100 text-yellow-800'
		}
	}

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'APPROVED': return <CheckCircle className="h-4 w-4 text-green-600" />
			case 'REJECTED': return <AlertCircle className="h-4 w-4 text-red-600" />
			default: return <Clock className="h-4 w-4 text-yellow-600" />
		}
	}

	// Filter out skills that are already requested
	const requestedSkillIds = new Set(mySkills.map(ms => ms.skill.id))
	const availableSkills = skills.filter(skill => !requestedSkillIds.has(skill.id))

	if (loading) {
		return (
			<RequireAuth role="EMPLOYEE">
				<div className="min-h-screen bg-gray-50">
					<TopNav />
					<div className="flex items-center justify-center h-96">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
					</div>
				</div>
			</RequireAuth>
		)
	}

	return (
		<RequireAuth role="EMPLOYEE">
			<div className="min-h-screen bg-gray-50">
				<TopNav />
				
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Header */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900">Request New Skill</h1>
						<p className="mt-2 text-gray-600">
							Request a new skill to add to your profile. Your request will need approval from your administrator.
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Request Form */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<Plus className="h-5 w-5 text-indigo-600" />
									<span>New Skill Request</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								{error && (
									<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
										<AlertCircle className="h-4 w-4 mr-2" />
										{error}
									</div>
								)}

								{success && (
									<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
										<CheckCircle className="h-4 w-4 mr-2" />
										{success}
									</div>
								)}

								<div className="space-y-2">
									<Label htmlFor="skill">Select Skill</Label>
									<Select value={selectedSkill} onValueChange={setSelectedSkill}>
										<SelectTrigger>
											<SelectValue placeholder="Choose a skill to request" />
										</SelectTrigger>
										<SelectContent>
											{availableSkills.length === 0 ? (
												<SelectItem value="none" disabled>
													No skills available to request
												</SelectItem>
											) : (
												availableSkills.map(skill => (
													<SelectItem key={skill.id} value={skill.id.toString()}>
														{skill.name}
														{skill.category && (
															<span className="text-gray-500 ml-2">({skill.category})</span>
														)}
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="level">Your Level</Label>
									<Select value={selectedLevel} onValueChange={setSelectedLevel}>
										<SelectTrigger>
											<SelectValue placeholder="Select your proficiency level" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Beginner">
												<div className="flex flex-col">
													<span className="font-medium">Beginner</span>
													<span className="text-sm text-gray-500">Just starting to learn</span>
												</div>
											</SelectItem>
											<SelectItem value="Intermediate">
												<div className="flex flex-col">
													<span className="font-medium">Intermediate</span>
													<span className="text-sm text-gray-500">Some experience and practice</span>
												</div>
											</SelectItem>
											<SelectItem value="Advanced">
												<div className="flex flex-col">
													<span className="font-medium">Advanced</span>
													<span className="text-sm text-gray-500">Proficient with deep knowledge</span>
												</div>
											</SelectItem>
											<SelectItem value="Expert">
												<div className="flex flex-col">
													<span className="font-medium">Expert</span>
													<span className="text-sm text-gray-500">Master level with extensive experience</span>
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<Button
									onClick={handleRequestSkill}
									disabled={!selectedSkill || !selectedLevel || requesting || availableSkills.length === 0}
									className="w-full"
								>
									{requesting ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											Submitting Request...
										</>
									) : (
										<>
											<Plus className="h-4 w-4 mr-2" />
											Submit Request
										</>
									)}
								</Button>

								{availableSkills.length === 0 && (
									<div className="text-center py-4">
										<Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
										<p className="text-sm text-gray-600">
											You've already requested all available skills!
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* My Skill Requests */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<Trophy className="h-5 w-5 text-indigo-600" />
									<span>My Skill Requests</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{mySkills.length === 0 ? (
									<div className="text-center py-8">
										<Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
										<h3 className="text-lg font-medium text-gray-900 mb-2">No skill requests yet</h3>
										<p className="text-gray-600">
											Submit your first skill request to get started!
										</p>
									</div>
								) : (
									<div className="space-y-3">
										{mySkills.map((skill) => (
											<div key={skill.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
												<div className="flex items-center space-x-3">
													{getStatusIcon(skill.status)}
													<div>
														<h4 className="font-medium text-gray-900">{skill.skill.name}</h4>
														<div className="flex items-center space-x-2 text-sm text-gray-600">
															<span>Level: {skill.level}</span>
															<span>•</span>
															<span>{new Date(skill.requestedAt).toLocaleDateString()}</span>
														</div>
													</div>
												</div>
												<Badge className={getStatusColor(skill.status)}>
													{skill.status}
												</Badge>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Quick Actions */}
					<div className="mt-8 flex justify-center space-x-4">
						<Button variant="outline" onClick={() => router.push('/dashboard')}>
							Back to Dashboard
						</Button>
						<Button variant="outline" onClick={() => router.push('/skills')}>
							Browse All Skills
						</Button>
					</div>
				</div>
			</div>
		</RequireAuth>
	)
}
