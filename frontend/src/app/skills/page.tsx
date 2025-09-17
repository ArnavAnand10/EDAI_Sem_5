'use client'
import RequireAuth from '@/components/RequireAuth'
import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '@/lib/api'

export default function SkillsPage() {
	const [skills, setSkills] = useState<any[]>([])
	const [me, setMe] = useState<any>(null)
	const [name, setName] = useState('')
	const [category, setCategory] = useState('')
	function load() {
		apiGet('/skills')
			.then(setSkills)
			.catch(() => setSkills([]))
	}
	useEffect(() => {
		load()
		apiGet('/users/me')
			.then(setMe)
			.catch(() => setMe(null))
	}, [])
	async function create() {
		await apiPost('/skills', { name, category: category || undefined })
		setName('')
		setCategory('')
		load()
	}
	return (
		<RequireAuth>
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-xl font-semibold">Global Skills</h1>
				<button onClick={load} className="text-sm text-blue-600">
					Refresh
				</button>
			</div>
			{me?.role === 'ADMIN' && (
				<div className="bg-white border rounded p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
					<input
						className="border rounded px-3 py-2"
						placeholder="Name"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<input
						className="border rounded px-3 py-2"
						placeholder="Category"
						value={category}
						onChange={(e) => setCategory(e.target.value)}
					/>
					<button
						onClick={create}
						className="bg-blue-600 text-white rounded py-2"
					>
						Create
					</button>
				</div>
			)}
			<div className="grid gap-3">
				{skills.map((s) => (
					<div key={s.id} className="p-4 bg-white border rounded">
						<div className="font-medium">{s.name}</div>
						<div className="text-sm text-gray-600">
							{s.category || '—'}
						</div>
					</div>
				))}
				{skills.length === 0 && (
					<div className="text-sm text-gray-600">No skills</div>
				)}
			</div>
		</RequireAuth>
	)
}
