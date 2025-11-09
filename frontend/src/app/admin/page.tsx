'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, LogOut, Users, Award, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import TopNav from '@/components/TopNav'
import { apiGet, apiPatch } from '@/lib/api'

export default function AdminPage() {
	const router = useRouter()

	const [user, setUser] = useState<any>(null)
	const [employees, setEmployees] = useState<any[]>([])
	const [skillRequests, setSkillRequests] = useState<any[]>([])
	const [activeTab, setActiveTab] = useState('employees')
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const userData = localStorage.getItem('user')
		const token =
			localStorage.getItem('auth_token') ||
			sessionStorage.getItem('auth_token')

		if (!userData || !token) {
			router.push('/auth/login')
			return
		}

		const parsedUser = JSON.parse(userData)
		if (parsedUser.role !== 'ADMIN') {
			router.push('/dashboard')
			return
		}

		setUser(parsedUser)
		fetchData()
	}, [router])

	const fetchData = async () => {
		try {
			setLoading(true)
			const employeesData = await apiGet('/employees')
			setEmployees(employeesData || [])

			const skillRequestsData = await apiGet('/skills/requests')
			setSkillRequests(skillRequestsData || [])
		} catch (error) {
			console.error('Error fetching data:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleSkillRequestAction = async (
		requestId: number,
		status: 'APPROVED' | 'REJECTED'
	) => {
		try {
			await apiPatch(`/skills/requests/${requestId}`, { status })
			await fetchData()
		} catch (error) {
			console.error('Error updating skill request:', error)
		}
	}

	const handleLogout = () => {
		localStorage.removeItem('auth_token')
		localStorage.removeItem('user')
		router.push('/auth/login')
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'APPROVED':
				return 'bg-green-100 text-green-800'
			case 'REJECTED':
				return 'bg-red-100 text-red-800'
			default:
				return 'bg-yellow-100 text-yellow-800'
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<p>Loading...</p>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<TopNav />

			<div className="max-w-6xl mx-auto px-4 py-8">
				<h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

				<div className="flex space-x-4 mb-6">
					<button
						onClick={() => setActiveTab('employees')}
						className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
							activeTab === 'employees'
								? 'bg-blue-600 text-white'
								: 'bg-white text-gray-700 hover:bg-gray-50'
						}`}
					>
						<Users className="w-4 h-4" />
						<span>Employees ({employees.length})</span>
					</button>
					<button
						onClick={() => setActiveTab('skills')}
						className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
							activeTab === 'skills'
								? 'bg-blue-600 text-white'
								: 'bg-white text-gray-700 hover:bg-gray-50'
						}`}
					>
						<Award className="w-4 h-4" />
						<span>
							Skill Requests (
							{
								skillRequests.filter(
									(r) => r.status === 'PENDING'
								).length
							}
							)
						</span>
					</button>
				</div>

				{activeTab === 'employees' && (
					<Card>
						<CardHeader>
							<CardTitle>Employee Management</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{employees.length === 0 ? (
									<p className="text-gray-500 text-center py-8">
										No employees found
									</p>
								) : (
									employees.map((employee) => (
										<div
											key={employee.id}
											className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
										>
											<div>
												<h3 className="font-medium">
													{employee.firstName}{' '}
													{employee.lastName}
												</h3>
												<p className="text-sm text-gray-600">
													{employee.user?.email}
												</p>
												<p className="text-sm text-gray-500">
													Department:{' '}
													{employee.department || '—'}
												</p>
											</div>
											<div className="text-right">
												<p className="text-sm text-gray-600">
													Total skills:{' '}
													{employee.skills?.length ||
														0}
												</p>
											</div>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				)}

				{activeTab === 'skills' && (
					<Card>
						<CardHeader>
							<CardTitle>Skill Requests Management</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{skillRequests.length === 0 ? (
									<p className="text-gray-500 text-center py-8">
										No skill requests found
									</p>
								) : (
									skillRequests.map((request) => (
										<div
											key={request.id}
											className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
										>
											<div className="flex-1">
												<div className="flex items-center space-x-3">
													<h3 className="font-medium">
														{
															request.employee
																.firstName
														}{' '}
														{
															request.employee
																.lastName
														}
													</h3>
													<Badge
														className={getStatusColor(
															request.status
														)}
													>
														{request.status}
													</Badge>
												</div>
												<p className="text-sm text-gray-900 font-medium mt-2">
													Skill: {request.skill.name}{' '}
													(Level: {request.level})
												</p>
											</div>

											{request.status === 'PENDING' && (
												<div className="flex space-x-2">
													<Button
														size="sm"
														variant="outline"
														className="text-green-600 border-green-600 hover:bg-green-50"
														onClick={() =>
															handleSkillRequestAction(
																request.id,
																'APPROVED'
															)
														}
													>
														<Check className="w-4 h-4 mr-1" />
														Approve
													</Button>
													<Button
														size="sm"
														variant="outline"
														className="text-red-600 border-red-600 hover:bg-red-50"
														onClick={() =>
															handleSkillRequestAction(
																request.id,
																'REJECTED'
															)
														}
													>
														<X className="w-4 h-4 mr-1" />
														Reject
													</Button>
												</div>
											)}
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	)
}
