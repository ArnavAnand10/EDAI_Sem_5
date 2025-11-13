'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { apiGet, apiPut } from '@/lib/api'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Clock, CheckCircle, XCircle, User } from 'lucide-react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

interface Rating {
	id: number
	skillId: number
	selfRating: number
	selfComments?: string
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
		user: {
			email: string
		}
	}
}

export default function ManagerApprovalsPage() {
	const [ratings, setRatings] = useState<Rating[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedRating, setSelectedRating] = useState<Rating | null>(null)
	const [managerRating, setManagerRating] = useState<number>(0)
	const [comments, setComments] = useState('')
	const [processing, setProcessing] = useState(false)

	useEffect(() => {
		loadPendingRatings()
	}, [])

	const loadPendingRatings = async () => {
		try {
			setLoading(true)
			const data = await apiGet('/ratings/pending')
			setRatings(data)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	const openApprovalDialog = (rating: Rating) => {
		setSelectedRating(rating)
		setManagerRating(rating.selfRating) // Default to employee's rating
		setComments('')
		setError(null)
	}

	const handleApprove = async (status: 'APPROVED' | 'REJECTED') => {
		if (!selectedRating) return

		try {
			setProcessing(true)
			setError(null)

			await apiPut(`/ratings/approve/${selectedRating.id}`, {
				managerStatus: status,
				managerRating: status === 'APPROVED' ? managerRating : null,
				managerComments: comments,
			})

			// Remove from list
			setRatings(ratings.filter((r) => r.id !== selectedRating.id))
			setSelectedRating(null)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setProcessing(false)
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

	if (loading) {
		return (
			<ProtectedRoute allowedRoles={['MANAGER']}>
				<Navigation />
				<div className="container mx-auto px-4 py-8 text-center">
					Loading pending approvals...
				</div>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute allowedRoles={['MANAGER']}>
			<Navigation />
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Skill Rating Approvals</h1>
					<p className="text-gray-600">
						Review and approve skill ratings from your team members
					</p>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6">
						{error}
					</div>
				)}

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Clock className="w-5 h-5 text-yellow-600" />
							Pending Approvals ({ratings.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						{ratings.length === 0 ? (
							<div className="text-center py-12">
								<CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
								<p className="text-gray-600 text-lg font-medium">
									All caught up!
								</p>
								<p className="text-gray-500 text-sm">
									No pending skill ratings to review
								</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Employee</TableHead>
										<TableHead>Skill</TableHead>
										<TableHead>Category</TableHead>
										<TableHead>Self Rating</TableHead>
										<TableHead>Comments</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Action</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{ratings.map((rating) => (
										<TableRow key={rating.id}>
											<TableCell>
												<div className="flex items-center gap-2">
													<User className="w-4 h-4 text-gray-400" />
													<div>
														<p className="font-medium">
															{rating.employee.firstName}{' '}
															{rating.employee.lastName}
														</p>
														<p className="text-xs text-gray-500">
															{rating.employee.position || 'Employee'}
														</p>
													</div>
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
													<div className="w-24">
														{getRatingBar(rating.selfRating)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<p className="text-sm text-gray-600 max-w-xs truncate">
													{rating.selfComments || '-'}
												</p>
											</TableCell>
											<TableCell className="text-sm text-gray-500">
												{new Date(rating.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell>
												<Button
													size="sm"
													onClick={() => openApprovalDialog(rating)}
												>
													Review
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Approval Dialog */}
			<Dialog open={!!selectedRating} onOpenChange={() => setSelectedRating(null)}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Review Skill Rating</DialogTitle>
						<DialogDescription>
							Approve, adjust, or reject this skill rating
						</DialogDescription>
					</DialogHeader>

					{selectedRating && (
						<div className="space-y-6">
							{error && (
								<div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-sm">
									{error}
								</div>
							)}

							{/* Employee Info */}
							<div className="bg-gray-50 p-4 rounded">
								<h3 className="font-semibold mb-2">Employee Details</h3>
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div>
										<span className="text-gray-600">Name:</span>{' '}
										<span className="font-medium">
											{selectedRating.employee.firstName}{' '}
											{selectedRating.employee.lastName}
										</span>
									</div>
									<div>
										<span className="text-gray-600">Position:</span>{' '}
										<span className="font-medium">
											{selectedRating.employee.position || 'N/A'}
										</span>
									</div>
									<div className="col-span-2">
										<span className="text-gray-600">Email:</span>{' '}
										<span className="font-medium">
											{selectedRating.employee.user.email}
										</span>
									</div>
								</div>
							</div>

							{/* Skill Info */}
							<div>
								<h3 className="font-semibold mb-2">Skill Information</h3>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>Skill Name</Label>
										<p className="font-medium">{selectedRating.skill.name}</p>
									</div>
									<div>
										<Label>Category</Label>
										<Badge>{selectedRating.skill.category}</Badge>
									</div>
								</div>
							</div>

							{/* Employee's Rating */}
							<div>
								<Label>Employee's Self Rating</Label>
								<div className="flex items-center gap-3 mt-2">
									<span className="text-2xl font-bold">
										{selectedRating.selfRating}/10
									</span>
									<div className="flex-1">
										{getRatingBar(selectedRating.selfRating)}
									</div>
								</div>
								{selectedRating.selfComments && (
									<div className="mt-2">
										<Label>Employee Comments</Label>
										<p className="text-sm text-gray-600 mt-1">
											{selectedRating.selfComments}
										</p>
									</div>
								)}
							</div>

							{/* Manager Rating Adjustment */}
							<div>
								<Label htmlFor="managerRating">
									Manager Rating (Adjust if needed)
								</Label>
								<div className="flex gap-1 mt-2">
									{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
										<button
											key={rating}
											type="button"
											onClick={() => setManagerRating(rating)}
											className={`w-10 h-10 rounded transition-colors ${
												managerRating === rating
													? 'bg-blue-600 text-white'
													: managerRating > rating
													? 'bg-blue-200 text-blue-900'
													: 'bg-white border border-gray-300 hover:bg-gray-100'
											}`}
										>
											{rating}
										</button>
									))}
								</div>
							</div>

							{/* Manager Comments */}
							<div>
								<Label htmlFor="comments">Manager Comments (Optional)</Label>
								<textarea
									id="comments"
									value={comments}
									onChange={(e) => setComments(e.target.value)}
									className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md min-h-[80px]"
									placeholder="Add feedback or comments..."
								/>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3 justify-end">
								<Button
									variant="outline"
									onClick={() => setSelectedRating(null)}
									disabled={processing}
								>
									Cancel
								</Button>
								<Button
									variant="outline"
									onClick={() => handleApprove('REJECTED')}
									disabled={processing}
									className="text-red-600 hover:bg-red-50"
								>
									<XCircle className="w-4 h-4 mr-2" />
									Reject
								</Button>
								<Button
									onClick={() => handleApprove('APPROVED')}
									disabled={processing}
								>
									<CheckCircle className="w-4 h-4 mr-2" />
									{processing ? 'Approving...' : 'Approve'}
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</ProtectedRoute>
	)
}
