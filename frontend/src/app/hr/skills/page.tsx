'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Award, Plus, Pencil, Trash2, Search } from 'lucide-react'

interface Skill {
	id: number
	name: string
	category: string
	createdAt: string
}

const CATEGORIES = [
	'Programming',
	'Frontend',
	'Backend',
	'Database',
	'DevOps',
	'Cloud',
	'Mobile',
	'Design',
	'Testing',
	'Security',
	'Management',
	'Communication',
	'Other',
]

export default function HRSkillsPage() {
	const [skills, setSkills] = useState<Skill[]>([])
	const [filteredSkills, setFilteredSkills] = useState<Skill[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [categoryFilter, setCategoryFilter] = useState('all')

	// Dialog states
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)

	// Form states
	const [formData, setFormData] = useState({ name: '', category: '' })
	const [processing, setProcessing] = useState(false)

	useEffect(() => {
		loadSkills()
	}, [])

	useEffect(() => {
		filterSkills()
	}, [skills, searchTerm, categoryFilter])

	const loadSkills = async () => {
		try {
			setLoading(true)
			const data = await apiGet('/skills')
			setSkills(data)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	const filterSkills = () => {
		let filtered = skills

		if (searchTerm) {
			filtered = filtered.filter((skill) =>
				skill.name.toLowerCase().includes(searchTerm.toLowerCase())
			)
		}

		if (categoryFilter !== 'all') {
			filtered = filtered.filter((skill) => skill.category === categoryFilter)
		}

		setFilteredSkills(filtered)
	}

	const handleCreate = async () => {
		if (!formData.name || !formData.category) {
			setError('Please fill in all fields')
			return
		}

		try {
			setProcessing(true)
			setError(null)
			const newSkill = await apiPost('/skills', formData)
			setSkills([...skills, newSkill])
			setIsCreateDialogOpen(false)
			setFormData({ name: '', category: '' })
		} catch (err: any) {
			setError(err.message)
		} finally {
			setProcessing(false)
		}
	}

	const handleEdit = async () => {
		if (!selectedSkill || !formData.name || !formData.category) {
			setError('Please fill in all fields')
			return
		}

		try {
			setProcessing(true)
			setError(null)
			const updatedSkill = await apiPut(`/skills/${selectedSkill.id}`, formData)
			setSkills(skills.map((s) => (s.id === selectedSkill.id ? updatedSkill : s)))
			setIsEditDialogOpen(false)
			setSelectedSkill(null)
			setFormData({ name: '', category: '' })
		} catch (err: any) {
			setError(err.message)
		} finally {
			setProcessing(false)
		}
	}

	const handleDelete = async () => {
		if (!selectedSkill) return

		try {
			setProcessing(true)
			setError(null)
			await apiDelete(`/skills/${selectedSkill.id}`)
			setSkills(skills.filter((s) => s.id !== selectedSkill.id))
			setIsDeleteDialogOpen(false)
			setSelectedSkill(null)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setProcessing(false)
		}
	}

	const openCreateDialog = () => {
		setFormData({ name: '', category: '' })
		setError(null)
		setIsCreateDialogOpen(true)
	}

	const openEditDialog = (skill: Skill) => {
		setSelectedSkill(skill)
		setFormData({ name: skill.name, category: skill.category })
		setError(null)
		setIsEditDialogOpen(true)
	}

	const openDeleteDialog = (skill: Skill) => {
		setSelectedSkill(skill)
		setError(null)
		setIsDeleteDialogOpen(true)
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
			Security: 'bg-gray-100 text-gray-800',
			Management: 'bg-cyan-100 text-cyan-800',
			Communication: 'bg-lime-100 text-lime-800',
		}
		return colors[category] || 'bg-gray-100 text-gray-800'
	}

	if (loading) {
		return (
			<ProtectedRoute allowedRoles={['HR']}>
				<Navigation />
				<div className="container mx-auto px-4 py-8 text-center">
					Loading skills...
				</div>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute allowedRoles={['HR']}>
			<Navigation />
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Skills Management</h1>
					<p className="text-gray-600">
						Add, edit, and organize skills in the database
					</p>
				</div>

				{error && !isCreateDialogOpen && !isEditDialogOpen && !isDeleteDialogOpen && (
					<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6">
						{error}
					</div>
				)}

				{/* Summary Cards */}
				<div className="grid md:grid-cols-3 gap-4 mb-6">
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold">{skills.length}</p>
							<p className="text-sm text-gray-600">Total Skills</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold">
								{new Set(skills.map((s) => s.category)).size}
							</p>
							<p className="text-sm text-gray-600">Categories</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold">{filteredSkills.length}</p>
							<p className="text-sm text-gray-600">Filtered Results</p>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<Award className="w-5 h-5 text-purple-600" />
								Skills Database
							</CardTitle>
							<Button onClick={openCreateDialog}>
								<Plus className="w-4 h-4 mr-2" />
								Add Skill
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{/* Filters */}
						<div className="flex gap-4 mb-6">
							<div className="flex-1">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input
										placeholder="Search skills..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10"
									/>
								</div>
							</div>
							<div className="w-48">
								<Select value={categoryFilter} onValueChange={setCategoryFilter}>
									<SelectTrigger>
										<SelectValue placeholder="Category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Categories</SelectItem>
										{CATEGORIES.map((cat) => (
											<SelectItem key={cat} value={cat}>
												{cat}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Skills Table */}
						{filteredSkills.length === 0 ? (
							<div className="text-center py-12">
								<Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-600 text-lg font-medium">No skills found</p>
								<p className="text-gray-500 text-sm">
									{skills.length === 0
										? 'Add your first skill to get started'
										: 'Try adjusting your filters'}
								</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Skill Name</TableHead>
										<TableHead>Category</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredSkills.map((skill) => (
										<TableRow key={skill.id}>
											<TableCell className="font-medium">{skill.name}</TableCell>
											<TableCell>
												<Badge className={getCategoryColor(skill.category)}>
													{skill.category}
												</Badge>
											</TableCell>
											<TableCell className="text-sm text-gray-600">
												{new Date(skill.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														size="sm"
														variant="outline"
														onClick={() => openEditDialog(skill)}
													>
														<Pencil className="w-4 h-4" />
													</Button>
													<Button
														size="sm"
														variant="outline"
														onClick={() => openDeleteDialog(skill)}
														className="text-red-600 hover:bg-red-50"
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Create Dialog */}
			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add New Skill</DialogTitle>
						<DialogDescription>
							Create a new skill in the database
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{error && (
							<div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-sm">
								{error}
							</div>
						)}
						<div>
							<Label htmlFor="name">Skill Name</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="e.g., TypeScript"
							/>
						</div>
						<div>
							<Label htmlFor="category">Category</Label>
							<Select
								value={formData.category}
								onValueChange={(value) =>
									setFormData({ ...formData, category: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									{CATEGORIES.map((cat) => (
										<SelectItem key={cat} value={cat}>
											{cat}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex gap-3 justify-end pt-4">
							<Button
								variant="outline"
								onClick={() => setIsCreateDialogOpen(false)}
								disabled={processing}
							>
								Cancel
							</Button>
							<Button onClick={handleCreate} disabled={processing}>
								{processing ? 'Creating...' : 'Create Skill'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Skill</DialogTitle>
						<DialogDescription>Update skill information</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{error && (
							<div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-sm">
								{error}
							</div>
						)}
						<div>
							<Label htmlFor="edit-name">Skill Name</Label>
							<Input
								id="edit-name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
							/>
						</div>
						<div>
							<Label htmlFor="edit-category">Category</Label>
							<Select
								value={formData.category}
								onValueChange={(value) =>
									setFormData({ ...formData, category: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									{CATEGORIES.map((cat) => (
										<SelectItem key={cat} value={cat}>
											{cat}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex gap-3 justify-end pt-4">
							<Button
								variant="outline"
								onClick={() => setIsEditDialogOpen(false)}
								disabled={processing}
							>
								Cancel
							</Button>
							<Button onClick={handleEdit} disabled={processing}>
								{processing ? 'Updating...' : 'Update Skill'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Skill</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this skill?
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{error && (
							<div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-sm">
								{error}
							</div>
						)}
						{selectedSkill && (
							<div className="bg-gray-50 p-4 rounded">
								<p className="font-medium">{selectedSkill.name}</p>
								<p className="text-sm text-gray-600">{selectedSkill.category}</p>
							</div>
						)}
						<p className="text-sm text-gray-600">
							This action cannot be undone. This will permanently delete the skill from
							the database.
						</p>
						<div className="flex gap-3 justify-end pt-4">
							<Button
								variant="outline"
								onClick={() => setIsDeleteDialogOpen(false)}
								disabled={processing}
							>
								Cancel
							</Button>
							<Button
								variant="outline"
								onClick={handleDelete}
								disabled={processing}
								className="text-red-600 hover:bg-red-50"
							>
								{processing ? 'Deleting...' : 'Delete Skill'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</ProtectedRoute>
	)
}
