'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
	const { login } = useAuth()

	const [formData, setFormData] = useState({
		email: '',
		password: '',
	})
	const [showPassword, setShowPassword] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			setLoading(true)
			setError(null)
			await login(formData.email, formData.password)
		} catch (err: any) {
			setError(err.message || 'Login failed')
		} finally {
			setLoading(false)
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
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
					<h1 className="text-2xl font-bold">Sign In</h1>
					<p className="text-sm text-gray-600 mt-2">
						Don't have an account?{' '}
						<Link
							href="/auth/register"
							className="text-blue-600 hover:text-blue-500"
						>
							Register here
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

							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									required
									value={formData.email}
									onChange={handleChange}
								/>
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

							<Button
								type="submit"
								className="w-full"
								disabled={loading}
							>
								{loading ? 'Signing in...' : 'Sign In'}
							</Button>
						</form>
					</CardContent>
				</Card>

				<div className="text-center text-sm text-gray-600">
					<p className="mb-1">
						New users are created as EMPLOYEE by default.
					</p>
					<p>Admin can upgrade roles after registration.</p>
				</div>
			</div>
		</div>
	)
}
