"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Shield, Users, Clock } from "lucide-react";

export default function Home() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "authenticated") {
			if (session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
				router.push("/admin");
			} else {
				router.push("/request");
			}
		}
	}, [session, status, router]);

	if (status === "loading") {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="container mx-auto px-4 py-16">
				<div className="text-center max-w-3xl mx-auto">
					<h1 className="text-4xl font-bold mb-6">
						Access Request Management System
					</h1>
					<p className="text-xl text-muted-foreground mb-8">
						Streamline your access management process with our secure and
						efficient platform
					</p>
					<Link href="/signin">
						<Button size="lg" className="gap-2">
							Get Started <ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>

			{/* Features Section */}
			<div className="bg-muted py-16">
				<div className="container mx-auto px-4">
					<div className="grid md:grid-cols-3 gap-8">
						<div className="bg-background p-6 rounded-lg shadow-sm">
							<div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
								<Shield className="h-6 w-6 text-primary" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Secure Access</h3>
							<p className="text-muted-foreground">
								Manage access requests securely with Microsoft authentication
							</p>
						</div>
						<div className="bg-background p-6 rounded-lg shadow-sm">
							<div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
								<Users className="h-6 w-6 text-primary" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Role-Based Control</h3>
							<p className="text-muted-foreground">
								Different access levels for administrators and regular users
							</p>
						</div>
						<div className="bg-background p-6 rounded-lg shadow-sm">
							<div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
								<Clock className="h-6 w-6 text-primary" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Efficient Process</h3>
							<p className="text-muted-foreground">
								Quick and easy request submission and approval workflow
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
