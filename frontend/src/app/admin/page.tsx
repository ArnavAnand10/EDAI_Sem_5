'use client'

import { useState, useEffect } from 'react'
import { Users, Award, Shield, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { apiGet, apiPut } from '@/lib/api'

export default function AdminPage() {
	const [employees, setEmployees] = useState<any[]>([])
	const [users, setUsers] = useState<any[]>([])
	const [managers, setManagers] = useState<any[]>([])
	const [activeTab, setActiveTab] = useState('users')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
	const [selectedManager, setSelectedManager] = useState<string>('')
	const [assignDialogOpen, setAssignDialogOpen] = useState(false)
	const [assignLoading, setAssignLoading] = useState(false)

	useEffect(() => {
		fetchData()
	}, [])

	const fetchData = async () => {
		try {
			setLoading(true)
			setError(null)
			const [employeesData, usersData] = await Promise.all([
				apiGet('/employees').catch(() => []),
				apiGet('/admin/users').catch(() => []),
			])
			setEmployees(employeesData || [])
			setUsers(usersData || [])
			
			// Debug logging
			console.log('All users:', usersData)
			console.log('Users with MANAGER role:', usersData?.filter((u: any) => u.role === 'MANAGER'))
			
			// Filter managers from users (users with MANAGER role)
			const managersData = (usersData || []).filter((user: any) => 
				user.role === 'MANAGER'
			)
			console.log('Filtered managers:', managersData)
			setManagers(managersData)
		} catch (error: any) {
			console.error('Error fetching data:', error)
			setError(error.message)
		} finally {
			setLoading(false)
		}
	}

	const handleAssignManager = async () => {
		if (!selectedEmployee || !selectedManager) return
		
		try {
			setAssignLoading(true)
			await apiPut(`/admin/employees/${selectedEmployee.id}/assign-manager`, {
				managerId: parseInt(selectedManager)
			})
			
			// Refresh data
			await fetchData()
			setAssignDialogOpen(false)
			setSelectedEmployee(null)
			setSelectedManager('')
		} catch (error: any) {
			console.error('Error assigning manager:', error)
			alert('Failed to assign manager: ' + error.message)
		} finally {
			setAssignLoading(false)
		}
	}

	const openAssignDialog = (employee: any) => {
		setSelectedEmployee(employee)
		setSelectedManager(employee.managerId?.toString() || '')
		setAssignDialogOpen(true)
	}

	const getRoleBadge = (role: string) => {
		const colors: Record<string, string> = {
			ADMIN: 'bg-red-100 text-red-800',
			HR: 'bg-purple-100 text-purple-800',
			MANAGER: 'bg-blue-100 text-blue-800',
			EMPLOYEE: 'bg-green-100 text-green-800',
		}
		return <Badge className={colors[role] || 'bg-gray-100 text-gray-800'}>{role}</Badge>
	}

	if (loading) {
		return (
			<ProtectedRoute allowedRoles={['ADMIN']}>
				<Navigation />
				<div className="container mx-auto px-4 py-8 text-center">
					Loading admin dashboard...
				</div>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute allowedRoles={['ADMIN']}>
			<Navigation />
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Admin Dashboard</h1>
					<p className="text-gray-600">System administration and user management</p>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6">
						{error}
					</div>
				)}

				{/* Stats Cards */}
				<div className="grid md:grid-cols-3 gap-4 mb-6">
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold">{users.length}</p>
							<p className="text-sm text-gray-600">Total Users</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold">{employees.length}</p>
							<p className="text-sm text-gray-600">Employees</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<p className="text-2xl font-bold">
								{users.filter((u) => u.role === 'ADMIN').length}
							</p>
							<p className="text-sm text-gray-600">Administrators</p>
						</CardContent>
					</Card>
				</div>

				<div className="flex space-x-4 mb-6">
					<Button
						onClick={() => setActiveTab('users')}
						variant={activeTab === 'users' ? 'default' : 'outline'}
					>
						<Shield className="w-4 h-4 mr-2" />
						All Users ({users.length})
					</Button>
					<Button
						onClick={() => setActiveTab('employees')}
						variant={activeTab === 'employees' ? 'default' : 'outline'}
					>
						<Users className="w-4 h-4 mr-2" />
						Employees ({employees.length})
					</Button>
					<Button
						onClick={() => setActiveTab('assignments')}
						variant={activeTab === 'assignments' ? 'default' : 'outline'}
					>
						<UserCog className="w-4 h-4 mr-2" />
						Manager Assignments
					</Button>
				</div>

				{activeTab === 'users' && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="w-5 h-5 text-red-600" />
								User Management
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{users.length === 0 ? (
									<p className="text-gray-500 text-center py-8">No users found</p>
								) : (
									users.map((user) => (
										<div
											key={user.id}
											className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
										>
											<div>
												<div className="flex items-center gap-3">
													<h3 className="font-medium">{user.email}</h3>
													{getRoleBadge(user.role)}
												</div>
												<p className="text-sm text-gray-500 mt-1">
													User ID: {user.id}
												</p>
											</div>
											<div className="text-right">
												<p className="text-xs text-gray-500">
													Created: {new Date(user.createdAt).toLocaleDateString()}
												</p>
											</div>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				)}

				{activeTab === 'employees' && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="w-5 h-5 text-blue-600" />
								Employee Management
							</CardTitle>
						</CardHeader>
						<CardContent>
						<div className="space-y-3">
							{employees.filter((emp: any) => emp.user?.role === 'EMPLOYEE').length === 0 ? (
								<p className="text-gray-500 text-center py-8">
									No employees found (only EMPLOYEE role users can be assigned managers)
								</p>
							) : (
								employees.filter((emp: any) => emp.user?.role === 'EMPLOYEE').map((employee) => (
										<div
											key={employee.id}
											className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
										>
											<div>
												<h3 className="font-medium">
													{employee.firstName} {employee.lastName}
												</h3>
												<p className="text-sm text-gray-600">
													{employee.user?.email || 'No email'}
												</p>
												<p className="text-sm text-gray-500">
													Department: {employee.department || '—'}
												</p>
											</div>
											<div className="text-right">
												<p className="text-sm text-gray-600">
													Skills: {employee.skills?.length || 0}
												</p>
												<p className="text-xs text-gray-500">
													Position: {employee.position || '—'}
												</p>
											</div>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				)}

				{activeTab === 'assignments' && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<UserCog className="w-5 h-5 text-purple-600" />
								Manager Assignments
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="mb-4 p-4 bg-blue-50 rounded-lg">
								<p className="text-sm text-blue-800">
									Assign managers to employees to enable the skill approval workflow.
									Employees can rate their skills, and their assigned manager will approve or adjust the ratings.
								</p>
							</div>
							<div className="space-y-3">
								{employees.length === 0 ? (
									<p className="text-gray-500 text-center py-8">
										No employees found
									</p>
								) : (
									employees.map((employee) => (
										<div
											key={employee.id}
											className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
										>
											<div className="flex-1">
												<h3 className="font-medium">
													{employee.firstName} {employee.lastName}
												</h3>
												<p className="text-sm text-gray-600">
													{employee.user?.email || 'No email'}
												</p>
												<div className="flex items-center gap-2 mt-1">
													<p className="text-sm text-gray-500">
														Department: {employee.department || '—'}
													</p>
													{getRoleBadge(employee.user?.role || 'EMPLOYEE')}
												</div>
											</div>
											<div className="flex items-center gap-4">
												{employee.manager ? (
													<div className="text-right">
														<p className="text-sm font-medium text-green-700">
															Manager Assigned
														</p>
														<p className="text-xs text-gray-600">
															{employee.manager.firstName} {employee.manager.lastName}
														</p>
													</div>
												) : (
													<Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
														No Manager
													</Badge>
												)}
												<Button
													onClick={() => openAssignDialog(employee)}
													variant="outline"
													size="sm"
												>
													{employee.manager ? 'Change' : 'Assign'} Manager
												</Button>
											</div>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Assign Manager Dialog */}
				<Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Assign Manager</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							{selectedEmployee && (
								<div className="p-3 bg-gray-50 rounded">
									<p className="text-sm text-gray-600">Employee</p>
									<p className="font-medium">
										{selectedEmployee.firstName} {selectedEmployee.lastName}
									</p>
									<p className="text-sm text-gray-500">{selectedEmployee.user?.email}</p>
								</div>
							)}
							
							<div className="space-y-2">
								<Label htmlFor="manager-select">Select Manager</Label>
								<Select value={selectedManager} onValueChange={setSelectedManager}>
									<SelectTrigger id="manager-select">
										<SelectValue placeholder="Choose a manager" />
									</SelectTrigger>
									<SelectContent>
										{managers.length === 0 ? (
											<div className="p-2 text-sm text-gray-500">
												No managers available. Create a user with MANAGER role first.
											</div>
										) : (
											managers.map((manager) => (
												<SelectItem key={manager.id} value={manager.id.toString()}>
													{manager.employee?.firstName && manager.employee?.lastName
														? `${manager.employee.firstName} ${manager.employee.lastName} (${manager.email})`
														: manager.email}
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
							</div>

							<div className="flex gap-2 justify-end">
								<Button
									variant="outline"
									onClick={() => {
										setAssignDialogOpen(false)
										setSelectedEmployee(null)
										setSelectedManager('')
									}}
								>
									Cancel
								</Button>
								<Button
									onClick={handleAssignManager}
									disabled={!selectedManager || assignLoading}
								>
									{assignLoading ? 'Assigning...' : 'Assign Manager'}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</ProtectedRoute>
	)
}
