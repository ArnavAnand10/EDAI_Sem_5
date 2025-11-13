'use client'

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Award, Users, TrendingUp, Shield, BriefcaseIcon } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
	const { user, loading } = useAuth()
	const router = useRouter()

	// If logged in, redirect to dashboard
	useEffect(() => {
		if (user && !loading) {
			const roleRoutes: Record<string, string> = {
				ADMIN: '/admin',
				HR: '/hr',
				MANAGER: '/manager',
				EMPLOYEE: '/employee',
			}
			router.push(roleRoutes[user.role] || '/employee')
		}
	}, [user, loading, router])

	// Show loading state
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p>Loading...</p>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Simple Navigation */}
			<nav className="bg-white border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-3">
							<Award className="w-8 h-8 text-blue-600" />
							<h1 className="text-xl font-bold text-gray-900">
								Employee Skill Rating System
							</h1>
						</div>
						<div className="flex space-x-3">
							<Link href="/auth/login">
								<Button variant="outline">Sign In</Button>
							</Link>
							<Link href="/auth/register">
								<Button>Register</Button>
							</Link>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="container mx-auto px-4 py-16">
				<div className="text-center max-w-3xl mx-auto">
					<h1 className="text-5xl font-bold mb-6 text-gray-900">
						Employee Skill Rating & AI Project Assignment
					</h1>
					<p className="text-xl text-gray-600 mb-8">
						Comprehensive skill management with self-rating, manager approval workflow, 
						and AI-powered project assignment using Google Gemini
					</p>
					<div className="flex gap-4 justify-center">
						<Link href="/auth/login">
							<Button size="lg">Get Started</Button>
						</Link>
						<Link href="/auth/register">
							<Button size="lg" variant="outline">
								Create Account
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="py-16 bg-white">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-center mb-12">
						Powerful Features for Every Role
					</h2>
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
						<Card>
							<CardHeader>
								<Users className="w-10 h-10 text-blue-600 mb-2" />
								<CardTitle>Employee Self-Rating</CardTitle>
								<CardDescription>
									Rate your skills and submit for manager approval
								</CardDescription>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader>
								<BriefcaseIcon className="w-10 h-10 text-green-600 mb-2" />
								<CardTitle>Manager Approvals</CardTitle>
								<CardDescription>
									Review and approve team skill ratings
								</CardDescription>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader>
								<Award className="w-10 h-10 text-purple-600 mb-2" />
								<CardTitle>AI Project Matching</CardTitle>
								<CardDescription>
									Google Gemini analyzes skills and matches candidates
								</CardDescription>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader>
								<Shield className="w-10 h-10 text-orange-600 mb-2" />
								<CardTitle>Role-Based Access</CardTitle>
								<CardDescription>
									4-tier access control: Employee, Manager, HR, Admin
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</div>
			</section>

			{/* System Roles */}
			<section className="py-16 bg-gray-50">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-center mb-12">
						Role-Based System Architecture
					</h2>
					<div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Users className="w-5 h-5 text-blue-600" />
									EMPLOYEE Role
								</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-gray-600 space-y-1">
								<p>• View and update personal profile</p>
								<p>• Self-rate skills (1-10 scale)</p>
								<p>• View rating history and status</p>
								<p>• Cannot see skill weights</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<BriefcaseIcon className="w-5 h-5 text-green-600" />
									MANAGER Role
								</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-gray-600 space-y-1">
								<p>• Approve/reject team skill ratings</p>
								<p>• View team member profiles</p>
								<p>• Request projects from HR</p>
								<p>• Approve final project assignments</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Award className="w-5 h-5 text-purple-600" />
									HR Role
								</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-gray-600 space-y-1">
								<p>• Create/manage skills with weights</p>
								<p>• Create AI-powered projects (Gemini)</p>
								<p>• View skill match percentages</p>
								<p>• Select candidates for approval</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Shield className="w-5 h-5 text-orange-600" />
									ADMIN Role
								</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-gray-600 space-y-1">
								<p>• Manage all users and roles</p>
								<p>• Assign managers to employees</p>
								<p>• Assign HR personnel</p>
								<p>• Full system access</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* AI Feature Highlight */}
			<section className="py-16 bg-blue-50">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto text-center">
						<h2 className="text-3xl font-bold mb-6">
							🤖 AI-Powered Smart Matching
						</h2>
						<p className="text-lg text-gray-700 mb-8">
							Our system uses <strong>Google Gemini AI</strong> to intelligently extract 
							skills from natural language project descriptions, with 20+ skill variations 
							for fuzzy matching. Dynamic Skill Index calculation ranks candidates based on 
							project-specific weights, ensuring the best fit for every assignment.
						</p>
						<div className="grid md:grid-cols-3 gap-4 text-left">
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Natural Language</CardTitle>
									<CardDescription>
										"Need React developer for 3 months"
									</CardDescription>
								</CardHeader>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle className="text-base">AI Extraction</CardTitle>
									<CardDescription>
										Gemini identifies: React, JavaScript, Frontend
									</CardDescription>
								</CardHeader>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Smart Matching</CardTitle>
									<CardDescription>
										Ranks candidates by Skill Index (0-100)
									</CardDescription>
								</CardHeader>
							</Card>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-8">
				<div className="container mx-auto px-4 text-center">
					<p className="mb-2">
						&copy; 2024 Employee Skill Rating System
					</p>
					<p className="text-sm text-gray-400">
						4-Role RBAC • AI Project Assignment • Manager Approval Workflow
					</p>
				</div>
			</footer>
		</div>
	)
}
