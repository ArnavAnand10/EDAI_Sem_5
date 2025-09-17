import React, { useState } from 'react'
import {
	Plus,
	Search,
	Filter,
	MoreHorizontal,
	Edit,
	Trash2,
	Eye,
	Mail,
	Phone,
	MapPin,
	Building,
	Calendar,
	Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

interface Employee {
	id: number
	firstName: string
	lastName: string
	email: string
	department: string
	role: string
	company: string
	joinDate: string
	skillsCount: number
	status: 'active' | 'inactive'
	manager: string
	contactInfo: string
}

interface EmployeesScreenProps {
	employees: Employee[]
	companies: Array<{ id: number; name: string }>
	onAddEmployee: (employee: any) => void
	onEditEmployee: (id: number, employee: any) => void
	onDeleteEmployee: (id: number) => void
}

export default function EmployeesScreen({
	employees,
	companies,
	onAddEmployee,
	onEditEmployee,
	onDeleteEmployee,
}: EmployeesScreenProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedDepartment, setSelectedDepartment] = useState('')
	const [showAddModal, setShowAddModal] = useState(false)
	const [showEditModal, setShowEditModal] = useState(false)
	const [showViewModal, setShowViewModal] = useState(false)
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
		null
	)
	const [showActionMenu, setShowActionMenu] = useState<number | null>(null)

	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		department: '',
		role: '',
		companyId: '',
		manager: '',
		contactInfo: '',
	})

	const departments = [
		'Engineering',
		'Design',
		'Marketing',
		'Sales',
		'HR',
		'Operations',
	]

	const filteredEmployees = employees.filter((employee) => {
		const matchesSearch =
			`${employee.firstName} ${employee.lastName} ${employee.email}`
				.toLowerCase()
				.includes(searchTerm.toLowerCase())
		const matchesDepartment =
			selectedDepartment === '' ||
			employee.department === selectedDepartment
		return matchesSearch && matchesDepartment
	})

	const handleAddEmployee = (e: React.FormEvent) => {
		e.preventDefault()
		onAddEmployee(formData)
		setFormData({
			firstName: '',
			lastName: '',
			email: '',
			department: '',
			role: '',
			companyId: '',
			manager: '',
			contactInfo: '',
		})
		setShowAddModal(false)
	}

	const handleEditEmployee = (e: React.FormEvent) => {
		e.preventDefault()
		if (selectedEmployee) {
			onEditEmployee(selectedEmployee.id, formData)
			setShowEditModal(false)
			setSelectedEmployee(null)
		}
	}

	const openEditModal = (employee: Employee) => {
		setSelectedEmployee(employee)
		setFormData({
			firstName: employee.firstName,
			lastName: employee.lastName,
			email: employee.email,
			department: employee.department,
			role: employee.role,
			companyId: '1', // You'd get this from the employee data
			manager: employee.manager,
			contactInfo: employee.contactInfo,
		})
		setShowEditModal(true)
	}

	const openViewModal = (employee: Employee) => {
		setSelectedEmployee(employee)
		setShowViewModal(true)
	}

	const getStatusBadge = (status: string) => {
		return (
			<Badge variant={status === 'active' ? 'default' : 'secondary'}>
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</Badge>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						Employee Management
					</h1>
					<p className="text-gray-600 mt-1">
						Manage your team members and their information
					</p>
				</div>
				<Button
					onClick={() => setShowAddModal(true)}
					className="mt-4 sm:mt-0"
				>
					<Plus className="w-4 h-4 mr-2" />
					Add Employee
				</Button>
			</div>

			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
					<Input
						placeholder="Search employees..."
						className="pl-10"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<Select
					value={selectedDepartment}
					onValueChange={(value) => setSelectedDepartment(value)}
				>
					<option value="">All Departments</option>
					{departments.map((dept) => (
						<option key={dept} value={dept}>
							{dept}
						</option>
					))}
				</Select>
				<Button variant="outline">
					<Filter className="w-4 h-4 mr-2" />
					Filters
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center">
							<Users className="w-8 h-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
							<div className="ml-3">
								<p className="text-2xl font-bold">
									{employees.length}
								</p>
								<p className="text-sm text-gray-600">
									Total Employees
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center">
							<Building className="w-8 h-8 text-green-600 bg-green-100 rounded-lg p-2" />
							<div className="ml-3">
								<p className="text-2xl font-bold">
									{departments.length}
								</p>
								<p className="text-sm text-gray-600">
									Departments
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center">
							<div className="w-8 h-8 text-yellow-600 bg-yellow-100 rounded-lg p-2 flex items-center justify-center">
								<span className="text-sm font-bold">A</span>
							</div>
							<div className="ml-3">
								<p className="text-2xl font-bold">
									{
										employees.filter(
											(emp) => emp.status === 'active'
										).length
									}
								</p>
								<p className="text-sm text-gray-600">Active</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center">
							<Calendar className="w-8 h-8 text-purple-600 bg-purple-100 rounded-lg p-2" />
							<div className="ml-3">
								<p className="text-2xl font-bold">
									{
										employees.filter((emp) => {
											const joinDate = new Date(
												emp.joinDate
											)
											const oneMonthAgo = new Date()
											oneMonthAgo.setMonth(
												oneMonthAgo.getMonth() - 1
											)
											return joinDate > oneMonthAgo
										}).length
									}
								</p>
								<p className="text-sm text-gray-600">
									New This Month
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Employees</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Employee</TableHead>
									<TableHead>Department</TableHead>
									<TableHead>Company</TableHead>
									<TableHead>Skills</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Join Date</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredEmployees.map((employee) => (
									<TableRow key={employee.id}>
										<TableCell>
											<div className="flex items-center space-x-3">
												<div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
													<span className="text-white text-sm font-medium">
														{employee.firstName.charAt(
															0
														)}
														{employee.lastName.charAt(
															0
														)}
													</span>
												</div>
												<div>
													<p className="font-medium text-gray-900">
														{employee.firstName}{' '}
														{employee.lastName}
													</p>
													<p className="text-sm text-gray-600">
														{employee.email}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline">
												{employee.department}
											</Badge>
										</TableCell>
										<TableCell>
											{employee.company}
										</TableCell>
										<TableCell>
											<div className="flex items-center space-x-1">
												<span className="font-medium">
													{employee.skillsCount}
												</span>
												<span className="text-sm text-gray-500">
													skills
												</span>
											</div>
										</TableCell>
										<TableCell>
											{getStatusBadge(employee.status)}
										</TableCell>
										<TableCell>
											{new Date(
												employee.joinDate
											).toLocaleDateString()}
										</TableCell>
										<TableCell>
											<div className="relative">
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														setShowActionMenu(
															showActionMenu ===
																employee.id
																? null
																: employee.id
														)
													}
												>
													<MoreHorizontal className="w-4 h-4" />
												</Button>

												{showActionMenu ===
													employee.id && (
													<div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border z-10">
														<button
															onClick={() => {
																openViewModal(
																	employee
																)
																setShowActionMenu(
																	null
																)
															}}
															className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
														>
															<Eye className="w-4 h-4 mr-2" />
															View Details
														</button>
														<button
															onClick={() => {
																openEditModal(
																	employee
																)
																setShowActionMenu(
																	null
																)
															}}
															className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
														>
															<Edit className="w-4 h-4 mr-2" />
															Edit
														</button>
														<button
															onClick={() => {
																onDeleteEmployee(
																	employee.id
																)
																setShowActionMenu(
																	null
																)
															}}
															className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
														>
															<Trash2 className="w-4 h-4 mr-2" />
															Delete
														</button>
													</div>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* Add Employee Modal */}
			<Dialog open={showAddModal} onOpenChange={setShowAddModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add New Employee</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleAddEmployee} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="firstName">First Name</Label>
								<Input
									id="firstName"
									value={formData.firstName}
									onChange={(e) =>
										setFormData({
											...formData,
											firstName: e.target.value,
										})
									}
									required
								/>
							</div>
							<div>
								<Label htmlFor="lastName">Last Name</Label>
								<Input
									id="lastName"
									value={formData.lastName}
									onChange={(e) =>
										setFormData({
											...formData,
											lastName: e.target.value,
										})
									}
									required
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) =>
									setFormData({
										...formData,
										email: e.target.value,
									})
								}
								required
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="department">Department</Label>
								<Select
									value={formData.department}
									onValueChange={(value) =>
										setFormData({
											...formData,
											department: value,
										})
									}
									required
								>
									<option value="">Select Department</option>
									{departments.map((dept) => (
										<option key={dept} value={dept}>
											{dept}
										</option>
									))}
								</Select>
							</div>
							<div>
								<Label htmlFor="role">Role</Label>
								<Input
									id="role"
									value={formData.role}
									onChange={(e) =>
										setFormData({
											...formData,
											role: e.target.value,
										})
									}
									required
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="companyId">Company</Label>
							<Select
								value={formData.companyId}
								onValueChange={(value) =>
									setFormData({
										...formData,
										companyId: value,
									})
								}
								required
							>
								<option value="">Select Company</option>
								{companies.map((company) => (
									<option
										key={company.id}
										value={company.id.toString()}
									>
										{company.name}
									</option>
								))}
							</Select>
						</div>
						<div>
							<Label htmlFor="manager">Manager</Label>
							<Input
								id="manager"
								value={formData.manager}
								onChange={(e) =>
									setFormData({
										...formData,
										manager: e.target.value,
									})
								}
							/>
						</div>
						<div>
							<Label htmlFor="contactInfo">Contact Info</Label>
							<Input
								id="contactInfo"
								value={formData.contactInfo}
								onChange={(e) =>
									setFormData({
										...formData,
										contactInfo: e.target.value,
									})
								}
							/>
						</div>
						<div className="flex gap-3 pt-4">
							<Button type="submit" className="flex-1">
								Add Employee
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowAddModal(false)}
							>
								Cancel
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* View Employee Modal */}
			<Dialog open={showViewModal} onOpenChange={setShowViewModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Employee Details</DialogTitle>
					</DialogHeader>
					{selectedEmployee && (
						<div className="space-y-6">
							<div className="flex items-center space-x-4">
								<div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
									<span className="text-white text-xl font-medium">
										{selectedEmployee.firstName.charAt(0)}
										{selectedEmployee.lastName.charAt(0)}
									</span>
								</div>
								<div>
									<h3 className="text-xl font-semibold">
										{selectedEmployee.firstName}{' '}
										{selectedEmployee.lastName}
									</h3>
									<p className="text-gray-600">
										{selectedEmployee.role}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="flex items-center space-x-2">
									<Mail className="w-4 h-4 text-gray-400" />
									<span className="text-sm">
										{selectedEmployee.email}
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<Building className="w-4 h-4 text-gray-400" />
									<span className="text-sm">
										{selectedEmployee.company}
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<Users className="w-4 h-4 text-gray-400" />
									<span className="text-sm">
										{selectedEmployee.department}
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<Calendar className="w-4 h-4 text-gray-400" />
									<span className="text-sm">
										{new Date(
											selectedEmployee.joinDate
										).toLocaleDateString()}
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<Phone className="w-4 h-4 text-gray-400" />
									<span className="text-sm">
										{selectedEmployee.contactInfo}
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<span className="text-sm font-medium">
										Manager:
									</span>
									<span className="text-sm">
										{selectedEmployee.manager}
									</span>
								</div>
							</div>

							<div className="flex items-center justify-between pt-4 border-t">
								<div>
									<p className="text-sm font-medium">
										Skills Count
									</p>
									<p className="text-2xl font-bold text-blue-600">
										{selectedEmployee.skillsCount}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium">
										Status
									</p>
									{getStatusBadge(selectedEmployee.status)}
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Edit Employee Modal */}
			<Dialog open={showEditModal} onOpenChange={setShowEditModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Employee</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleEditEmployee} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="editFirstName">
									First Name
								</Label>
								<Input
									id="editFirstName"
									value={formData.firstName}
									onChange={(e) =>
										setFormData({
											...formData,
											firstName: e.target.value,
										})
									}
									required
								/>
							</div>
							<div>
								<Label htmlFor="editLastName">Last Name</Label>
								<Input
									id="editLastName"
									value={formData.lastName}
									onChange={(e) =>
										setFormData({
											...formData,
											lastName: e.target.value,
										})
									}
									required
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="editEmail">Email</Label>
							<Input
								id="editEmail"
								type="email"
								value={formData.email}
								onChange={(e) =>
									setFormData({
										...formData,
										email: e.target.value,
									})
								}
								required
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="editDepartment">
									Department
								</Label>
								<Select
									value={formData.department}
									onValueChange={(value) =>
										setFormData({
											...formData,
											department: value,
										})
									}
									required
								>
									<option value="">Select Department</option>
									{departments.map((dept) => (
										<option key={dept} value={dept}>
											{dept}
										</option>
									))}
								</Select>
							</div>
							<div>
								<Label htmlFor="editRole">Role</Label>
								<Input
									id="editRole"
									value={formData.role}
									onChange={(e) =>
										setFormData({
											...formData,
											role: e.target.value,
										})
									}
									required
								/>
							</div>
						</div>
						<div className="flex gap-3 pt-4">
							<Button type="submit" className="flex-1">
								Update Employee
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowEditModal(false)}
							>
								Cancel
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}
