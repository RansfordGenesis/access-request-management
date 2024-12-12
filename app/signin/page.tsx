"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function SignIn() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const searchParams = useSearchParams();
	const { toast } = useToast();
	const callbackUrl = searchParams.get("callbackUrl") || "/";
	const error = searchParams.get("error");

	useEffect(() => {
		if (error) {
			toast({
				title: "Authentication Error",
				description: "Failed to sign in with Microsoft. Please try again.",
				variant: "destructive",
			});
		}
	}, [error, toast]);

	useEffect(() => {
		if (status === "authenticated") {
			if (session.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
				router.push("/admin");
			} else {
				router.push("/request");
			}
		}
	}, [session, status, router]);

	const handleSignIn = () => {
		signIn("azure-ad", { callbackUrl });
	};

	if (status === "loading") {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-background">
			<Card className="w-[380px]">
				<CardHeader>
					<h2 className="text-2xl font-semibold text-center">Sign In</h2>
					<p className="text-sm text-muted-foreground text-center">
						Use your Microsoft account to access the system
					</p>
				</CardHeader>
				<CardContent>
					<Button onClick={handleSignIn} className="w-full">
						Sign in with Microsoft
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
