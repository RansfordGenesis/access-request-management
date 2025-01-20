"use client";

import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
	children: React.ReactNode;
	adminOnly?: boolean;
}

const ProtectedRoute = ({
	children,
	adminOnly = false,
}: ProtectedRouteProps) => {
	const { isAuthenticated, isLoading, user } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading) {
			if (!isAuthenticated) {
				router.replace("/login");
			} else if (adminOnly && user?.role !== "admin") {
				// If trying to access admin routes without admin role, redirect to admin login
				router.replace("/admin/login");
			}
		}
	}, [isLoading, isAuthenticated, user, router, adminOnly]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	if (!isAuthenticated || (adminOnly && user?.role !== "admin")) {
		return null;
	}

	return (
		<>
			{children}
			{adminOnly && <div></div>}
		</>
	);
};

export default ProtectedRoute;
