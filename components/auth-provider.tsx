"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { authApi, setAuthToken, getAuthToken } from "@/lib/api-client"

/** Credentials for email/mobile + password login. */
export type AuthCredentials = { email?: string; mobile?: string; password: string }

/** Sign-up payload: display name, email, mobile, and password (server assigns username). */
export type RegisterCredentials = {
  name: string
  email: string
  mobile: string
  password: string
}

type AuthContextType = {
  /** JWT token if authenticated. */
  token: string | null
  /** True when user has a valid token. */
  isAuthenticated: boolean
  /** Login with email or mobile + password. */
  login: (creds: AuthCredentials) => Promise<void>
  /** Register; does not set token until email is verified. */
  register: (creds: RegisterCredentials) => Promise<{ message: string; email: string }>
  /** Exchange Google ID token for session. */
  loginWithGoogle: (credential: string) => Promise<void>
  /** Logout and clear token. */
  logout: () => void
  /** Set token (e.g. after verify-email or external auth). */
  setToken: (token: string | null) => void
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => ({ message: "", email: "" }),
  loginWithGoogle: async () => {},
  logout: () => {},
  setToken: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)

  useEffect(() => {
    setTokenState(getAuthToken())
  }, [])

  const setToken = useCallback((t: string | null) => {
    setAuthToken(t)
    setTokenState(t)
  }, [])

  const login = useCallback(
    async (creds: AuthCredentials) => {
      const res = await authApi.login(creds)
      setToken(res.token)
    },
    [setToken]
  )

  const register = useCallback(async (creds: RegisterCredentials) => {
    return authApi.register(creds)
  }, [])

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      const res = await authApi.googleAuth({ credential })
      setToken(res.token)
    },
    [setToken]
  )

  const logout = useCallback(() => {
    setToken(null)
  }, [setToken])

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login,
        register,
        loginWithGoogle,
        logout,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
