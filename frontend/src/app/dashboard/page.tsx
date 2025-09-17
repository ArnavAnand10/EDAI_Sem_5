'use client'
import RequireAuth from '@/components/RequireAuth'
import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'

export default function Dashboard() {
	const [mine, setMine] = useState<any[]>([])
	useEffect(() => {
		apiGet('/skills/my')
			.then(setMine)
			.catch(() => setMine([]))
	}, [])
	return (
		<RequireAuth role="EMPLOYEE">
			<h1 className="text-xl font-semibold mb-4">My Skills</h1>
			<div className="grid gap-3">
				{mine.map((s: any) => (
					<div key={s.id} className="p-4 bg-white border rounded">
						<div className="font-medium">{s.skill?.name}</div>
						<div className="text-sm text-gray-600">
							Level: {s.level}
						</div>
						<div className="text-sm">Status: {s.status}</div>
					</div>
				))}
				{mine.length === 0 && (
					<div className="text-sm text-gray-600">No skills yet</div>
				)}
			</div>
		</RequireAuth>
	)
}
