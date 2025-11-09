'use client'
import RequireAuth from '@/components/RequireAuth'
import TopNav from '@/components/TopNav'
import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import { Building, Plus, Edit, Trash2, RefreshCw, MapPin, Briefcase, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

type Company = {
	id: number
	name: string
	industry?: string
	location?: string
	createdAt: string
	_count?: {
		employees: number
	}
}

export default function CompaniesPage() {
	const [companies, setCompanies] = useState<Company[]>([])
	const [loading, setLoading] = useState(true)
	const [creating, setCreating] = useState(false)
	const [updating, setUpdating] = useState(false)
	const [deleting, setDeleting] = useState<number | null>(null)
	const [showCreateDialog, setShowCreateDialog] = useState(false)
	const [showEditDialog, setShowEditDialog] = useState(false)
	const [form, setForm] = useState({
		name: '',
		industry: '',
		location: '',
	})
	const [editingCompany, setEditingCompany] = useState<Company | null>(null)

	useEffect(() => {
		load()
	}, [])

	const load = async () => {
		try {
			setLoading(true)
			const data = await apiGet('/companies')
			setCompanies(data)
		} catch (error) {
			console.error('Failed to load companies:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleCreate = async () => {
		if (!form.name.trim()) return
		
		try {
			setCreating(true)
			await apiPost('/companies', {
				name: form.name.trim(),
				industry: form.industry.trim() || undefined,
				location: form.location.trim() || undefined
			})
			setForm({ name: '', industry: '', location: '' })
			setShowCreateDialog(false)
			await load()
		} catch (error) {
			console.error('Failed to create company:', error)
		} finally {
			setCreating(false)
		}
	}

	const handleEdit = (company: Company) => {
		setEditingCompany(company)
		setForm({
			name: company.name,
			industry: company.industry || '',
			location: company.location || ''
		})
		setShowEditDialog(true)
	}

	const handleUpdate = async () => {
		if (!editingCompany || !form.name.trim()) return
		
		try {
			setUpdating(true)
			await apiPut(`/companies/${editingCompany.id}`, {
				name: form.name.trim(),
				industry: form.industry.trim() || undefined,
				location: form.location.trim() || undefined
			})
			setForm({ name: '', industry: '', location: '' })
			setEditingCompany(null)
			setShowEditDialog(false)
			await load()
		} catch (error) {
			console.error('Failed to update company:', error)
		} finally {
			setUpdating(false)
		}
	}

	const handleDelete = async (id: number) => {
		if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
			return
		}
		
		try {
			setDeleting(id)
			await apiDelete(`/companies/${id}`)
			await load()
		} catch (error) {
			console.error('Failed to delete company:', error)
		} finally {
			setDeleting(null)
		}
	}

	const resetForm = () => {
		setForm({ name: '', industry: '', location: '' })
		setEditingCompany(null)
	}

	if (loading) {
		return (
			<RequireAuth role="ADMIN">
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
		<RequireAuth role="ADMIN">
			<div className="min-h-screen bg-gray-50">
				<TopNav />
				
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Header */}
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Companies</h1>
							<p className="mt-2 text-gray-600">Manage company profiles and information</p>
						</div>
						<div className="flex items-center space-x-3 mt-4 sm:mt-0">
							<Button
								variant="outline"
								size="sm"
								onClick={load}
								disabled={loading}
							>
								<RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
								Refresh
							</Button>
							<Dialog open={showCreateDialog} onOpenChange={(open) => {
								setShowCreateDialog(open)
								if (!open) resetForm()
							}}>
								<DialogTrigger asChild>
									<Button size="sm">
										<Plus className="h-4 w-4 mr-2" />
										Add Company
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Add New Company</DialogTitle>
									</DialogHeader>
									<div className="space-y-4">
										<div>
											<Label htmlFor="companyName">Company Name *</Label>
											<Input
												id="companyName"
												placeholder="e.g., Acme Corporation"
												value={form.name}
												onChange={(e) => setForm({...form, name: e.target.value})}
											/>
										</div>
										<div>
											<Label htmlFor="industry">Industry</Label>
											<Input
												id="industry"
												placeholder="e.g., Technology, Healthcare"
												value={form.industry}
												onChange={(e) => setForm({...form, industry: e.target.value})}
											/>
										</div>
										<div>
											<Label htmlFor="location">Location</Label>
											<Input
												id="location"
												placeholder="e.g., New York, NY"
												value={form.location}
												onChange={(e) => setForm({...form, location: e.target.value})}
											/>
										</div>
										<Button 
											onClick={handleCreate}
											disabled={!form.name.trim() || creating}
											className="w-full"
										>
											{creating ? 'Creating...' : 'Create Company'}
										</Button>
									</div>
								</DialogContent>
							</Dialog>
						</div>
					</div>

					{/* Companies Grid */}
					{companies.length === 0 ? (
						<Card>
							<CardContent className="p-12 text-center">
								<Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">No companies yet</h3>
								<p className="text-gray-600 mb-4">Create your first company to get started.</p>
								<Button onClick={() => setShowCreateDialog(true)}>
									<Plus className="h-4 w-4 mr-2" />
									Add Your First Company
								</Button>
							</CardContent>
						</Card>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{companies.map((company) => (
								<Card key={company.id} className="hover:shadow-lg transition-shadow duration-200">
									<CardContent className="p-6">
										<div className="flex items-start justify-between mb-4">
											<div className="flex items-center space-x-3">
												<div className="p-2 bg-indigo-100 rounded-lg">
													<Building className="h-6 w-6 text-indigo-600" />
												</div>
												<div>
													<h3 className="font-semibold text-gray-900">{company.name}</h3>
													{company.industry && (
														<Badge variant="secondary" className="mt-1">
															<Briefcase className="h-3 w-3 mr-1" />
															{company.industry}
														</Badge>
													)}
												</div>
											</div>
											<div className="flex space-x-1">
												<Button
													size="sm"
													variant="ghost"
													onClick={() => handleEdit(company)}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													size="sm"
													variant="ghost"
													onClick={() => handleDelete(company.id)}
													disabled={deleting === company.id}
													className="text-red-600 hover:text-red-700 hover:bg-red-50"
												>
													{deleting === company.id ? (
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
													) : (
														<Trash2 className="h-4 w-4" />
													)}
												</Button>
											</div>
										</div>
										
										<div className="space-y-3">
											{company.location && (
												<div className="flex items-center text-sm text-gray-600">
													<MapPin className="h-4 w-4 mr-2" />
													{company.location}
												</div>
											)}
											<div className="flex items-center text-sm text-gray-600">
												<Users className="h-4 w-4 mr-2" />
												{company._count?.employees || 0} employees
											</div>
											<div className="text-xs text-gray-500">
												Created {new Date(company.createdAt).toLocaleDateString()}
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}

					{/* Edit Dialog */}
					<Dialog open={showEditDialog} onOpenChange={(open) => {
						setShowEditDialog(open)
						if (!open) resetForm()
					}}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Edit Company</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
								<div>
									<Label htmlFor="editCompanyName">Company Name *</Label>
									<Input
										id="editCompanyName"
										placeholder="e.g., Acme Corporation"
										value={form.name}
										onChange={(e) => setForm({...form, name: e.target.value})}
									/>
								</div>
								<div>
									<Label htmlFor="editIndustry">Industry</Label>
									<Input
										id="editIndustry"
										placeholder="e.g., Technology, Healthcare"
										value={form.industry}
										onChange={(e) => setForm({...form, industry: e.target.value})}
									/>
								</div>
								<div>
									<Label htmlFor="editLocation">Location</Label>
									<Input
										id="editLocation"
										placeholder="e.g., New York, NY"
										value={form.location}
										onChange={(e) => setForm({...form, location: e.target.value})}
									/>
								</div>
								<div className="flex space-x-2">
									<Button 
										onClick={handleUpdate}
										disabled={!form.name.trim() || updating}
										className="flex-1"
									>
										{updating ? 'Updating...' : 'Update Company'}
									</Button>
									<Button 
										variant="outline"
										onClick={() => setShowEditDialog(false)}
										className="flex-1"
									>
										Cancel
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</RequireAuth>
	)
}
