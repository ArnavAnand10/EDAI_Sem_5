'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'HR' | 'ADMIN'

export interface User {
	id: number
	email: string
	role: UserRole
	employee?: {
		id: number
		firstName: string
		lastName: string
		department?: string
		position?: string
	}
}

interface AuthContextType {
	user: User | null
	token: string | null
	isLoading: boolean
	login: (email: string, password: string) => Promise<void>
	register: (data: RegisterData) => Promise<void>
	logout: () => void
	isAuthenticated: boolean
	hasRole: (roles: UserRole | UserRole[]) => boolean
}

interface RegisterData {
	email: string
	password: string
	firstName: string
	lastName?: string
	role?: UserRole
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [token, setToken] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const router = useRouter()

	// Load user from localStorage on mount
	useEffect(() => {
		const storedToken = localStorage.getItem('token')
		const storedUser = localStorage.getItem('user')

		if (storedToken && storedUser) {
			try {
				setToken(storedToken)
				setUser(JSON.parse(storedUser))
			} catch (error) {
				console.error('Failed to parse stored user:', error)
				localStorage.removeItem('token')
				localStorage.removeItem('user')
			}
		}
		setIsLoading(false)
	}, [])

	const login = async (email: string, password: string) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email, password }),
				}
			)

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || 'Login failed')
			}

			const data = await response.json()

			// Store token and user
			localStorage.setItem('token', data.token)
			localStorage.setItem('user', JSON.stringify(data.user))

			setToken(data.token)
			setUser(data.user)

			// Redirect based on role
			switch (data.user.role) {
				case 'ADMIN':
					router.push('/admin')
					break
				case 'HR':
					router.push('/hr')
					break
				case 'MANAGER':
					router.push('/manager')
					break
				case 'EMPLOYEE':
					router.push('/employee')
					break
				default:
					router.push('/employee')
			}
		} catch (error) {
			throw error
		}
	}

	const register = async (data: RegisterData) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				}
			)

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || 'Registration failed')
			}

			const result = await response.json()

			// Store token and user
			localStorage.setItem('token', result.token)
			localStorage.setItem('user', JSON.stringify(result.user))

			setToken(result.token)
			setUser(result.user)

			// Redirect based on role
			switch (result.user.role) {
				case 'ADMIN':
					router.push('/admin')
					break
				case 'HR':
					router.push('/hr')
					break
				case 'MANAGER':
					router.push('/manager')
					break
				case 'EMPLOYEE':
					router.push('/employee')
					break
				default:
					router.push('/employee')
			}
		} catch (error) {
			throw error
		}
	}

	const logout = () => {
		localStorage.removeItem('token')
		localStorage.removeItem('user')
		setToken(null)
		setUser(null)
		router.push('/auth/login')
	}

	const hasRole = (roles: UserRole | UserRole[]): boolean => {
		if (!user) return false
		const roleArray = Array.isArray(roles) ? roles : [roles]
		return roleArray.includes(user.role)
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				isLoading,
				login,
				register,
				logout,
				isAuthenticated: !!user && !!token,
				hasRole,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
