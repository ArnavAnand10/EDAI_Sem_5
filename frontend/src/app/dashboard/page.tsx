'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Award, LogOut, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Dashboard() {
	const router = useRouter()
	const API_BASE = 'http://localhost:4000/api'

	const [user, setUser] = useState<any>(null)
	const [mySkills, setMySkills] = useState<any[]>([])
	const [allSkills, setAllSkills] = useState<any[]>([])
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
		if (parsedUser.role !== 'EMPLOYEE') {
			router.push('/admin')
			return
		}

		setUser(parsedUser)
		fetchData(token)
	}, [router])

	const fetchData = async (token: string) => {
		try {
			// Fetch my skills
			const mySkillsRes = await fetch(`${API_BASE}/skills/my`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			if (mySkillsRes.ok) {
				const mySkillsData = await mySkillsRes.json()
				setMySkills(mySkillsData)
			}

			// Fetch all available skills
			const allSkillsRes = await fetch(`${API_BASE}/skills`)
			if (allSkillsRes.ok) {
				const allSkillsData = await allSkillsRes.json()
				setAllSkills(allSkillsData)
			}
		} catch (error) {
			console.error('Error fetching data:', error)
		} finally {
			setLoading(false)
		}
	}

	const requestSkill = async (skillId: number, level: string) => {
		try {
			const token =
				localStorage.getItem('auth_token') ||
				sessionStorage.getItem('auth_token')
			const res = await fetch(`${API_BASE}/skills/request`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ skillId, level }),
			})

			if (res.ok && token) {
				fetchData(token)
			}
		} catch (error) {
			console.error('Error requesting skill:', error)
		}
	}

	const handleLogout = () => {
		localStorage.removeItem('token')
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
			{/* Header */}
			<nav className="bg-white border-b">
				<div className="max-w-6xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<Award className="w-8 h-8 text-blue-600" />
							<h1 className="text-xl font-bold">SkillBase</h1>
						</div>
						<div className="flex items-center space-x-4">
							<span className="text-sm text-gray-600">
								Employee: {user?.email}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={handleLogout}
							>
								<LogOut className="w-4 h-4 mr-2" />
								Logout
							</Button>
						</div>
					</div>
				</div>
			</nav>

			<div className="max-w-6xl mx-auto px-4 py-8">
				<h1 className="text-2xl font-bold mb-8">Employee Dashboard</h1>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* My Skills */}
					<Card>
						<CardHeader>
							<CardTitle>My Skills ({mySkills.length})</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{mySkills.length === 0 ? (
									<p className="text-gray-500 text-center py-4">
										No skills requested yet
									</p>
								) : (
									mySkills.map((skillItem) => (
										<div
											key={skillItem.id}
											className="flex items-center justify-between p-3 bg-gray-50 rounded"
										>
											<div>
												<p className="font-medium">
													{skillItem.skill.name}
												</p>
												<p className="text-sm text-gray-600">
													{skillItem.level}
												</p>
											</div>
											<Badge
												className={getStatusColor(
													skillItem.status
												)}
											>
												{skillItem.status}
											</Badge>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>

					{/* Available Skills */}
					<Card>
						<CardHeader>
							<CardTitle>Request New Skills</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3 max-h-96 overflow-y-auto">
								{allSkills.map((skill) => (
									<div
										key={skill.id}
										className="flex items-center justify-between p-3 bg-gray-50 rounded"
									>
										<div>
											<p className="font-medium">
												{skill.name}
											</p>
											{skill.category && (
												<p className="text-sm text-gray-600">
													{skill.category}
												</p>
											)}
										</div>
										<div className="flex space-x-2">
											<Button
												size="sm"
												onClick={() =>
													requestSkill(
														skill.id,
														'Beginner'
													)
												}
											>
												Request
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
