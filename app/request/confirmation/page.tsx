"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface RequestDetails {
	id: string;
	email: string;
	fullName: string;
	department: string;
	jobTitle: string;
	mainAws?: string[];
	govAws?: string[];
	graylog?: string[];
	esKibana?: string[];
	otherAccess?: string[];
	status: string;
	createdAt: string;
}

export default function ConfirmationPage() {
	const [request, setRequest] = useState<RequestDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const searchParams = useSearchParams();
	const { toast } = useToast();
	const { logout } = useAuth();
	const router = useRouter();
	const id = searchParams ? searchParams.get("id") : null;

	useEffect(() => {
		const fetchRequest = async () => {
			if (!id) {
				setError("No request ID provided");
				setIsLoading(false);
				return;
			}

			try {
				const response = await fetch(`/api/get-request/${id}`);
				if (response.ok) {
					const data = await response.json();
					setRequest(data);
				} else {
					throw new Error("Failed to fetch request");
				}
			} catch (error) {
				setError("Failed to fetch request details. Please try again.");
				toast({
					title: "Error",
					description: "Failed to fetch request details. Please try again.",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchRequest();
	}, [id, toast]);

	const handleLogout = () => {
		logout();
		router.push("/");
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="mt-4 text-muted-foreground">Loading request details...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<div className="text-destructive text-center">
					<h2 className="text-xl font-semibold mb-2">Error</h2>
					<p>{error}</p>
				</div>
			</div>
		);
	}

	if (!request) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<p className="text-muted-foreground">No request found</p>
			</div>
		);
	}

	const renderAccessList = (title: string, items?: string[]) => {
		if (!items?.length) return null;
		return (
			<div className="space-y-2">
				<h4 className="font-medium text-sm text-muted-foreground">{title}</h4>
				<ul className="space-y-1">
					{items.map((item: string) => (
						<li key={item} className="flex items-center text-sm">
							<span className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
							{item}
						</li>
					))}
				</ul>
			</div>
		);
	};

	const renderAccessSection = () => {
		const sections = [
			{ title: "Main AWS Accounts", data: request?.mainAws },
			{ title: "Gov AWS Accounts", data: request?.govAws },
			{ title: "Graylog Access", data: request?.graylog },
			{ title: "ES/Kibana Access", data: request?.esKibana },
			{ title: "Other Access", data: request?.otherAccess },
		];

		return sections
			.filter((section) => section.data?.length)
			.map((section, index, array) => (
				<div key={section.title}>
					{renderAccessList(section.title, section.data)}
					{index < array.length - 1 && <Separator className="my-4" />}
				</div>
			));
	};

	return (
		<div className="container max-w-3xl mx-auto py-10 px-4">
			<div className="flex flex-col items-center mb-8">
				<CheckCircle className="h-16 w-16 text-green-500 mb-4" />
				<h1 className="text-3xl font-bold text-center">
					Request Submitted Successfully
				</h1>
				<p className="text-muted-foreground mt-2">
					Your access request has been received and is being processed
				</p>
			</div>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Request Information</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-muted-foreground">Request ID</p>
							<p className="font-medium">{request.id}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Status</p>
							<p className="font-medium capitalize">{request.status}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Submitted On</p>
							<p className="font-medium">
								{new Date(request.createdAt).toLocaleString()}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Personal Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-muted-foreground">Full Name</p>
							<p className="font-medium">{request.fullName}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Email</p>
							<p className="font-medium">{request.email}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Department</p>
							<p className="font-medium">{request.department}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Job Title</p>
							<p className="font-medium">{request.jobTitle}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Requested Access</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">{renderAccessSection()}</CardContent>
			</Card>

			<div className="flex justify-center mt-8">
				<Button onClick={handleLogout} variant="outline" size="lg">
					Logout
				</Button>
			</div>
		</div>
	);
}
