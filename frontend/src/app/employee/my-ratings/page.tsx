'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { apiGet } from '@/lib/api'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Award, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Rating {
	id: number
	skillId: number
	selfRating: number
	managerRating: number | null
	status: 'PENDING' | 'APPROVED' | 'REJECTED'
	createdAt: string
	updatedAt: string
	skill: {
		name: string
		category: string
	}
}

export default function MyRatingsPage() {
	const [ratings, setRatings] = useState<Rating[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		loadRatings()
	}, [])

	const loadRatings = async () => {
		try {
			setLoading(true)
			const data = await apiGet('/ratings/my-ratings')
			setRatings(data)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'APPROVED':
				return (
					<Badge className="bg-green-100 text-green-800">
						<CheckCircle className="w-3 h-3 mr-1" />
						Approved
					</Badge>
				)
			case 'REJECTED':
				return (
					<Badge className="bg-red-100 text-red-800">
						<XCircle className="w-3 h-3 mr-1" />
						Rejected
					</Badge>
				)
			case 'PENDING':
				return (
					<Badge className="bg-yellow-100 text-yellow-800">
						<Clock className="w-3 h-3 mr-1" />
						Pending
					</Badge>
				)
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

	// Group by status
	const pending = ratings.filter((r) => r.status === 'PENDING')
	const approved = ratings.filter((r) => r.status === 'APPROVED')
	const rejected = ratings.filter((r) => r.status === 'REJECTED')

	if (loading) {
		return (
			<ProtectedRoute allowedRoles={['EMPLOYEE']}>
				<Navigation />
				<div className="container mx-auto px-4 py-8 text-center">
					Loading ratings...
				</div>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute allowedRoles={['EMPLOYEE']}>
			<Navigation />
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">My Skill Ratings</h1>
					<p className="text-gray-600">
						View the status of your skill ratings
					</p>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6">
						{error}
					</div>
				)}

				{/* Summary Cards */}
				<div className="grid md:grid-cols-3 gap-4 mb-8">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-gray-600">
								Pending
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold text-yellow-600">
								{pending.length}
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-gray-600">
								Approved
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold text-green-600">
								{approved.length}
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-gray-600">
								Rejected
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold text-red-600">
								{rejected.length}
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Ratings Table */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Award className="w-5 h-5 text-blue-600" />
							All Ratings
						</CardTitle>
					</CardHeader>
					<CardContent>
						{ratings.length === 0 ? (
							<div className="text-center py-12">
								<Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-600">
									No ratings yet. Start by rating your skills!
								</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Skill</TableHead>
										<TableHead>Category</TableHead>
										<TableHead>Your Rating</TableHead>
										<TableHead>Manager Rating</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Date</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{ratings.map((rating) => (
										<TableRow key={rating.id}>
											<TableCell className="font-medium">
												{rating.skill.name}
											</TableCell>
											<TableCell>
												{rating.skill.category}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-3">
													<span className="font-semibold w-6">
														{rating.selfRating}
													</span>
													<div className="w-24">
														{getRatingBar(
															rating.selfRating
														)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												{rating.managerRating ? (
													<div className="flex items-center gap-3">
														<span className="font-semibold w-6">
															{rating.managerRating}
														</span>
														<div className="w-24">
															{getRatingBar(
																rating.managerRating
															)}
														</div>
													</div>
												) : (
													<span className="text-gray-400">
														-
													</span>
												)}
											</TableCell>
											<TableCell>
												{getStatusBadge(rating.status)}
											</TableCell>
											<TableCell className="text-sm text-gray-600">
												{new Date(
													rating.createdAt
												).toLocaleDateString()}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>
		</ProtectedRoute>
	)
}
