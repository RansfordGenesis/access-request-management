"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	CheckCircle,
	XCircle,
	Clock,
	Database,
	Filter,
	Download,
	Search,
	Server,
	ChevronUp,
	ChevronDown,
	MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { DataTable } from "./data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Request {
	id: string;
	email: string;
	fullName: string;
	department: string;
	jobTitle: string;
	status: "Pending" | "Approved" | "Rejected";
	createdAt: string;
	mainAws?: string[];
	govAws?: string[];
	graylog?: string[];
	esKibana?: string[];
	otherAccess?: string[];
}

export function AdminDashboard({
	initialView = "pending",
}: {
	initialView?: "pending" | "active";
}) {
	const [requests, setRequests] = useState<Request[]>([]);
	const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { toast } = useToast();
	const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
	const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
		null
	);
	const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [sortBy, setSortBy] = useState<keyof Request>("createdAt");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState<string>(
		initialView === "active" ? "Approved" : "all"
	);
	const [departmentFilter, setDepartmentFilter] = useState<string>("all");
	const { user } = useAuth();
	const router = useRouter();

	useEffect(() => {
		fetchRequests();
	}, []);

	useEffect(() => {
		const sorted = [...requests].sort((a, b) => {
			if (sortBy === "createdAt") {
				return sortOrder === "desc"
					? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					: new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
			}
			const aValue = a[sortBy];
			const bValue = b[sortBy];
			if (typeof aValue === "string" && typeof bValue === "string") {
				return sortOrder === "desc"
					? bValue.localeCompare(aValue)
					: aValue.localeCompare(bValue);
			}
			return 0;
		});

		const filtered = sorted.filter(
			(request) =>
				(filterStatus === "all" || request.status === filterStatus) &&
				(departmentFilter === "all" ||
					request.department === departmentFilter) &&
				(searchTerm === "" ||
					request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
					request.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					request.department.toLowerCase().includes(searchTerm.toLowerCase()))
		);

		setFilteredRequests(filtered);
	}, [requests, sortBy, sortOrder, filterStatus, departmentFilter, searchTerm]);

	const fetchRequests = async () => {
		try {
			const response = await fetch("/api/get-requests");
			if (response.ok) {
				const data = await response.json();
				setRequests(data);
			} else {
				throw new Error("Failed to fetch requests");
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to fetch requests. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleApprove = async (id: string) => {
		const request = requests.find((r) => r.id === id);
		if (request) {
			setSelectedRequest(request);
			setSelectedRequestId(id);
			setIsApprovalDialogOpen(true);
		}
	};

	const handleReject = async (id: string) => {
		try {
			const response = await fetch(`/api/reject-request/${id}`, {
				method: "POST",
			});
			if (response.ok) {
				toast({
					title: "Request rejected",
					description:
						"The request has been rejected and an email has been sent to the requester.",
				});
				fetchRequests();
			} else {
				throw new Error("Failed to reject request");
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to reject request. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleApproveSelected = async (selectedAccess: string[]) => {
		if (!selectedRequestId || !selectedRequest) return;

		try {
			const payload = {
				RequestedBy: selectedRequest.email,
				Name: selectedRequest.fullName,
				Department: selectedRequest.department,
				"Job Title": selectedRequest.jobTitle,
				"Main AWS": selectedAccess.filter((access) =>
					selectedRequest.mainAws?.includes(access)
				),
				"Gov AWS": selectedAccess.filter((access) =>
					selectedRequest.govAws?.includes(access)
				),
				Graylog: selectedAccess.filter((access) =>
					selectedRequest.graylog?.includes(access)
				),
				ES: selectedAccess.filter((access) =>
					selectedRequest.esKibana?.includes(access)
				),
				Others: selectedAccess.filter((access) =>
					selectedRequest.otherAccess?.includes(access)
				),
				ApprovedBy: user?.email || "admin@example.com",
				UpdatedAt: new Date().toISOString(),
			};

			const response = await fetch(
				`/api/approve-request/${selectedRequestId}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				}
			);
			if (response.ok) {
				toast({
					title: "Request approved",
					description: "The selected access has been granted.",
				});
				fetchRequests();
				setIsApprovalDialogOpen(false);
			} else {
				throw new Error("Failed to approve request");
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to approve request. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleViewRequest = (request: Request) => {
		setSelectedRequest(request);
		setViewDialogOpen(true);
	};

	const columns: ColumnDef<Request>[] = [
		{
			accessorKey: "id",
			header: "Request ID",
		},
		{
			accessorKey: "email",
			header: "Email",
		},
		{
			accessorKey: "fullName",
			header: "Full Name",
		},
		{
			accessorKey: "department",
			header: "Department",
		},
		{
			accessorKey: "jobTitle",
			header: "Job Title",
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.getValue("status") as
					| "Approved"
					| "Rejected"
					| "Pending";
				const statusColors: Record<typeof status, string> = {
					Approved: "bg-green-100 text-green-800",
					Rejected: "bg-red-100 text-red-800",
					Pending: "bg-yellow-100 text-yellow-800",
				};
				return <Badge className={statusColors[status]}>{status}</Badge>;
			},
		},
		{
			accessorKey: "createdAt",
			header: "Created At",
			cell: ({ row }) => {
				const date = row.getValue("createdAt") as string;
				return format(new Date(date), "PPP");
			},
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const request = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onSelect={() => handleViewRequest(request)}>
								View details
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => handleApprove(request.id)}
								disabled={request.status !== "Pending"}
							>
								Approve
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => handleReject(request.id)}
								disabled={request.status !== "Pending"}
							>
								Reject
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	const ApprovalDialog = ({
		isOpen,
		onClose,
		onApprove,
		request,
	}: {
		isOpen: boolean;
		onClose: () => void;
		onApprove: (selectedAccess: string[]) => void;
		request: Request | null;
	}) => {
		const [selectedAccess, setSelectedAccess] = useState<string[]>([]);

		useEffect(() => {
			if (request) {
				setSelectedAccess([
					...(request.mainAws || []),
					...(request.govAws || []),
					...(request.graylog || []),
					...(request.esKibana || []),
					...(request.otherAccess || []),
				]);
			}
		}, [request]);

		if (!request) return null;

		const handleApprove = () => {
			onApprove(selectedAccess);
		};

		const renderCheckboxes = (title: string, items?: string[]) => {
			if (!items || items.length === 0) return null;
			return (
				<div>
					<h3 className="font-semibold mt-2">{title}</h3>
					{items.map((item) => (
						<div key={item} className="flex items-center">
							<Checkbox
								id={item}
								checked={selectedAccess.includes(item)}
								onCheckedChange={(checked) => {
									setSelectedAccess(
										checked
											? [...selectedAccess, item]
											: selectedAccess.filter((a) => a !== item)
									);
								}}
							/>
							<label htmlFor={item} className="ml-2">
								{item}
							</label>
						</div>
					))}
				</div>
			);
		};

		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Approve Access Request</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<p>Select the access to grant for {request.email}:</p>
						{renderCheckboxes("Main AWS Accounts", request.mainAws)}
						{renderCheckboxes("Gov AWS Accounts", request.govAws)}
						{renderCheckboxes("Graylog Access", request.graylog)}
						{renderCheckboxes("ES/Kibana Access", request.esKibana)}
						{renderCheckboxes("Other Access", request.otherAccess)}
					</div>
					<DialogFooter>
						<Button onClick={onClose} variant="outline">
							Cancel
						</Button>
						<Button onClick={handleApprove} variant="success">
							Approve Selected
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	};

	const ViewRequestDialog = ({
		isOpen,
		onClose,
		request,
	}: {
		isOpen: boolean;
		onClose: () => void;
		request: Request | null;
	}) => {
		if (!request) return null;

		const renderAccessList = (title: string, items?: string[]) => {
			if (!items?.length) return null;
			return (
				<div className="space-y-2">
					<h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
					<div className="grid grid-cols-1 gap-1.5">
						{items.map((item) => (
							<div
								key={item}
								className="flex items-center text-sm bg-muted/50 p-2 rounded-md break-all"
							>
								<span className="h-1.5 w-1.5 rounded-full bg-primary mr-2 shrink-0" />
								{item}
							</div>
						))}
					</div>
				</div>
			);
		};

		const statusColors = {
			Approved: "bg-green-100 text-green-800",
			Rejected: "bg-red-100 text-red-800",
			Pending: "bg-yellow-100 text-yellow-800",
		};

		// Filter out empty sections first
		const sections = [
			{ title: "Main AWS Accounts", data: request.mainAws },
			{ title: "Gov AWS Accounts", data: request.govAws },
			{ title: "Graylog Access", data: request.graylog },
			{ title: "ES/Kibana Access", data: request.esKibana },
			{ title: "Other Access", data: request.otherAccess },
		].filter((section) => section.data && section.data.length > 0);

		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle className="text-xl">Request Details</DialogTitle>
					</DialogHeader>

					<div className="grid grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Basic Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">
											Request ID
										</span>
										<span className="font-medium">{request.id}</span>
									</div>
									<Separator />
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">
											Status
										</span>
										<Badge
											className={
												statusColors[
													request.status as keyof typeof statusColors
												]
											}
										>
											{request.status}
										</Badge>
									</div>
									<Separator />
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">
											Created At
										</span>
										<span className="font-medium">
											{format(new Date(request.createdAt), "PPP")}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-base">User Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">
											Full Name
										</span>
										<span className="font-medium">{request.fullName}</span>
									</div>
									<Separator />
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Email</span>
										<span className="font-medium">{request.email}</span>
									</div>
									<Separator />
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">
											Department
										</span>
										<span className="font-medium">{request.department}</span>
									</div>
									<Separator />
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">
											Job Title
										</span>
										<span className="font-medium">{request.jobTitle}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle className="text-base">Requested Access</CardTitle>
						</CardHeader>
						<CardContent>
							<ScrollArea className="h-[200px]">
								<div className="space-y-6 pr-4">
									{sections.map((section, index) => (
										<div key={section.title}>
											{renderAccessList(section.title, section.data)}
											{index < sections.length - 1 && (
												<Separator className="my-4" />
											)}
										</div>
									))}
								</div>
							</ScrollArea>
						</CardContent>
					</Card>
				</DialogContent>
			</Dialog>
		);
	};

	const totalRequests = requests.length;
	const approvedRequests = requests.filter(
		(r) => r.status === "Approved"
	).length;
	const rejectedRequests = requests.filter(
		(r) => r.status === "Rejected"
	).length;
	const pendingRequests = requests.filter((r) => r.status === "Pending").length;

	const exportAllRequests = async () => {
		try {
			const response = await fetch("/api/export-requests", {
				method: "GET",
			});

			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");

				a.style.display = "none";
				a.href = url;
				a.download = "all_requests.csv";
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
			} else {
				throw new Error("Failed to export requests");
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to export requests. Please try again.",
				variant: "destructive",
			});
		}
	};

	const StatsCard = ({ title, value, icon, description, trend }: any) => (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{title}
				</CardTitle>
				{icon}
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between">
					<div className="text-2xl font-bold">{value}</div>
					{trend && (
						<div className={`flex items-center text-sm ${trend.color}`}>
							{trend.value >= 0 ? (
								<ChevronUp className="h-4 w-4" />
							) : (
								<ChevronDown className="h-4 w-4" />
							)}
							{Math.abs(trend.value)}%
						</div>
					)}
				</div>
				{description && (
					<p className="text-xs text-muted-foreground mt-1">{description}</p>
				)}
			</CardContent>
		</Card>
	);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<Skeleton className="h-8 w-[200px]" />
					<Skeleton className="h-10 w-[150px]" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className="h-4 w-[100px]" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-8 w-[60px]" />
							</CardContent>
						</Card>
					))}
				</div>
				<Card>
					<CardHeader>
						<Skeleton className="h-4 w-[150px]" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-[400px] w-full" />
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Access Requests</h1>
					<p className="text-muted-foreground mt-1">
						Manage and monitor access requests across all systems
					</p>
				</div>
				<Button onClick={exportAllRequests} className="flex items-center">
					<Download className="mr-2 h-4 w-4" />
					Export Requests
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<StatsCard
					title="Total Requests"
					value={totalRequests}
					icon={<Database className="h-4 w-4 text-muted-foreground" />}
					description="All time requests"
					trend={{ value: 12, color: "text-green-600" }}
				/>
				<StatsCard
					title="Approved"
					value={approvedRequests}
					icon={<CheckCircle className="h-4 w-4 text-green-500" />}
					description="Successfully approved"
					trend={{ value: 8, color: "text-green-600" }}
				/>
				<StatsCard
					title="Rejected"
					value={rejectedRequests}
					icon={<XCircle className="h-4 w-4 text-red-500" />}
					description="Denied requests"
					trend={{ value: -5, color: "text-red-600" }}
				/>
				<StatsCard
					title="Pending"
					value={pendingRequests}
					icon={<Clock className="h-4 w-4 text-yellow-500" />}
					description="Awaiting approval"
					trend={{ value: 3, color: "text-green-600" }}
				/>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Request Management</CardTitle>
						<Tabs defaultValue={filterStatus} onValueChange={setFilterStatus}>
							<TabsList>
								<TabsTrigger value="all">All</TabsTrigger>
								<TabsTrigger value="Pending">Pending</TabsTrigger>
								<TabsTrigger value="Approved">Approved</TabsTrigger>
								<TabsTrigger value="Rejected">Rejected</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Card className="bg-muted/50">
							<CardContent className="p-4">
								<div className="flex flex-wrap gap-4 items-center">
									<div className="flex-1 min-w-[200px] relative">
										<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Search by email, name, or department"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-9 w-full"
										/>
									</div>
									<div className="flex items-center gap-2">
										<Select
											value={departmentFilter}
											onValueChange={setDepartmentFilter}
										>
											<SelectTrigger className="w-[180px]">
												<SelectValue placeholder="Department" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Departments</SelectItem>
												{Array.from(
													new Set(requests.map((r) => r.department))
												).map((dept) => (
													<SelectItem key={dept} value={dept}>
														{dept}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Select
											value={sortBy}
											onValueChange={(value) =>
												setSortBy(value as keyof Request)
											}
										>
											<SelectTrigger className="w-[180px]">
												<SelectValue placeholder="Sort by" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="createdAt">Date</SelectItem>
												<SelectItem value="department">Department</SelectItem>
												<SelectItem value="status">Status</SelectItem>
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
								data={filteredRequests}
								pageSize={10}
								enableSorting={true}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<ApprovalDialog
				isOpen={isApprovalDialogOpen}
				onClose={() => setIsApprovalDialogOpen(false)}
				onApprove={handleApproveSelected}
				request={selectedRequest}
			/>

			<ViewRequestDialog
				isOpen={viewDialogOpen}
				onClose={() => setViewDialogOpen(false)}
				request={selectedRequest}
			/>
		</div>
	);
}
