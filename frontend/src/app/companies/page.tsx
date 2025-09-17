'use client'
import RequireAuth from '@/components/RequireAuth'
import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'

export default function CompaniesPage() {
	const [items, setItems] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState<any>({
		name: '',
		industry: '',
		location: '',
	})
	const [editing, setEditing] = useState<any>(null)
	function load() {
		setLoading(true)
		apiGet('/companies')
			.then(setItems)
			.finally(() => setLoading(false))
	}
	useEffect(() => {
		load()
	}, [])
	async function create() {
		await apiPost('/companies', form)
		setForm({ name: '', industry: '', location: '' })
		load()
	}
	async function update() {
		await apiPut(`/companies/${editing.id}`, editing)
		setEditing(null)
		load()
	}
	async function remove(id: number) {
		await apiDelete(`/companies/${id}`)
		load()
	}
	return (
		<RequireAuth role="ADMIN">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<div className="flex items-center justify-between mb-3">
						<h1 className="text-xl font-semibold">Companies</h1>
						<button
							onClick={load}
							className="text-sm text-blue-600"
						>
							Refresh
						</button>
					</div>
					<div className="bg-white border rounded">
						{loading && (
							<div className="p-4 text-sm">Loading...</div>
						)}
						{!loading &&
							items.map((c) => (
								<div
									key={c.id}
									className="p-4 border-b last:border-b-0 flex items-center justify-between"
								>
									<div>
										<div className="font-medium">
											{c.name}
										</div>
										<div className="text-sm text-gray-600">
											{c.industry || '—'} •{' '}
											{c.location || '—'}
										</div>
									</div>
									<div className="flex gap-2">
										<button
											className="text-sm"
											onClick={() => setEditing({ ...c })}
										>
											Edit
										</button>
										<button
											className="text-sm text-red-600"
											onClick={() => remove(c.id)}
										>
											Delete
										</button>
									</div>
								</div>
							))}
						{!loading && items.length === 0 && (
							<div className="p-4 text-sm text-gray-600">
								No companies
							</div>
						)}
					</div>
				</div>
				<div>
					<h2 className="text-lg font-semibold mb-2">
						Create Company
					</h2>
					<div className="bg-white border rounded p-4 space-y-3">
						<input
							className="w-full border rounded px-3 py-2"
							placeholder="Name"
							value={form.name}
							onChange={(e) =>
								setForm({ ...form, name: e.target.value })
							}
						/>
						<input
							className="w-full border rounded px-3 py-2"
							placeholder="Industry"
							value={form.industry}
							onChange={(e) =>
								setForm({ ...form, industry: e.target.value })
							}
						/>
						<input
							className="w-full border rounded px-3 py-2"
							placeholder="Location"
							value={form.location}
							onChange={(e) =>
								setForm({ ...form, location: e.target.value })
							}
						/>
						<button
							onClick={create}
							className="w-full bg-blue-600 text-white rounded py-2"
						>
							Create
						</button>
					</div>
					{editing && (
						<div className="mt-6">
							<h2 className="text-lg font-semibold mb-2">
								Edit Company
							</h2>
							<div className="bg-white border rounded p-4 space-y-3">
								<input
									className="w-full border rounded px-3 py-2"
									value={editing.name}
									onChange={(e) =>
										setEditing({
											...editing,
											name: e.target.value,
										})
									}
								/>
								<input
									className="w-full border rounded px-3 py-2"
									value={editing.industry || ''}
									onChange={(e) =>
										setEditing({
											...editing,
											industry: e.target.value,
										})
									}
								/>
								<input
									className="w-full border rounded px-3 py-2"
									value={editing.location || ''}
									onChange={(e) =>
										setEditing({
											...editing,
											location: e.target.value,
										})
									}
								/>
								<div className="flex gap-2">
									<button
										onClick={update}
										className="flex-1 bg-blue-600 text-white rounded py-2"
									>
										Save
									</button>
									<button
										onClick={() => setEditing(null)}
										className="flex-1 border rounded py-2"
									>
										Cancel
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</RequireAuth>
	)
}
