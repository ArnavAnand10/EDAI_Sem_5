export const API_BASE =
	process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api'

function getToken() {
	if (typeof window === 'undefined') return ''
	return (
		localStorage.getItem('auth_token') ||
		sessionStorage.getItem('auth_token') ||
		''
	)
}

export async function apiGet(path: string) {
	const res = await fetch(`${API_BASE}${path}`, {
		headers: { Authorization: `Bearer ${getToken()}` },
		cache: 'no-store',
	})
	// read body once
	const data = await res.json().catch(() => null)
	if (!res.ok) throw data || { error: 'Request failed' }
	// backend wraps the user under { user: {...} } for /users/me
	if (
		path === '/users/me' &&
		data &&
		typeof data === 'object' &&
		'user' in data
	) {
		return data.user
	}
	return data
}

export async function apiPost(path: string, body: any) {
	const res = await fetch(`${API_BASE}${path}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${getToken()}`,
		},
		body: JSON.stringify(body),
	})
	if (!res.ok)
		throw await res.json().catch(() => ({ error: 'Request failed' }))
	return res.json()
}

export async function apiPut(path: string, body: any) {
	const res = await fetch(`${API_BASE}${path}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${getToken()}`,
		},
		body: JSON.stringify(body),
	})
	if (!res.ok)
		throw await res.json().catch(() => ({ error: 'Request failed' }))
	return res.json()
}

export async function apiPatch(path: string, body: any) {
	const res = await fetch(`${API_BASE}${path}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${getToken()}`,
		},
		body: JSON.stringify(body),
	})
	if (!res.ok)
		throw await res.json().catch(() => ({ error: 'Request failed' }))
	return res.json()
}

export async function apiDelete(path: string) {
	const res = await fetch(`${API_BASE}${path}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${getToken()}` },
	})
	if (!res.ok)
		throw await res.json().catch(() => ({ error: 'Request failed' }))
	return res.json().catch(() => ({}))
}
