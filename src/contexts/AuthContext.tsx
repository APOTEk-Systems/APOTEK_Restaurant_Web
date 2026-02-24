import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
	useCallback,
} from 'react';
import { authService, AuthUser } from '@/services/authService';

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
		}
		setIsLoading(false);
	}, []);

	// Listen for storage changes (for multi-tab support)
	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'token' && !e.newValue) {
				// Token was removed - logout user
				setUser(null);
				authService.clearAuthData();
			}
		};

		window.addEventListener('storage', handleStorageChange);
		return () => window.removeEventListener('storage', handleStorageChange);
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		setIsLoading(true);
		try {
			const response = await authService.login({ email, password });
			setUser(response.user);
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
