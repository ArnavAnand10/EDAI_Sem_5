'use client'
import RequireAuth from '@/components/RequireAuth'
import TopNav from '@/components/TopNav'
import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function EmployeesPage() {
	const [items, setItems] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState<any>({
		firstName: '',
		lastName: '',
		department: '',
		companyId: '',
		email: '',
		password: '',
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
			firstName: form.firstName,
			lastName: form.lastName,
			department: form.department,
			companyId: form.companyId ? Number(form.companyId) : undefined,
			email: form.email,
			password: form.password,
		})
		setForm({
			firstName: '',
			lastName: '',
			department: '',
			companyId: '',
			email: '',
			password: '',
		})
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
			<div className="min-h-screen bg-gray-50">
				<TopNav />
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								Employees
							</h1>
							<p className="text-sm text-gray-600">
								Manage employees for your organization
							</p>
						</div>
						<div className="flex items-center gap-3">
							<Button
								variant="outline"
								size="sm"
								onClick={load}
								disabled={loading}
							>
								Refresh
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2">
							<Card>
								<CardHeader>
									<CardTitle>All Employees</CardTitle>
								</CardHeader>
								<CardContent>
									{loading ? (
										<div className="p-6 text-center text-sm">
											Loading...
										</div>
									) : items.length === 0 ? (
										<div className="p-6 text-center text-sm text-gray-600">
											No employees
										</div>
									) : (
										<div className="space-y-3">
											{items.map((e) => (
												<div
													key={e.id}
													className="p-4 bg-white border rounded flex items-center justify-between"
												>
													<div>
														<div className="font-medium text-gray-900">
															{e.firstName}{' '}
															{e.lastName}
														</div>
														<div className="text-sm text-gray-600">
															{e.email || '—'}
														</div>
														<div className="text-sm mt-1">
															<Badge variant="secondary">
																{e.department ||
																	'No Dept'}
															</Badge>
															<span className="ml-2 text-xs text-gray-500">
																Skills:{' '}
																{e._count
																	?.employeeSkills ??
																	0}
															</span>
														</div>
													</div>
													<div className="flex gap-2">
														<button
															className="text-sm text-indigo-600"
															onClick={() =>
																setEditing({
																	...e,
																	companyId:
																		e.companyId ||
																		'',
																})
															}
														>
															Edit
														</button>
														<button
															className="text-sm text-red-600"
															onClick={() =>
																remove(e.id)
															}
														>
															Delete
														</button>
													</div>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						<div>
							<Card>
								<CardHeader>
									<CardTitle>
										{editing
											? 'Edit Employee'
											: 'Create Employee'}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<input
											className="w-full border rounded px-3 py-2"
											placeholder="First name"
											value={
												editing
													? editing.firstName
													: form.firstName
											}
											onChange={(e) =>
												editing
													? setEditing({
															...editing,
															firstName:
																e.target.value,
													  })
													: setForm({
															...form,
															firstName:
																e.target.value,
													  })
											}
										/>
										<input
											className="w-full border rounded px-3 py-2"
											placeholder="Last name"
											value={
												editing
													? editing.lastName || ''
													: form.lastName
											}
											onChange={(e) =>
												editing
													? setEditing({
															...editing,
															lastName:
																e.target.value,
													  })
													: setForm({
															...form,
															lastName:
																e.target.value,
													  })
											}
										/>
										<input
											className="w-full border rounded px-3 py-2"
											placeholder="Department"
											value={
												editing
													? editing.department || ''
													: form.department
											}
											onChange={(e) =>
												editing
													? setEditing({
															...editing,
															department:
																e.target.value,
													  })
													: setForm({
															...form,
															department:
																e.target.value,
													  })
											}
										/>
										<input
											className="w-full border rounded px-3 py-2"
											placeholder="Company ID"
											value={
												editing
													? editing.companyId || ''
													: form.companyId
											}
											onChange={(e) =>
												editing
													? setEditing({
															...editing,
															companyId:
																e.target.value,
													  })
													: setForm({
															...form,
															companyId:
																e.target.value,
													  })
											}
										/>
										{!editing && (
											<>
												<input
													className="w-full border rounded px-3 py-2"
													placeholder="Email"
													value={form.email}
													onChange={(e) =>
														setForm({
															...form,
															email: e.target
																.value,
														})
													}
												/>
												<input
													className="w-full border rounded px-3 py-2"
													placeholder="Password"
													type="password"
													value={form.password}
													onChange={(e) =>
														setForm({
															...form,
															password:
																e.target.value,
														})
													}
												/>
											</>
										)}

										<div className="flex gap-2">
											{editing ? (
												<>
													<Button
														className="flex-1"
														onClick={update}
													>
														Save
													</Button>
													<Button
														variant="outline"
														className="flex-1"
														onClick={() =>
															setEditing(null)
														}
													>
														Cancel
													</Button>
												</>
											) : (
												<Button
													className="w-full"
													onClick={create}
												>
													Create Employee
												</Button>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</RequireAuth>
	)
}
