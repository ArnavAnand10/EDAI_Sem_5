'use client'
import RequireAuth from '@/components/RequireAuth'
import Link from 'next/link'

export default function AdminHome() {
	return (
		<RequireAuth role="ADMIN">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<Link
					href="/admin/employees"
					className="p-6 bg-white rounded-lg border"
				>
					Manage Employees
				</Link>
				<Link
					href="/companies"
					className="p-6 bg-white rounded-lg border"
				>
					Manage Companies
				</Link>
				<Link href="/skills" className="p-6 bg-white rounded-lg border">
					Global Skills
				</Link>
				<Link
					href="/admin/skill-requests"
					className="p-6 bg-white rounded-lg border"
				>
					Approve Requests
				</Link>
			</div>
		</RequireAuth>
	)
}
