'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { apiGet, apiPost } from '@/lib/api'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Award, Info } from 'lucide-react'

interface Skill {
	id: number
	name: string
	category: string
}

export default function RateSkillsPage() {
	const [skills, setSkills] = useState<Skill[]>([])
	const [ratings, setRatings] = useState<Record<number, number>>({})
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	useEffect(() => {
		loadSkills()
	}, [])

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

	const handleSubmit = async () => {
		// Validate at least one rating
		const selectedRatings = Object.entries(ratings).filter(
			([_, rating]) => rating > 0
		)
		if (selectedRatings.length === 0) {
			setError('Please rate at least one skill')
			return
		}

		try {
			setSubmitting(true)
			setError(null)
			setSuccess(false)

			// Submit each rating
			await Promise.all(
				selectedRatings.map(([skillId, rating]) =>
					apiPost('/ratings/self-rate', {
						skillId: Number(skillId),
						selfRating: rating,
					})
				)
			)

			setSuccess(true)
			setRatings({}) // Clear ratings after successful submission
			setTimeout(() => setSuccess(false), 3000)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setSubmitting(false)
		}
	}

	const handleRatingChange = (skillId: number, rating: number) => {
		setRatings({
			...ratings,
			[skillId]: rating,
		})
	}

	// Group skills by category
	const groupedSkills = skills.reduce((acc, skill) => {
		if (!acc[skill.category]) {
			acc[skill.category] = []
		}
		acc[skill.category].push(skill)
		return acc
	}, {} as Record<string, Skill[]>)

	if (loading) {
		return (
			<ProtectedRoute allowedRoles={['EMPLOYEE']}>
				<Navigation />
				<div className="container mx-auto px-4 py-8 text-center">
					Loading skills...
				</div>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute allowedRoles={['EMPLOYEE']}>
			<Navigation />
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Rate Your Skills</h1>
					<p className="text-gray-600">
						Rate your proficiency on a scale of 1-10
					</p>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6">
						{error}
					</div>
				)}

				{success && (
					<div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded mb-6">
						✓ Skills submitted successfully! Pending manager approval.
					</div>
				)}

				<div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6 flex gap-3">
					<Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
					<div className="text-sm text-blue-900">
						<p className="font-medium mb-1">How it works:</p>
						<ul className="list-disc list-inside space-y-1">
							<li>Rate your skills from 1 (beginner) to 10 (expert)</li>
							<li>You can rate multiple skills at once</li>
							<li>Ratings will be sent to your manager for approval</li>
							<li>Only select skills you actually have experience with</li>
						</ul>
					</div>
				</div>

				{Object.entries(groupedSkills).map(([category, categorySkills]) => (
					<Card key={category} className="mb-6">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Award className="w-5 h-5 text-blue-600" />
								{category}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{categorySkills.map((skill) => (
									<div
										key={skill.id}
										className="flex items-center justify-between p-3 bg-gray-50 rounded"
									>
										<Label
											htmlFor={`skill-${skill.id}`}
											className="text-base font-medium"
										>
											{skill.name}
										</Label>
										<div className="flex gap-1">
											{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
												(rating) => (
													<button
														key={rating}
														type="button"
														onClick={() =>
															handleRatingChange(
																skill.id,
																rating
															)
														}
														className={`w-10 h-10 rounded transition-colors ${
															ratings[skill.id] === rating
																? 'bg-blue-600 text-white'
																: ratings[skill.id] > rating
																? 'bg-blue-200 text-blue-900'
																: 'bg-white border border-gray-300 hover:bg-gray-100'
														}`}
													>
														{rating}
													</button>
												)
											)}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				))}

				{skills.length === 0 && (
					<Card>
						<CardContent className="text-center py-12">
							<Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-600">
								No skills available. Contact HR to add skills.
							</p>
						</CardContent>
					</Card>
				)}

				{skills.length > 0 && (
					<div className="flex justify-end gap-3">
						<Button
							variant="outline"
							onClick={() => setRatings({})}
						>
							Clear All
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={submitting || Object.keys(ratings).length === 0}
						>
							{submitting ? 'Submitting...' : `Submit ${Object.keys(ratings).length} Rating(s)`}
						</Button>
					</div>
				)}
			</div>
		</ProtectedRoute>
	)
}
