'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserPlus, Eye, EyeOff, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
	const { register } = useAuth()

	const [formData, setFormData] = useState({
		email: '',
		password: '',
		confirmPassword: '',
		firstName: '',
		lastName: '',
		role: 'EMPLOYEE',
	})
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		// Validate passwords match
		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match')
			return
		}

		// Validate password strength
		if (formData.password.length < 6) {
			setError('Password must be at least 6 characters')
			return
		}

		setLoading(true)
		setError('')

		try {
			await register({
				email: formData.email,
				password: formData.password,
				firstName: formData.firstName,
				lastName: formData.lastName,
				role: formData.role,
			})
		} catch (err: any) {
			setError(err.message || 'Registration failed')
		} finally {
			setLoading(false)
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}))
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="max-w-md w-full space-y-6">
				<div className="text-center">
					<Link
						href="/"
						className="flex items-center justify-center space-x-2 mb-4"
					>
						<Award className="w-8 h-8 text-blue-600" />
						<span className="text-xl font-bold">
							Employee Skill Rating System
						</span>
					</Link>
					<h1 className="text-2xl font-bold">Create Account</h1>
					<p className="text-sm text-gray-600 mt-2">
						Already have an account?{' '}
						<Link
							href="/auth/login"
							className="text-blue-600 hover:text-blue-500"
						>
							Sign in here
						</Link>
					</p>
				</div>

				<Card>
					<CardContent className="p-6">
						<form onSubmit={handleSubmit} className="space-y-4">
							{error && (
								<div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-sm">
									{error}
								</div>
							)}

							<div className="grid md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="firstName">First Name</Label>
									<Input
										id="firstName"
										name="firstName"
										type="text"
										required
										value={formData.firstName}
										onChange={handleChange}
										placeholder="John"
									/>
								</div>
								<div>
									<Label htmlFor="lastName">Last Name</Label>
									<Input
										id="lastName"
										name="lastName"
										type="text"
										value={formData.lastName}
										onChange={handleChange}
										placeholder="Doe"
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									required
									value={formData.email}
									onChange={handleChange}
									placeholder="your.email@example.com"
								/>
							</div>

							<div>
								<Label htmlFor="role">Role</Label>
								<Select
									value={formData.role}
									onValueChange={(value) =>
										setFormData((prev) => ({ ...prev, role: value }))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select role" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="EMPLOYEE">Employee</SelectItem>
										<SelectItem value="MANAGER">Manager</SelectItem>
										<SelectItem value="HR">HR</SelectItem>
										<SelectItem value="ADMIN">Admin</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="password">Password</Label>
								<div className="relative">
									<Input
										id="password"
										name="password"
										type={
											showPassword ? 'text' : 'password'
										}
										required
										value={formData.password}
										onChange={handleChange}
										placeholder="At least 6 characters"
									/>
									<button
										type="button"
										className="absolute right-3 top-1/2 transform -translate-y-1/2"
										onClick={() =>
											setShowPassword(!showPassword)
										}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>

							<div>
								<Label htmlFor="confirmPassword">
									Confirm Password
								</Label>
								<div className="relative">
									<Input
										id="confirmPassword"
										name="confirmPassword"
										type={
											showConfirmPassword
												? 'text'
												: 'password'
										}
										required
										value={formData.confirmPassword}
										onChange={handleChange}
										placeholder="Re-enter password"
									/>
									<button
										type="button"
										className="absolute right-3 top-1/2 transform -translate-y-1/2"
										onClick={() =>
											setShowConfirmPassword(
												!showConfirmPassword
											)
										}
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={loading}
							>
								{loading ? 'Creating account...' : 'Register'}
							</Button>
						</form>
					</CardContent>
				</Card>

				<div className="text-center text-sm text-gray-600">
					<p>Select your role during registration or contact your admin for changes.</p>
				</div>
			</div>
		</div>
	)
}
