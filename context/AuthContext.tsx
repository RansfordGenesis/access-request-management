"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../config/auth";

interface User {
	email: string;
	name: string;
	role: "admin" | "user";
}

interface AuthContextType {
	isAuthenticated: boolean;
	user: User | null;
	login: () => Promise<void>;
	adminLogin: (email: string, password: string) => Promise<void>;
	logout: () => void;
	adminLogout: () => void;
	isLoading: boolean;
	error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const { instance, accounts } = useMsal();

	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = async () => {
		if (accounts.length > 0) {
			try {
				const response = await instance.acquireTokenSilent({
					...loginRequest,
					account: accounts[0],
				});
				setIsAuthenticated(true);
				setUser({
					email: response.account?.username || "",
					name: response.account?.name || "",
					role: "user",
				});
			} catch (error) {
				console.error("Silent token acquisition failed", error);
			}
		}
		setIsLoading(false);
	};

	const login = async () => {
		setError(null);
		try {
			const result = await instance.loginPopup(loginRequest);
			if (result) {
				setIsAuthenticated(true);
				setUser({
					email: result.account?.username || "",
					name: result.account?.name || "",
					role: "user",
				});
				router.push("/request");
			}
		} catch (error) {
			console.error("Login failed", error);
			setError("Login failed. Please try again.");
		}
	};

	const adminLogin = async (email: string, password: string) => {
		setError(null);
		// This is a placeholder. In a real application, you would validate these credentials securely.
		if (
			email === process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
			password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
		) {
			setIsAuthenticated(true);
			setUser({ email, name: "Admin", role: "admin" });
			router.push("/admin/panel");
		} else {
			setError("Invalid admin credentials");
		}
	};

	const logout = () => {
		instance.logoutPopup();
		setIsAuthenticated(false);
		setUser(null);
		router.push("/");
	};

	const adminLogout = () => {
		setIsAuthenticated(false);
		setUser(null);
		router.push("/admin/login");
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				user,
				login,
				adminLogin,
				logout,
				adminLogout,
				isLoading,
				error,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
