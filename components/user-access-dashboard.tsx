"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchIcon, Download, FileDown, Filter } from "lucide-react";

interface UserAccess {
	Email: string;
	Name: string;
	Job_Title: string;
	Department: string;
	ApprovedBy: string;
	[key: string]: string | string[];
}

const accessCategories: Record<string, string[]> = {
	"Main AWS": [
		"Main_Aws_Ai_labs",
		"Main_Aws_Core_payment",
		"Main_Aws_Hubtel",
		"Main_Aws_Hubtel_developers",
		"Main_Aws_Vortex",
	],
	"Gov AWS": [
		"Gov_Aws_Backup",
		"Gov_Aws_Logging",
		"Gov_Aws_Network",
		"Gov_Aws_Production",
	],
	Graylog: [
		"Graylog_Fraud_payment",
		"Graylog_Hubtel_customer_and_merchants",
		"Graylog_Hubtel_merchants",
		"Graylog_Hubtel_portals",
		"Graylog_Hubtel_qc",
		"Graylog_Hubtel_retailer",
		"Graylog_Infosec",
		"Graylog_Instant_services",
		"Graylog_Messaging_and_ussd",
		"Graylog_Mobile",
		"Graylog_Payments",
	],
	"ES/Kibana": [
		"ES_Ecommerce_search_es",
		"ES_Elastic_search_stream_es",
		"ES_Graylog_es",
		"ES_Health_os",
		"ES_Hubtel_paylinks_es",
		"ES_Instant_services_es",
		"ES_Internal_audit_os",
		"ES_Lend_score_os",
		"ES_Marketing_portal_es",
		"ES_Messaging_es",
		"ES_Ml_es",
		"ES_Receive_money_es",
		"ES_Risk_profile_os",
		"ES_Send_money_es",
	],
	Others: [
		"others_Azure_devops",
		"others_Business_center",
		"others_Cloudflare",
		"others_Ghipss_server",
		"others_Icc",
		"others_Kannel",
		"others_Metabase",
		"others_New_relic",
		"others_Nita_db_server",
		"others_Nita_web_server",
		"others_Spacelift",
		"others_Webmin",
		"others_Windows_jumpbox",
	],
};

const ALL_DEPARTMENTS = "all_departments";

const renderAccessList =
	(category: keyof typeof accessCategories) =>
	({ row }: { row: any }) => {
		const access = row.original;
		const items = accessCategories[category].filter(
			(item) => access[item] === "Yes"
		);

		if (items.length === 0) {
			return <span>N/A</span>;
		}

		return (
			<ul className="list-disc pl-5">
				{items.map((item: string) => {
					const prefix = item.split('_', 1)[0] + '_';
					return <li key={item}>{item.replace(prefix, '').replace(/_/g, ' ')}</li>;
				})}
			</ul>
		);
	};

const columns: ColumnDef<UserAccess>[] = [
	{ accessorKey: "Email", header: "Email" },
	{ accessorKey: "Name", header: "Name" },
	{ accessorKey: "Job_Title", header: "Job Title" },
	{ accessorKey: "Department", header: "Department" },
	{
		accessorKey: "Main AWS",
		header: "Main AWS",
		cell: renderAccessList("Main AWS"),
	},
	{
		accessorKey: "Gov AWS",
		header: "Gov AWS",
		cell: renderAccessList("Gov AWS"),
	},
	{
		accessorKey: "Graylog",
		header: "Graylog",
		cell: renderAccessList("Graylog"),
	},
	{
		accessorKey: "ES/Kibana",
		header: "ES/Kibana",
		cell: renderAccessList("ES/Kibana"),
	},
	{ accessorKey: "Others", header: "Others", cell: renderAccessList("Others") },
];

export function UserAccessDashboard() {
	const [userAccesses, setUserAccesses] = useState<UserAccess[]>([]);
	const [filteredAccesses, setFilteredAccesses] = useState<UserAccess[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [emailFilter, setEmailFilter] = useState("");
	const [nameFilter, setNameFilter] = useState("");
	const [departmentFilter, setDepartmentFilter] = useState(ALL_DEPARTMENTS);
	const { toast } = useToast();
	const router = useRouter();

	useEffect(() => {
		fetchUserAccesses();
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			fetchUserAccesses();
		}, 30000); // Poll every 30 seconds

		return () => clearInterval(interval);
	}, []);

	const fetchUserAccesses = async () => {
		try {
			const response = await fetch("/api/get-user-accesses");
			if (response.ok) {
				const data = await response.json();
				setUserAccesses(data);
				setFilteredAccesses(data);
			} else {
				throw new Error("Failed to fetch user accesses");
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to fetch user accesses. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const filterAccesses = () => {
		let filtered = userAccesses;
		if (emailFilter) {
			filtered = filtered.filter((access) =>
				access.Email.toLowerCase().includes(emailFilter.toLowerCase())
			);
		}
		if (nameFilter) {
			filtered = filtered.filter((access) =>
				access.Name.toLowerCase().includes(nameFilter.toLowerCase())
			);
		}
		if (departmentFilter !== ALL_DEPARTMENTS) {
			filtered = filtered.filter(
				(access) => access.Department === departmentFilter
			);
		}
		setFilteredAccesses(filtered);
	};

	useEffect(() => {
		filterAccesses();
	}, [userAccesses, emailFilter, nameFilter, departmentFilter]);

	const generateReport = async (format: "csv" | "pdf") => {
		try {
			const response = await fetch(`/api/generate-report?format=${format}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(filteredAccesses),
			});

			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.style.display = "none";
				a.href = url;
				a.download = `user_accesses_report.${format}`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
			} else {
				throw new Error("Failed to generate report");
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to generate report. Please try again.",
				variant: "destructive",
			});
		}
	};

	const departments = Array.from(
		new Set(userAccesses.map((access) => access.Department))
	);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<Skeleton className="h-8 w-[200px]" />
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{[1, 2, 3].map((i) => (
									<Skeleton key={i} className="h-10" />
								))}
							</div>
							<Skeleton className="h-[400px]" />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">User Access Management</h1>
					<p className="text-muted-foreground mt-1">
						View and manage user access across all systems
					</p>
				</div>
				<div className="flex gap-2">
					<Button onClick={() => generateReport("csv")} variant="outline">
						<FileDown className="mr-2 h-4 w-4" />
						CSV
					</Button>
					<Button onClick={() => generateReport("pdf")}>
						<Download className="mr-2 h-4 w-4" />
						PDF
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Access Overview</CardTitle>
						<p className="text-sm text-muted-foreground">
							Total Users: {userAccesses.length}
						</p>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Card className="bg-muted/50">
							<CardContent className="p-4">
								<div className="flex flex-wrap gap-4 items-center">
									<div className="flex-1 min-w-[200px] relative">
										<SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Search by email or name"
											value={emailFilter}
											onChange={(e) => setEmailFilter(e.target.value)}
											className="pl-9"
										/>
									</div>
									<div className="flex gap-2">
										<Select
											value={departmentFilter}
											onValueChange={setDepartmentFilter}
										>
											<SelectTrigger className="w-[180px]">
												<SelectValue placeholder="Department" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={ALL_DEPARTMENTS}>
													All Departments
												</SelectItem>
												{departments.map((dept) => (
													<SelectItem key={dept} value={dept}>
														{dept}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Button variant="outline" size="icon">
											<Filter className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>

						<div className="rounded-md border">
							<DataTable
								columns={columns}
								data={filteredAccesses}
								pageSize={10}
								enableSorting={true}
							/>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}