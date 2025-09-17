'use client'
import RequireAuth from '@/components/RequireAuth'
import { useEffect, useState } from 'react'
import { apiGet, apiPatch } from '@/lib/api'

export default function AdminRequestsPage() {
	const [items, setItems] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	function load() {
		setLoading(true)
		apiGet('/skills/requests')
			.then(setItems)
			.finally(() => setLoading(false))
	}
	useEffect(() => {
		load()
	}, [])
	async function act(id: number, status: 'APPROVED' | 'REJECTED') {
		await apiPatch(`/skills/requests/${id}`, { status })
		load()
	}
	return (
		<RequireAuth role="ADMIN">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-xl font-semibold">Skill Requests</h1>
				<button onClick={load} className="text-sm text-blue-600">
					Refresh
				</button>
			</div>
			<div className="bg-white border rounded">
				{loading && <div className="p-4 text-sm">Loading...</div>}
				{!loading &&
					items.map((r) => (
						<div
							key={r.id}
							className="p-4 border-b last:border-b-0 flex items-center justify-between"
						>
							<div>
								<div className="font-medium">
									{r.employee?.firstName}{' '}
									{r.employee?.lastName}
								</div>
								<div className="text-sm text-gray-600">
									{r.skill?.name} • {r.level}
								</div>
								<div className="text-sm">
									Status: {r.status}
								</div>
							</div>
							<div className="flex gap-2">
								<button
									onClick={() => act(r.id, 'APPROVED')}
									className="text-sm bg-green-600 text-white rounded px-3 py-1"
								>
									Approve
								</button>
								<button
									onClick={() => act(r.id, 'REJECTED')}
									className="text-sm bg-red-600 text-white rounded px-3 py-1"
								>
									Reject
								</button>
							</div>
						</div>
					))}
				{!loading && items.length === 0 && (
					<div className="p-4 text-sm text-gray-600">No requests</div>
				)}
			</div>
		</RequireAuth>
	)
}
