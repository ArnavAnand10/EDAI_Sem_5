'use client'
import RequireAuth from '@/components/RequireAuth'
import TopNav from '@/components/TopNav'
import { useEffect, useState } from 'react'
import { apiGet, apiPatch } from '@/lib/api'
import { 
	CheckCircle, 
	XCircle, 
	Clock, 
	Users, 
	Trophy, 
	RefreshCw, 
	Filter,
	AlertCircle,
	User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type SkillRequest = {
	id: number
	level: string
	status: 'PENDING' | 'APPROVED' | 'REJECTED'
	requestedAt: string
	employee: {
		firstName: string
		lastName?: string
		department?: string
	}
	skill: {
		name: string
		category?: string
	}
}

export default function AdminRequestsPage() {
	const [requests, setRequests] = useState<SkillRequest[]>([])
	const [loading, setLoading] = useState(true)
	const [processingId, setProcessingId] = useState<number | null>(null)
	const [filterStatus, setFilterStatus] = useState<string>('ALL')

	useEffect(() => {
		load()
	}, [])

	const load = async () => {
		try {
			setLoading(true)
			const data = await apiGet('/skills/requests')
			setRequests(data)
		} catch (error) {
			console.error('Failed to load requests:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleStatusUpdate = async (id: number, status: 'APPROVED' | 'REJECTED') => {
		try {
			setProcessingId(id)
			await apiPatch(`/skills/requests/${id}`, { status })
			await load()
		} catch (error) {
			console.error('Failed to update request:', error)
		} finally {
			setProcessingId(null)
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
			case 'REJECTED': return <XCircle className="h-4 w-4 text-red-600" />
			default: return <Clock className="h-4 w-4 text-yellow-600" />
		}
	}

	const getLevelIcon = (level: string) => {
		const colors = {
			'Beginner': 'text-gray-500',
			'Intermediate': 'text-green-500',
			'Advanced': 'text-blue-500',
			'Expert': 'text-purple-500'
		}
		return <Trophy className={`h-4 w-4 ${colors[level as keyof typeof colors] || 'text-gray-500'}`} />
	}

	// Filter requests
	const filteredRequests = requests.filter(request => {
		if (filterStatus === 'ALL') return true
		return request.status === filterStatus
	})

	const pendingCount = requests.filter(r => r.status === 'PENDING').length
	const approvedCount = requests.filter(r => r.status === 'APPROVED').length
	const rejectedCount = requests.filter(r => r.status === 'REJECTED').length

	return (
		<RequireAuth role="ADMIN">
			<div className="min-h-screen bg-gray-50">
				<TopNav />
				
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Header */}
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Skill Requests</h1>
							<p className="mt-2 text-gray-600">Review and approve employee skill requests</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={load}
							disabled={loading}
							className="mt-4 sm:mt-0"
						>
							<RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
							Refresh
						</Button>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center">
									<div className="p-2 bg-gray-100 rounded-lg">
										<Users className="h-6 w-6 text-gray-600" />
									</div>
									<div className="ml-4">
										<p className="text-sm font-medium text-gray-600">Total Requests</p>
										<p className="text-2xl font-bold text-gray-900">{requests.length}</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-6">
								<div className="flex items-center">
									<div className="p-2 bg-yellow-100 rounded-lg">
										<Clock className="h-6 w-6 text-yellow-600" />
									</div>
									<div className="ml-4">
										<p className="text-sm font-medium text-gray-600">Pending</p>
										<p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-6">
								<div className="flex items-center">
									<div className="p-2 bg-green-100 rounded-lg">
										<CheckCircle className="h-6 w-6 text-green-600" />
									</div>
									<div className="ml-4">
										<p className="text-sm font-medium text-gray-600">Approved</p>
										<p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-6">
								<div className="flex items-center">
									<div className="p-2 bg-red-100 rounded-lg">
										<XCircle className="h-6 w-6 text-red-600" />
									</div>
									<div className="ml-4">
										<p className="text-sm font-medium text-gray-600">Rejected</p>
										<p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Filter */}
					<Card className="mb-6">
						<CardContent className="p-6">
							<div className="flex items-center space-x-4">
								<Filter className="h-5 w-5 text-gray-500" />
								<div className="flex space-x-2">
									{['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
										<Button
											key={status}
											variant={filterStatus === status ? 'default' : 'outline'}
											size="sm"
											onClick={() => setFilterStatus(status)}
										>
											{status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
											{status !== 'ALL' && (
												<span className="ml-2 bg-white text-gray-600 px-2 py-0.5 rounded-full text-xs">
													{status === 'PENDING' ? pendingCount : 
													 status === 'APPROVED' ? approvedCount : rejectedCount}
												</span>
											)}
										</Button>
									))}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Requests List */}
					<Card>
						<CardHeader>
							<CardTitle>
								{filterStatus === 'ALL' ? 'All Requests' : `${filterStatus.charAt(0) + filterStatus.slice(1).toLowerCase()} Requests`}
								<span className="ml-2 text-sm font-normal text-gray-500">
									({filteredRequests.length})
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{loading ? (
								<div className="flex items-center justify-center py-12">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
								</div>
							) : filteredRequests.length === 0 ? (
								<div className="text-center py-12">
									<AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										{filterStatus === 'ALL' ? 'No requests found' : `No ${filterStatus.toLowerCase()} requests`}
									</h3>
									<p className="text-gray-600">
										{filterStatus === 'ALL' 
											? 'Skill requests will appear here when employees submit them.'
											: `No requests with ${filterStatus.toLowerCase()} status.`
										}
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{filteredRequests.map((request) => (
										<div key={request.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
											<div className="flex items-center space-x-4">
												<div className="flex-shrink-0">
													<div className="p-2 bg-white rounded-full">
														<User className="h-5 w-5 text-indigo-600" />
													</div>
												</div>
												<div className="flex-1">
													<div className="flex items-center space-x-3 mb-2">
														<h4 className="font-semibold text-gray-900">
															{request.employee.firstName} {request.employee.lastName || ''}
														</h4>
														{request.employee.department && (
															<Badge variant="secondary">
																{request.employee.department}
															</Badge>
														)}
													</div>
													<div className="flex items-center space-x-4 text-sm text-gray-600">
														<div className="flex items-center space-x-1">
															<Trophy className="h-4 w-4" />
															<span>{request.skill.name}</span>
															{request.skill.category && (
																<span className="text-gray-500">({request.skill.category})</span>
															)}
														</div>
														<div className="flex items-center space-x-1">
															{getLevelIcon(request.level)}
															<span>{request.level}</span>
														</div>
														<div>
															{new Date(request.requestedAt).toLocaleDateString()}
														</div>
													</div>
												</div>
											</div>
											
											<div className="flex items-center space-x-4">
												<div className="flex items-center space-x-2">
													{getStatusIcon(request.status)}
													<Badge className={getStatusColor(request.status)}>
														{request.status}
													</Badge>
												</div>
												
												{request.status === 'PENDING' && (
													<div className="flex space-x-2">
														<Button
															size="sm"
															onClick={() => handleStatusUpdate(request.id, 'APPROVED')}
															disabled={processingId === request.id}
															className="bg-green-600 hover:bg-green-700"
														>
															{processingId === request.id ? (
																<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
															) : (
																<>
																	<CheckCircle className="h-4 w-4 mr-1" />
																	Approve
																</>
															)}
														</Button>
														<Button
															size="sm"
															variant="destructive"
															onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
															disabled={processingId === request.id}
														>
															{processingId === request.id ? (
																<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
															) : (
																<>
																	<XCircle className="h-4 w-4 mr-1" />
																	Reject
																</>
															)}
														</Button>
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</RequireAuth>
	)
}
