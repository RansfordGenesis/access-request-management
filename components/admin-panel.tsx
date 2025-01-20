"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield, Archive, Database, Server, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDashboard } from "./admin-dashboard";
import { UserAccessDashboard } from "./user-access-dashboard";
import { ModeToggle } from "./mode-toggle";
import { Separator } from "@/components/ui/separator";

type View = "requests" | "databases" | "servers" | "services" | "user-access";

export function AdminPanel() {
	const { user, adminLogout } = useAuth();
	const [currentView, setCurrentView] = useState<View>("requests");

	const renderMainContent = () => {
		switch (currentView) {
			case "requests":
				return <AdminDashboard />;
			case "user-access":
				return <UserAccessDashboard />;
			// case "databases":
			// case "servers":
			// case "services":
			default:
				return (
					<Card>
						<CardHeader>
							<CardTitle>Resource Management</CardTitle>
						</CardHeader>
						<CardContent>
							<p>Resource management features coming soon.</p>
						</CardContent>
					</Card>
				);
		}
	};

	return (
		<div className="flex min-h-screen bg-background">
			<div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
				<div className="flex flex-col h-full bg-card border-r">
					<div className="h-16 flex items-center px-6 border-b">
						<div className="flex items-center space-x-2">
							<Shield className="h-6 w-6 text-primary" />
							<h1 className="text-lg font-bold">Access Manager</h1>
						</div>
					</div>

					<div className="flex-1 flex flex-col min-h-0 py-4">
						<nav className="flex-1 px-4 space-y-4">
							<div className="space-y-2">
								<Button
									variant={currentView === "requests" ? "secondary" : "ghost"}
									className={cn(
										"w-full justify-start",
										currentView === "requests" &&
											"bg-primary/10 hover:bg-primary/15"
									)}
									onClick={() => setCurrentView("requests")}
								>
									<Archive className="mr-2 h-4 w-4" />
									Requests
								</Button>
								<Button
									variant={
										currentView === "user-access" ? "secondary" : "ghost"
									}
									className={cn(
										"w-full justify-start",
										currentView === "user-access" &&
											"bg-primary/10 hover:bg-primary/15"
									)}
									onClick={() => setCurrentView("user-access")}
								>
									<Shield className="mr-2 h-4 w-4" />
									User Access
								</Button>
							</div>

							<div className="space-y-2">
								<div className="text-sm font-semibold text-muted-foreground pl-4">
									Resources
								</div>
								<Button
									variant={currentView === "databases" ? "secondary" : "ghost"}
									className={cn(
										"w-full justify-start",
										currentView === "databases" &&
											"bg-primary/10 hover:bg-primary/15"
									)}
									onClick={() => setCurrentView("databases")}
								>
									<Database className="mr-2 h-4 w-4" />
									Databases
								</Button>
								<Button
									variant={currentView === "servers" ? "secondary" : "ghost"}
									className={cn(
										"w-full justify-start",
										currentView === "servers" &&
											"bg-primary/10 hover:bg-primary/15"
									)}
									onClick={() => setCurrentView("servers")}
								>
									<Server className="mr-2 h-4 w-4" />
									Servers
								</Button>
								<Button
									variant={currentView === "services" ? "secondary" : "ghost"}
									className={cn(
										"w-full justify-start",
										currentView === "services" &&
											"bg-primary/10 hover:bg-primary/15"
									)}
									onClick={() => setCurrentView("services")}
								>
									<Activity className="mr-2 h-4 w-4" />
									Services
								</Button>
							</div>
						</nav>
					</div>
				</div>
			</div>

			<div className="flex-1 pl-64">
				<header className="h-16 fixed top-0 right-0 left-64 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="flex h-full items-center gap-4 px-6">
						<div className="flex-1">
							<h2 className="text-sm font-semibold">Admin View</h2>
							<p className="text-sm text-muted-foreground">
								Viewing as {user?.email}
							</p>
						</div>
						<div className="flex items-center gap-4">
							<ModeToggle />
							<Button variant="outline" onClick={() => adminLogout()}>
								Logout
							</Button>
						</div>
					</div>
				</header>

				<main className="pt-24 px-8 pb-8">{renderMainContent()}</main>
			</div>
		</div>
	);
}
