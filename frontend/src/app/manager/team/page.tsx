'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
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
import { Users, Award, Filter } from 'lucide-react'

interface TeamRating {
	id: number
	skillId: number
	selfRating: number
	managerRating: number | null
	managerStatus: string
	selfComments?: string
	managerComments?: string
	createdAt: string
	skill: {
		name: string
		category: string
	}
	employee: {
		id: number
		firstName: string
		lastName: string
		position?: string
	}
}

export default function ManagerTeamPage() {
	const [ratings, setRatings] = useState<TeamRating[]>([])
	const [filteredRatings, setFilteredRatings] = useState<TeamRating[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [statusFilter, setStatusFilter] = useState<string>('ALL')
	const [employeeFilter, setEmployeeFilter] = useState<string>('ALL')

	useEffect(() => {
		loadTeamRatings()
	}, [])

	useEffect(() => {
		applyFilters()
	}, [ratings, statusFilter, employeeFilter])

	const loadTeamRatings = async () => {
		try {
			setLoading(true)
			const data = await apiGet('/ratings/team')
			setRatings(data)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	const applyFilters = () => {
		let filtered = [...ratings]

		if (statusFilter !== 'ALL') {
			filtered = filtered.filter((r) => r.managerStatus === statusFilter)
		}

		if (employeeFilter !== 'ALL') {
			filtered = filtered.filter((r) => r.employee.id === parseInt(employeeFilter))
		}

		setFilteredRatings(filtered)
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

	const getRatingBar = (rating: number) => {
		const percentage = (rating / 10) * 100
		const color =
			rating >= 8 ? 'bg-green-500' : rating >= 5 ? 'bg-blue-500' : 'bg-yellow-500'
		return (
			<div className="w-full bg-gray-200 rounded-full h-2">
				<div
					className={`${color} h-2 rounded-full`}
					style={{ width: `${percentage}%` }}
				></div>
			</div>
		)
	}

	// Get unique employees
	const employees = Array.from(
		new Map(
			ratings.map((r) => [
				r.employee.id,
				{
					id: r.employee.id,
					name: `${r.employee.firstName} ${r.employee.lastName}`,
				},
			])
		).values()
	)

	// Calculate stats
	const stats = {
		total: ratings.length,
		pending: ratings.filter((r) => r.managerStatus === 'PENDING').length,
		approved: ratings.filter((r) => r.managerStatus === 'APPROVED').length,
		rejected: ratings.filter((r) => r.managerStatus === 'REJECTED').length,
	}

	if (loading) {
		return (
			<ProtectedRoute allowedRoles={['MANAGER']}>
				<Navigation />
				<div className="container mx-auto px-4 py-8 text-center">
					Loading team ratings...
				</div>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute allowedRoles={['MANAGER']}>
			<Navigation />
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Team Skill Ratings</h1>
					<p className="text-gray-600">
						View all skill ratings for your team members
					</p>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6">
						{error}
					</div>
				)}

				{/* Stats Cards */}
				<div className="grid md:grid-cols-4 gap-4 mb-6">
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold">{stats.total}</p>
							<p className="text-sm text-gray-600">Total Ratings</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold text-yellow-600">
								{stats.pending}
							</p>
							<p className="text-sm text-gray-600">Pending</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold text-green-600">
								{stats.approved}
							</p>
							<p className="text-sm text-gray-600">Approved</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold text-red-600">
								{stats.rejected}
							</p>
							<p className="text-sm text-gray-600">Rejected</p>
						</CardContent>
					</Card>
				</div>

				{/* Filters */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Filter className="w-5 h-5" />
							Filters
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-3 gap-4">
							<div>
								<label className="text-sm font-medium mb-2 block">
									Status
								</label>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ALL">All Status</SelectItem>
										<SelectItem value="PENDING">Pending</SelectItem>
										<SelectItem value="APPROVED">Approved</SelectItem>
										<SelectItem value="REJECTED">Rejected</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<label className="text-sm font-medium mb-2 block">
									Employee
								</label>
								<Select value={employeeFilter} onValueChange={setEmployeeFilter}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ALL">All Employees</SelectItem>
										{employees.map((emp) => (
											<SelectItem key={emp.id} value={emp.id.toString()}>
												{emp.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="flex items-end">
								<Button
									variant="outline"
									onClick={() => {
										setStatusFilter('ALL')
										setEmployeeFilter('ALL')
									}}
									className="w-full"
								>
									Clear Filters
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Ratings Table */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Award className="w-5 h-5 text-blue-600" />
							All Ratings ({filteredRatings.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						{filteredRatings.length === 0 ? (
							<div className="text-center py-12">
								<Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-600">
									{ratings.length === 0
										? 'No team ratings yet'
										: 'No ratings match your filters'}
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Employee</TableHead>
											<TableHead>Skill</TableHead>
											<TableHead>Category</TableHead>
											<TableHead>Self Rating</TableHead>
											<TableHead>Manager Rating</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Date</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredRatings.map((rating) => (
											<TableRow key={rating.id}>
												<TableCell>
													<div>
														<p className="font-medium">
															{rating.employee.firstName}{' '}
															{rating.employee.lastName}
														</p>
														<p className="text-xs text-gray-500">
															{rating.employee.position || 'Employee'}
														</p>
													</div>
												</TableCell>
												<TableCell className="font-medium">
													{rating.skill.name}
												</TableCell>
												<TableCell>
													<Badge variant="outline">
														{rating.skill.category}
													</Badge>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-3">
														<span className="font-semibold w-6">
															{rating.selfRating}
														</span>
														<div className="w-20">
															{getRatingBar(rating.selfRating)}
														</div>
													</div>
												</TableCell>
												<TableCell>
													{rating.managerRating ? (
														<div className="flex items-center gap-3">
															<span className="font-semibold w-6">
																{rating.managerRating}
															</span>
															<div className="w-20">
																{getRatingBar(rating.managerRating)}
															</div>
														</div>
													) : (
														<span className="text-gray-400">-</span>
													)}
												</TableCell>
												<TableCell>{getStatusBadge(rating.managerStatus)}</TableCell>
												<TableCell className="text-sm text-gray-600">
													{new Date(rating.createdAt).toLocaleDateString()}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</ProtectedRoute>
	)
}
