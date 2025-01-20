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
		"Ai labs",
		"Core payment",
		"Hubtel",
		"Hubtel developers",
		"Vortex",
	],
	"Gov AWS": ["Backup", "Logging", "Network", "Production"],
	Graylog: [
		"Fraud payment",
		"Hubtel customer and merchants",
		"Hubtel merchants",
		"Hubtel portals",
		"Hubtel qc",
		"Hubtel retailer",
		"Infosec",
		"Instant services",
		"Messaging and ussd",
		"Mobile",
		"Payments",
	],
	"ES/Kibana": [
		"Ecommerce search",
		"Elastic search stream",
		"Graylog",
		"Health",
		"Hubtel paylinks",
		"Instant services",
		"Internal audit",
		"Lend score",
		"Marketing portal",
		"Messaging",
		"Ml",
		"Receive money",
		"Risk profile",
		"Send money",
	],
	Others: [
		"Azure devops",
		"Business center",
		"Cloudflare",
		"Ghipss server",
		"Icc",
		"Kannel",
		"Metabase",
		"New relic",
		"Nita db server",
		"Nita web server",
		"Spacelift",
		"Webmin",
		"Windows jumpbox",
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
				{items.map((item: string) => (
					<li key={item}>{item}</li>
				))}
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
			<div className="flex justify-center items-center h-full">Loading...</div>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Filters</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Input
							placeholder="Filter by email"
							value={emailFilter}
							onChange={(e) => setEmailFilter(e.target.value)}
						/>
						<Input
							placeholder="Filter by name"
							value={nameFilter}
							onChange={(e) => setNameFilter(e.target.value)}
						/>
						<Select
							value={departmentFilter}
							onValueChange={setDepartmentFilter}
						>
							<SelectTrigger>
								<SelectValue placeholder="Filter by department" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={ALL_DEPARTMENTS}>All Departments</SelectItem>
								{departments.map((dept) => (
									<SelectItem key={dept} value={dept}>
										{dept}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex space-x-4">
						<Button onClick={() => generateReport("csv")}>Download CSV</Button>
						<Button onClick={() => generateReport("pdf")}>Download PDF</Button>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>User Access Table</CardTitle>
				</CardHeader>
				<CardContent>
					<DataTable columns={columns} data={filteredAccesses} />
				</CardContent>
			</Card>
		</div>
	);
}
