'use client'
import RequireAuth from '@/components/RequireAuth'
import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '@/lib/api'

const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

export default function RequestSkillPage() {
	const [skills, setSkills] = useState<any[]>([])
	const [skillId, setSkillId] = useState('')
	const [level, setLevel] = useState('Beginner')
	const [mine, setMine] = useState<any[]>([])
	function load() {
		apiGet('/skills').then(setSkills)
		apiGet('/skills/my').then(setMine)
	}
	useEffect(() => {
		load()
	}, [])
	async function submit() {
		if (!skillId) return
		await apiPost('/skills/request', { skillId: Number(skillId), level })
		setSkillId('')
		setLevel('Beginner')
		load()
	}
	return (
		<RequireAuth role="EMPLOYEE">
			<h1 className="text-xl font-semibold mb-4">Request Skill</h1>
			<div className="bg-white border rounded p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
				<select
					className="border rounded px-3 py-2"
					value={skillId}
					onChange={(e) => setSkillId(e.target.value)}
				>
					<option value="">Select skill</option>
					{skills.map((s) => (
						<option key={s.id} value={s.id}>
							{s.name}
						</option>
					))}
				</select>
				<select
					className="border rounded px-3 py-2"
					value={level}
					onChange={(e) => setLevel(e.target.value)}
				>
					{levels.map((l) => (
						<option key={l} value={l}>
							{l}
						</option>
					))}
				</select>
				<button
					onClick={submit}
					className="bg-blue-600 text-white rounded py-2"
				>
					Submit
				</button>
			</div>
			<h2 className="text-lg font-semibold mb-2">My Requests</h2>
			<div className="grid gap-3">
				{mine.map((r) => (
					<div key={r.id} className="p-4 bg-white border rounded">
						<div className="font-medium">{r.skill?.name}</div>
						<div className="text-sm">Level: {r.level}</div>
						<div className="text-sm">Status: {r.status}</div>
					</div>
				))}
				{mine.length === 0 && (
					<div className="text-sm text-gray-600">No requests</div>
				)}
			</div>
		</RequireAuth>
	)
}
