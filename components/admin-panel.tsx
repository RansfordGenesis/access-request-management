"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Shield, Archive, Database, Server, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDashboard } from "./admin-dashboard";
import { UserAccessDashboard } from "./user-access-dashboard";
import { ModeToggle } from "./mode-toggle";

type View = "requests" | "databases" | "servers" | "services" | "user-access";

export function AdminPanel() {
	const { user, logout } = useAuth();
	const router = useRouter();
	const [currentView, setCurrentView] = useState<View>("requests");

	const handleLogout = () => {
		logout();
		router.push("/admin/login");
	};

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
			{/* Sidebar */}
			<div className="w-64 border-r bg-card p-6 space-y-6">
				<div className="flex items-center space-x-2">
					<Shield className="h-6 w-6 text-primary" />
					<h1 className="text-lg font-bold">Access Manager</h1>
				</div>

				<nav className="space-y-6">
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
							variant={currentView === "user-access" ? "secondary" : "ghost"}
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
								currentView === "servers" && "bg-primary/10 hover:bg-primary/15"
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

			{/* Main Content */}
			<div className="flex-1 overflow-auto">
				<header className="border-b">
					<div className="flex h-16 items-center gap-4 px-6">
						<div className="flex-1">
							<h1 className="text-sm">Admin View</h1>
							<p className="text-sm text-muted-foreground">
								You are viewing the dashboard as an administrator.
							</p>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-sm text-muted-foreground">
								{user?.email}
							</span>
							<ModeToggle />
							<Button variant="outline" onClick={handleLogout}>
								Logout
							</Button>
						</div>
					</div>
				</header>

				<main className="p-6">{renderMainContent()}</main>
			</div>
		</div>
	);
}
