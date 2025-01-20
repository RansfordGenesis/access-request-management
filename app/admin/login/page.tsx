"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { adminLogin, isLoading, error, clearError } = useAuth();
	const router = useRouter();

	const handleInputChange =
		(setter: React.Dispatch<React.SetStateAction<string>>) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setter(e.target.value);
			if (error) {
				clearError();
			}
		};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await adminLogin(email, password);
		} catch (error) {
			console.error("Admin login failed:", error);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<Card className="w-[400px]">
				<CardHeader>
					<CardTitle>Admin Login</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							type="email"
							placeholder="Admin Email"
							value={email}
							onChange={handleInputChange(setEmail)}
							required
						/>
						<Input
							type="password"
							placeholder="Password"
							value={password}
							onChange={handleInputChange(setPassword)}
							required
						/>
						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Logging in..." : "Admin Login"}
						</Button>
					</form>
					<div className="mt-4 text-center">
						<Link
							href="/login"
							className="text-sm text-blue-500 hover:underline"
						>
							Not an Admin? Login as User
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
