'use client'
import RequireAuth from '@/components/RequireAuth'
import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'

export default function EmployeesPage() {
	const [items, setItems] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState<any>({
		firstName: '',
		lastName: '',
		department: '',
		companyId: '',
	})
	const [editing, setEditing] = useState<any>(null)
	function load() {
		setLoading(true)
		apiGet('/employees')
			.then(setItems)
			.finally(() => setLoading(false))
	}
	useEffect(() => {
		load()
	}, [])
	async function create() {
		await apiPost('/employees', {
			...form,
			companyId: form.companyId ? Number(form.companyId) : undefined,
		})
		setForm({ firstName: '', lastName: '', department: '', companyId: '' })
		load()
	}
	async function update() {
		await apiPut(`/employees/${editing.id}`, {
			...editing,
			companyId: editing.companyId
				? Number(editing.companyId)
				: undefined,
		})
		setEditing(null)
		load()
	}
	async function remove(id: number) {
		await apiDelete(`/employees/${id}`)
		load()
	}
	return (
		<RequireAuth role="ADMIN">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<div className="flex items-center justify-between mb-3">
						<h1 className="text-xl font-semibold">Employees</h1>
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
							items.map((e) => (
								<div
									key={e.id}
									className="p-4 border-b last:border-b-0 flex items-center justify-between"
								>
									<div>
										<div className="font-medium">
											{e.firstName} {e.lastName}
										</div>
										<div className="text-sm text-gray-600">
											{e.department || '—'}
										</div>
									</div>
									<div className="flex gap-2">
										<button
											className="text-sm"
											onClick={() =>
												setEditing({
													...e,
													companyId:
														e.companyId || '',
												})
											}
										>
											Edit
										</button>
										<button
											className="text-sm text-red-600"
											onClick={() => remove(e.id)}
										>
											Delete
										</button>
									</div>
								</div>
							))}
						{!loading && items.length === 0 && (
							<div className="p-4 text-sm text-gray-600">
								No employees
							</div>
						)}
					</div>
				</div>
				<div>
					<h2 className="text-lg font-semibold mb-2">
						Create Employee
					</h2>
					<div className="bg-white border rounded p-4 space-y-3">
						<input
							className="w-full border rounded px-3 py-2"
							placeholder="First name"
							value={form.firstName}
							onChange={(e) =>
								setForm({ ...form, firstName: e.target.value })
							}
						/>
						<input
							className="w-full border rounded px-3 py-2"
							placeholder="Last name"
							value={form.lastName}
							onChange={(e) =>
								setForm({ ...form, lastName: e.target.value })
							}
						/>
						<input
							className="w-full border rounded px-3 py-2"
							placeholder="Department"
							value={form.department}
							onChange={(e) =>
								setForm({ ...form, department: e.target.value })
							}
						/>
						<input
							className="w-full border rounded px-3 py-2"
							placeholder="Company ID"
							value={form.companyId}
							onChange={(e) =>
								setForm({ ...form, companyId: e.target.value })
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
								Edit Employee
							</h2>
							<div className="bg-white border rounded p-4 space-y-3">
								<input
									className="w-full border rounded px-3 py-2"
									value={editing.firstName}
									onChange={(e) =>
										setEditing({
											...editing,
											firstName: e.target.value,
										})
									}
								/>
								<input
									className="w-full border rounded px-3 py-2"
									value={editing.lastName || ''}
									onChange={(e) =>
										setEditing({
											...editing,
											lastName: e.target.value,
										})
									}
								/>
								<input
									className="w-full border rounded px-3 py-2"
									value={editing.department || ''}
									onChange={(e) =>
										setEditing({
											...editing,
											department: e.target.value,
										})
									}
								/>
								<input
									className="w-full border rounded px-3 py-2"
									value={editing.companyId || ''}
									onChange={(e) =>
										setEditing({
											...editing,
											companyId: e.target.value,
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
