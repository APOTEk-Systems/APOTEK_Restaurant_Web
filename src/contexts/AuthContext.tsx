import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
	useCallback,
} from 'react';
import { authService, AuthUser, LOGOUT_EVENT, USER_DATA_UPDATED_EVENT } from '@/services/authService';

interface AuthContextType {
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Check for existing session on mount
	useEffect(() => {
		const storedUser = authService.getUser();
		const token = authService.getToken();

		if (storedUser && token) {
			setUser(storedUser);

			if (!storedUser.permissions) {
				authService.refreshToken().then((success) => {
					if (success) {
						const refreshedUser = authService.getUser();
						if (refreshedUser) {
							setUser(refreshedUser);
						}
					}
				}).catch(() => {
					// silently fail
				});
			}
		}
		setIsLoading(false);
	}, []);

	// Listen for storage changes (for multi-tab support)
	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'token' && !e.newValue) {
				setUser(null);
				authService.clearAuthData();
			}
			if (e.key === 'user' && e.newValue) {
				try {
					setUser(JSON.parse(e.newValue));
				} catch {
					// ignore parse errors
				}
			}
		};

		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, []);

	// Listen for programmatic logout events (from API interceptor)
	useEffect(() => {
		const handleLogoutEvent = () => {
			// User was logged out programmatically (e.g., token refresh failed)
			setUser(null);
			// Redirect to login if not already there
			if (window.location.pathname !== '/login') {
				window.location.href = '/login';
			}
		};

		window.addEventListener(LOGOUT_EVENT, handleLogoutEvent);
		return () => window.removeEventListener(LOGOUT_EVENT, handleLogoutEvent);
	}, []);

	// Listen for same-tab user data updates (e.g., after refresh token or login)
	useEffect(() => {
		const handleUserDataUpdate = () => {
			const updatedUser = authService.getUser();
			if (updatedUser) {
				setUser(updatedUser);
			}
		};

		window.addEventListener(USER_DATA_UPDATED_EVENT, handleUserDataUpdate);
		return () => window.removeEventListener(USER_DATA_UPDATED_EVENT, handleUserDataUpdate);
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		setIsLoading(true);
		try {
			const response = await authService.login({ email, password });
			const userWithPermissions = { ...response.user, permissions: response.permissions };
			setUser(userWithPermissions);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const logout = useCallback(async () => {
		await authService.logout();
		setUser(null);
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: !!user,
				isLoading,
				login,
				logout,
			}}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
