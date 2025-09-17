'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api'

type RegisterPayload = {
	email: string
	password: string
	firstName: string
	lastName?: string
	role?: 'ADMIN' | 'EMPLOYEE'
}

export default function RegisterScreen() {
	const router = useRouter()
	const [formData, setFormData] = useState<RegisterPayload>({
		email: '',
		password: '',
		firstName: '',
		lastName: '',
		role: 'EMPLOYEE',
	})
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)
	const [rememberMe, setRememberMe] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (formData.password !== confirmPassword) {
			setError('Passwords do not match')
			return
		}
		await onRegister(formData)
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
	}

	async function loginAfterRegister(email: string, password: string) {
		const res = await fetch(`${API_BASE}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password }),
		})
		if (!res.ok) {
			const maybe = await res.json().catch(() => ({}))
			throw new Error(
				maybe?.message || 'Unable to login after registration'
			)
		}
		return res.json()
	}

	async function onRegister(payload: RegisterPayload) {
		try {
			setLoading(true)
			setError(null)
			const res = await fetch(`${API_BASE}/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})
			if (!res.ok) {
				const maybe = await res.json().catch(() => ({}))
				throw new Error(maybe?.message || 'Registration failed')
			}
			const regData = await res.json().catch(() => ({}))
			let token: string | undefined = regData?.token
			let user = regData?.user
			if (!token) {
				const loginData = await loginAfterRegister(
					payload.email,
					payload.password
				)
				token = loginData?.token
				user = loginData?.user
			}
			if (!token) throw new Error('No token received')
			const storage = rememberMe ? localStorage : sessionStorage
			storage.setItem('auth_token', token)
			document.cookie = `auth_token=${token}; path=/; samesite=lax`
			if (!user) {
				const me = await fetch(`${API_BASE}/users/me`, {
					headers: { Authorization: `Bearer ${token}` },
					cache: 'no-store',
				})
				if (me.ok) user = await me.json()
			}
			const role = user?.role || 'EMPLOYEE'
			if (role === 'ADMIN') {
				router.replace('/admin')
			} else {
				router.replace('/dashboard')
			}
		} catch (err: any) {
			setError(err?.message || 'Something went wrong while registering.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
			<div className="flex min-h-screen">
				<div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
					<div className="mx-auto w-full max-w-sm lg:w-96">
						<div className="text-center mb-8">
							<div className="flex items-center justify-center mb-4">
								<div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
									<UserPlus className="w-7 h-7 text-white" />
								</div>
							</div>
							<h2 className="text-3xl font-bold text-gray-900">
								Create your account
							</h2>
							<p className="mt-2 text-gray-600">
								Join SkillHub to start managing skills
							</p>
						</div>

						<Card className="shadow-xl border-0">
							<CardHeader className="space-y-1">
								<CardTitle className="text-2xl text-center">
									Sign Up
								</CardTitle>
								<p className="text-sm text-gray-600 text-center">
									Enter your details to get started
								</p>
							</CardHeader>
							<CardContent className="space-y-4">
								{error && (
									<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
										<svg
											className="w-4 h-4 mr-2"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
												clipRule="evenodd"
											/>
										</svg>
										{error}
									</div>
								)}

								<form
									onSubmit={handleSubmit}
									className="space-y-4"
								>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="firstName">
												First Name
											</Label>
											<div className="relative">
												<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
													<User className="h-4 w-4 text-gray-400" />
												</div>
												<Input
													id="firstName"
													name="firstName"
													type="text"
													required
													className="pl-10"
													placeholder="John"
													value={formData.firstName}
													onChange={handleChange}
												/>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="lastName">
												Last Name
											</Label>
											<Input
												id="lastName"
												name="lastName"
												type="text"
												placeholder="Doe"
												value={formData.lastName}
												onChange={handleChange}
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="email">
											Email Address
										</Label>
										<div className="relative">
											<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
												<Mail className="h-4 w-4 text-gray-400" />
											</div>
											<Input
												id="email"
												name="email"
												type="email"
												autoComplete="email"
												required
												className="pl-10"
												placeholder="john@example.com"
												value={formData.email}
												onChange={handleChange}
											/>
										</div>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="password">
												Password
											</Label>
											<div className="relative">
												<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
													<Lock className="h-4 w-4 text-gray-400" />
												</div>
												<Input
													id="password"
													name="password"
													type={
														showPassword
															? 'text'
															: 'password'
													}
													autoComplete="new-password"
													required
													className="pl-10 pr-10"
													placeholder="Create a password"
													value={formData.password}
													onChange={handleChange}
												/>
												<button
													type="button"
													className="absolute inset-y-0 right-0 pr-3 flex items-center"
													onClick={() =>
														setShowPassword(
															!showPassword
														)
													}
													aria-label={
														showPassword
															? 'Hide password'
															: 'Show password'
													}
												>
													{showPassword ? (
														<EyeOff className="h-4 w-4 text-gray-400" />
													) : (
														<Eye className="h-4 w-4 text-gray-400" />
													)}
												</button>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="confirmPassword">
												Confirm Password
											</Label>
											<div className="relative">
												<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
													<Lock className="h-4 w-4 text-gray-400" />
												</div>
												<Input
													id="confirmPassword"
													name="confirmPassword"
													type={
														showConfirm
															? 'text'
															: 'password'
													}
													autoComplete="new-password"
													required
													className="pl-10 pr-10"
													placeholder="Re-enter password"
													value={confirmPassword}
													onChange={(e) =>
														setConfirmPassword(
															e.target.value
														)
													}
												/>
												<button
													type="button"
													className="absolute inset-y-0 right-0 pr-3 flex items-center"
													onClick={() =>
														setShowConfirm(
															!showConfirm
														)
													}
													aria-label={
														showConfirm
															? 'Hide confirm password'
															: 'Show confirm password'
													}
												>
													{showConfirm ? (
														<EyeOff className="h-4 w-4 text-gray-400" />
													) : (
														<Eye className="h-4 w-4 text-gray-400" />
													)}
												</button>
											</div>
										</div>
									</div>

									<div className="space-y-2">
										<Label>Role</Label>
										<Select
											value={formData.role}
											onValueChange={(
												v: 'ADMIN' | 'EMPLOYEE'
											) =>
												setFormData({
													...formData,
													role: v,
												})
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select role" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="EMPLOYEE">
													<div className="flex items-center gap-2">
														<User className="h-4 w-4" />{' '}
														Employee
													</div>
												</SelectItem>
												<SelectItem value="ADMIN">
													<div className="flex items-center gap-2">
														<Shield className="h-4 w-4" />{' '}
														Admin
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex items-center justify-between">
										<div className="flex items-center">
											<input
												id="remember-me"
												name="remember-me"
												type="checkbox"
												checked={rememberMe}
												onChange={(e) =>
													setRememberMe(
														e.target.checked
													)
												}
												className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
											/>
											<label
												htmlFor="remember-me"
												className="ml-2 block text-sm text-gray-900"
											>
												Remember me
											</label>
										</div>
										<div className="text-sm">
											<Link
												href="/auth/login"
												className="font-medium text-purple-600 hover:text-purple-500"
											>
												Already have an account?
											</Link>
										</div>
									</div>

									<Button
										type="submit"
										className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
										disabled={loading}
									>
										{loading ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
												Creating account...
											</>
										) : (
											'Create Account'
										)}
									</Button>
								</form>
							</CardContent>
						</Card>

						<div className="mt-8 grid grid-cols-1 gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									setFormData({
										email: 'admin@example.com',
										password: 'admin123',
										firstName: 'Admin',
										lastName: 'User',
										role: 'ADMIN',
									})
								}
							>
								Use Admin Demo
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									setFormData({
										email: 'employee@example.com',
										password: 'employee123',
										firstName: 'Employee',
										lastName: 'User',
										role: 'EMPLOYEE',
									})
								}
							>
								Use Employee Demo
							</Button>
						</div>
					</div>
				</div>

				<div className="hidden lg:block relative flex-1">
					<div className="absolute inset-0 bg-gradient-to-br from-purple-700 to-blue-700">
						<div className="flex flex-col justify-center h-full px-12 text-white">
							<div className="mb-12">
								<h1 className="text-4xl font-bold mb-4">
									Join SkillHub
								</h1>
								<p className="text-xl opacity-90">
									Start tracking and growing skills across
									your organization.
								</p>
							</div>
							<div className="grid grid-cols-3 gap-8 pt-8 border-t border-white border-opacity-20">
								<div className="text-center">
									<div className="text-2xl font-bold">
										Easy
									</div>
									<div className="text-sm opacity-75">
										Onboarding
									</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold">
										Secure
									</div>
									<div className="text-sm opacity-75">
										Authentication
									</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold">
										Scalable
									</div>
									<div className="text-sm opacity-75">
										Management
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
