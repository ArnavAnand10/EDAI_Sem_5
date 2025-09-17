'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Trophy, Users, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api'

type LoginPayload = {
	email: string
	password: string
}

export default function LoginScreen() {
	const router = useRouter()
	const [formData, setFormData] = useState<LoginPayload>({
		email: '',
		password: '',
	})
	const [showPassword, setShowPassword] = useState(false)
	const [rememberMe, setRememberMe] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		await onLogin(formData)
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
	}

	async function onLogin(credentials: LoginPayload) {
		try {
			setLoading(true)
			setError(null)
			const res = await fetch(`${API_BASE}/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(credentials),
			})
			if (!res.ok) {
				const maybe = await res.json().catch(() => ({}))
				throw new Error(maybe?.message || 'Invalid email or password')
			}
			const data = await res.json()
			const token: string | undefined = data?.token
			if (!token) {
				throw new Error('Login succeeded but token was not returned.')
			}
			const storage = rememberMe ? localStorage : sessionStorage
			storage.setItem('auth_token', token)
			document.cookie = `auth_token=${token}; path=/; samesite=lax`
			let user = data?.user
			if (!user) {
				const me = await fetch(`${API_BASE}/users/me`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
					cache: 'no-store',
				})
				if (me.ok) {
					user = await me.json()
				}
			}
			const role = user?.role || 'EMPLOYEE'
			if (role === 'ADMIN') {
				router.replace('/admin')
			} else {
				router.replace('/dashboard')
			}
		} catch (err: any) {
			setError(err?.message || 'Something went wrong while logging in.')
		} finally {
			setLoading(false)
		}
	}

	const features = [
		{
			icon: Trophy,
			title: 'Skill Management',
			description: 'Track and develop employee skills efficiently',
		},
		{
			icon: Users,
			title: 'Team Collaboration',
			description: 'Foster growth through structured skill development',
		},
		{
			icon: Building,
			title: 'Organization Growth',
			description: 'Build stronger teams with better skill visibility',
		},
	]

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
			<div className="flex min-h-screen">
				<div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
					<div className="mx-auto w-full max-w-sm lg:w-96">
						<div className="text-center mb-8">
							<div className="flex items-center justify-center mb-4">
								<div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
									<Trophy className="w-7 h-7 text-white" />
								</div>
							</div>
							<h2 className="text-3xl font-bold text-gray-900">
								Welcome to SkillHub
							</h2>
							<p className="mt-2 text-gray-600">
								Sign in to your account to continue
							</p>
						</div>

						<Card className="shadow-xl border-0">
							<CardHeader className="space-y-1">
								<CardTitle className="text-2xl text-center">
									Sign In
								</CardTitle>
								<p className="text-sm text-gray-600 text-center">
									Enter your credentials to access your
									dashboard
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
												autoComplete="current-password"
												required
												className="pl-10 pr-10"
												placeholder="Enter your password"
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
												className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
											/>
											<label
												htmlFor="remember-me"
												className="ml-2 block text-sm text-gray-900"
											>
												Remember me
											</label>
										</div>

										<div className="text-sm">
											<a
												href="#"
												className="font-medium text-blue-600 hover:text-blue-500"
											>
												Forgot password?
											</a>
										</div>
									</div>

									<Button
										type="submit"
										className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
										disabled={loading}
									>
										{loading ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
												Signing in...
											</>
										) : (
											'Sign In'
										)}
									</Button>

									<div className="text-center">
										<span className="text-sm text-gray-600">
											Don't have an account?{' '}
											<Link
												href="/register"
												className="font-medium text-blue-600 hover:text-blue-500"
											>
												Sign up here
											</Link>
										</span>
									</div>
								</form>
							</CardContent>
						</Card>

						<div className="mt-8">
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 bg-white text-gray-500">
										Demo Accounts
									</span>
								</div>
							</div>

							<div className="mt-4 grid grid-cols-1 gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setFormData({
											email: 'admin@example.com',
											password: 'admin123',
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
										})
									}
								>
									Use Employee Demo
								</Button>
							</div>
						</div>
					</div>
				</div>

				<div className="hidden lg:block relative flex-1">
					<div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700">
						<div className="flex flex-col justify-center h-full px-12 text-white">
							<div className="mb-12">
								<h1 className="text-4xl font-bold mb-4">
									Empower Your Team&apos;s Growth
								</h1>
								<p className="text-xl opacity-90">
									Transform your organization with intelligent
									skill management and development tracking.
								</p>
							</div>

							<div className="space-y-8">
								{features.map((feature, index) => (
									<div
										key={index}
										className="flex items-start space-x-4"
									>
										<div className="flex-shrink-0">
											<div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
												<feature.icon className="w-6 h-6" />
											</div>
										</div>
										<div>
											<h3 className="text-lg font-semibold">
												{feature.title}
											</h3>
											<p className="opacity-90">
												{feature.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
