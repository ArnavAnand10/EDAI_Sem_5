'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { apiGet, apiPut } from '@/lib/api'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { User, Mail, Briefcase, Calendar } from 'lucide-react'

interface EmployeeProfile {
	id: number
	firstName: string
	lastName: string
	email: string
	department: string
	position: string
	dateOfJoining: string
	managerId: number | null
	manager?: {
		firstName: string
		lastName: string
	}
}

export default function EmployeeProfilePage() {
	const [profile, setProfile] = useState<EmployeeProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [editing, setEditing] = useState(false)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		department: '',
		position: '',
	})

	useEffect(() => {
		loadProfile()
	}, [])

	const loadProfile = async () => {
		try {
			setLoading(true)
			const data = await apiGet('/employees/me')
			setProfile(data)
			setFormData({
				firstName: data.firstName,
				lastName: data.lastName,
				department: data.department || '',
				position: data.position || '',
			})
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	const handleSave = async () => {
		try {
			setSaving(true)
			setError(null)
			const updated = await apiPut(`/employees/${profile?.id}`, formData)
			setProfile(updated)
			setEditing(false)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setSaving(false)
		}
	}

	const handleCancel = () => {
		if (profile) {
			setFormData({
				firstName: profile.firstName,
				lastName: profile.lastName,
				department: profile.department || '',
				position: profile.position || '',
			})
		}
		setEditing(false)
		setError(null)
	}

	if (loading) {
		return (
			<ProtectedRoute allowedRoles={['EMPLOYEE']}>
				<Navigation />
				<div className="container mx-auto px-4 py-8 text-center">
					Loading profile...
				</div>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute allowedRoles={['EMPLOYEE']}>
			<Navigation />
			<div className="container mx-auto px-4 py-8 max-w-3xl">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">My Profile</h1>
					<p className="text-gray-600">
						View and update your personal information
					</p>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6">
						{error}
					</div>
				)}

				<Card>
					<CardHeader>
						<div className="flex justify-between items-center">
							<CardTitle>Personal Information</CardTitle>
							{!editing ? (
								<Button onClick={() => setEditing(true)}>
									Edit Profile
								</Button>
							) : (
								<div className="flex gap-2">
									<Button
										variant="outline"
										onClick={handleCancel}
									>
										Cancel
									</Button>
									<Button
										onClick={handleSave}
										disabled={saving}
									>
										{saving ? 'Saving...' : 'Save Changes'}
									</Button>
								</div>
							)}
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Read-only fields */}
						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<Label className="flex items-center gap-2 text-gray-600">
									<Mail className="w-4 h-4" />
									Email
								</Label>
								<Input
									value={profile?.email || ''}
									disabled
									className="mt-1"
								/>
							</div>
							<div>
								<Label className="flex items-center gap-2 text-gray-600">
									<Calendar className="w-4 h-4" />
									Date of Joining
								</Label>
								<Input
									value={
										profile?.dateOfJoining
											? new Date(
													profile.dateOfJoining
											  ).toLocaleDateString()
											: 'N/A'
									}
									disabled
									className="mt-1"
								/>
							</div>
						</div>

						{/* Editable fields */}
						<div className="grid md:grid-cols-2 gap-4">
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
									disabled={!editing}
									className="mt-1"
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
									disabled={!editing}
									className="mt-1"
								/>
							</div>
						</div>

						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="department">Department</Label>
								<Input
									id="department"
									value={formData.department}
									onChange={(e) =>
										setFormData({
											...formData,
											department: e.target.value,
										})
									}
									disabled={!editing}
									className="mt-1"
									placeholder="e.g., Engineering"
								/>
							</div>
							<div>
								<Label htmlFor="position">Position</Label>
								<Input
									id="position"
									value={formData.position}
									onChange={(e) =>
										setFormData({
											...formData,
											position: e.target.value,
										})
									}
									disabled={!editing}
									className="mt-1"
									placeholder="e.g., Software Engineer"
								/>
							</div>
						</div>

						{/* Manager Info */}
						{profile?.manager && (
							<div>
								<Label className="flex items-center gap-2 text-gray-600">
									<Briefcase className="w-4 h-4" />
									Manager
								</Label>
								<Input
									value={`${profile.manager.firstName} ${profile.manager.lastName}`}
									disabled
									className="mt-1"
								/>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</ProtectedRoute>
	)
}
