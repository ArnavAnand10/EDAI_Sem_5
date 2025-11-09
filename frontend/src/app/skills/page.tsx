'use client'
import RequireAuth from '@/components/RequireAuth'
import TopNav from '@/components/TopNav'
import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import {
	Search,
	Plus,
	Trophy,
	Filter,
	RefreshCw,
	Tag,
	Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

type Skill = {
	id: number
	name: string
	category?: string
	createdAt: string
	_count?: {
		employeeSkills: number
	}
}

export default function SkillsPage() {
	const [skills, setSkills] = useState<Skill[]>([])
	const [me, setMe] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [creating, setCreating] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('')
	const [showCreateDialog, setShowCreateDialog] = useState(false)
	const [newSkill, setNewSkill] = useState({
		name: '',
		category: '',
	})

	useEffect(() => {
		load()
		loadMe()
	}, [])

	const load = async () => {
		try {
			setLoading(true)
			const data = await apiGet('/skills')
			setSkills(data)
		} catch (error) {
			console.error('Failed to load skills:', error)
			setSkills([])
		} finally {
			setLoading(false)
		}
	}

	const loadMe = async () => {
		try {
			const userData = await apiGet('/users/me')
			setMe(userData)
		} catch (error) {
			console.error('Failed to load user:', error)
		}
	}

	const handleCreateSkill = async () => {
		if (!newSkill.name.trim()) return

		try {
			setCreating(true)
			await apiPost('/skills', {
				name: newSkill.name.trim(),
				category: newSkill.category.trim() || undefined,
			})
			setNewSkill({ name: '', category: '' })
			setShowCreateDialog(false)
			await load()
		} catch (error) {
			console.error('Failed to create skill:', error)
		} finally {
			setCreating(false)
		}
	}

	const requestSkill = async (skillId: number) => {
		try {
			await apiPost('/skills/request', { skillId, level: 'Beginner' })
			// after requesting, reload skills/my to reflect any changes if needed
			await load()
		} catch (error) {
			console.error('Failed to request skill:', error)
		}
	}

	// Filter skills based on search and category
	const filteredSkills = skills.filter((skill) => {
		const matchesSearch =
			skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(skill.category &&
				skill.category.toLowerCase().includes(searchTerm.toLowerCase()))
		const matchesCategory =
			!selectedCategory || skill.category === selectedCategory
		return matchesSearch && matchesCategory
	})

	// Get unique categories
	const categories = Array.from(
		new Set(skills.map((s) => s.category).filter(Boolean))
	)

	return (
		<RequireAuth>
			<div className="min-h-screen bg-gray-50">
				<TopNav />

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Header */}
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								Skills Library
							</h1>
							<p className="mt-2 text-gray-600">
								{me?.role === 'ADMIN'
									? 'Manage and create skills for your organization'
									: 'Browse available skills and their requirements'}
							</p>
						</div>
						<div className="flex items-center space-x-3 mt-4 sm:mt-0">
							<Button
								variant="outline"
								size="sm"
								onClick={load}
								disabled={loading}
							>
								<RefreshCw
									className={`h-4 w-4 mr-2 ${
										loading ? 'animate-spin' : ''
									}`}
								/>
								Refresh
							</Button>
							{me?.role === 'ADMIN' && (
								<Dialog
									open={showCreateDialog}
									onOpenChange={setShowCreateDialog}
								>
									<DialogTrigger asChild>
										<Button size="sm">
											<Plus className="h-4 w-4 mr-2" />
											Add Skill
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>
												Create New Skill
											</DialogTitle>
										</DialogHeader>
										<div className="space-y-4">
											<div>
												<Label htmlFor="skillName">
													Skill Name
												</Label>
												<Input
													id="skillName"
													placeholder="e.g., React.js, Project Management"
													value={newSkill.name}
													onChange={(e) =>
														setNewSkill({
															...newSkill,
															name: e.target
																.value,
														})
													}
												/>
											</div>
											<div>
												<Label htmlFor="skillCategory">
													Category (Optional)
												</Label>
												<Input
													id="skillCategory"
													placeholder="e.g., Frontend, Leadership, Design"
													value={newSkill.category}
													onChange={(e) =>
														setNewSkill({
															...newSkill,
															category:
																e.target.value,
														})
													}
												/>
											</div>
											<Button
												onClick={handleCreateSkill}
												disabled={
													!newSkill.name.trim() ||
													creating
												}
												className="w-full"
											>
												{creating
													? 'Creating...'
													: 'Create Skill'}
											</Button>
										</div>
									</DialogContent>
								</Dialog>
							)}
						</div>
					</div>

					{/* Search and Filter */}
					<Card className="mb-6">
						<CardContent className="p-6">
							<div className="flex flex-col sm:flex-row gap-4">
								<div className="flex-1">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
										<Input
											placeholder="Search skills..."
											value={searchTerm}
											onChange={(e) =>
												setSearchTerm(e.target.value)
											}
											className="pl-10"
										/>
									</div>
								</div>
								<div className="sm:w-48">
									<select
										value={selectedCategory}
										onChange={(e) =>
											setSelectedCategory(e.target.value)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
									>
										<option value="">All Categories</option>
										{categories.map((category) => (
											<option
												key={category}
												value={category}
											>
												{category}
											</option>
										))}
									</select>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Skills Grid */}
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
						</div>
					) : filteredSkills.length === 0 ? (
						<Card>
							<CardContent className="p-12 text-center">
								<Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									{searchTerm || selectedCategory
										? 'No skills match your filters'
										: 'No skills available'}
								</h3>
								<p className="text-gray-600 mb-4">
									{searchTerm || selectedCategory
										? 'Try adjusting your search or filter criteria.'
										: me?.role === 'ADMIN'
										? 'Create your first skill to get started.'
										: 'Skills will appear here when administrators add them.'}
								</p>
								{(searchTerm || selectedCategory) && (
									<Button
										variant="outline"
										onClick={() => {
											setSearchTerm('')
											setSelectedCategory('')
										}}
									>
										Clear Filters
									</Button>
								)}
							</CardContent>
						</Card>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredSkills.map((skill) => (
								<Card
									key={skill.id}
									className="hover:shadow-lg transition-shadow duration-200"
								>
									<CardContent className="p-6">
										<div className="flex items-start justify-between mb-4">
											<div className="flex items-center space-x-2">
												<div className="p-2 bg-indigo-100 rounded-lg">
													<Trophy className="h-5 w-5 text-indigo-600" />
												</div>
												<div>
													<h3 className="font-semibold text-gray-900">
														{skill.name}
													</h3>
													{skill.category && (
														<Badge
															variant="secondary"
															className="mt-1"
														>
															<Tag className="h-3 w-3 mr-1" />
															{skill.category}
														</Badge>
													)}
												</div>
											</div>
										</div>

										<div className="space-y-2">
											<div className="flex items-center text-sm text-gray-600">
												<Users className="h-4 w-4 mr-2" />
												<span>
													{skill._count
														?.employeeSkills ||
														0}{' '}
													employees have this skill
												</span>
											</div>
											<div className="text-xs text-gray-500">
												Added{' '}
												{new Date(
													skill.createdAt
												).toLocaleDateString()}
											</div>
										</div>

										{me?.role === 'EMPLOYEE' && (
											<div className="mt-4">
												<Button
													size="sm"
													variant="outline"
													className="w-full"
													onClick={() =>
														requestSkill(skill.id)
													}
												>
													Request This Skill
												</Button>
											</div>
										)}
									</CardContent>
								</Card>
							))}
						</div>
					)}

					{/* Stats */}
					{!loading && filteredSkills.length > 0 && (
						<div className="mt-8 flex justify-center">
							<div className="text-sm text-gray-600">
								Showing {filteredSkills.length} of{' '}
								{skills.length} skills
								{(searchTerm || selectedCategory) &&
									' (filtered)'}
							</div>
						</div>
					)}
				</div>
			</div>
		</RequireAuth>
	)
}
