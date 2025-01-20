"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
	const { login, isLoading, error, isAuthenticated } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isAuthenticated) {
			router.push("/request");
		}
	}, [isAuthenticated, router]);

	const handleLogin = async () => {
		try {
			await login();
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<Card className="w-[400px]">
				<CardHeader>
					<CardTitle>User Login</CardTitle>
				</CardHeader>
				<CardContent>
					{error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<Button onClick={handleLogin} className="w-full" disabled={isLoading}>
						{isLoading ? "Logging in..." : "Login with Microsoft"}
					</Button>
					<div className="mt-4 text-center">
						<Link
							href="/admin/login"
							className="text-sm text-blue-500 hover:underline"
						>
							Not a User? Login as Admin
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
