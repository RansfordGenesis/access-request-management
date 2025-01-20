"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const departments = [
	"Infrastructure Department",
	"Engineering",
	"Merchant Relations",
	"Direct-To-Customer",
	"User Experience & Marketing",
	"Commercial & New Markets",
	"Product & User Care",
	"Internal Affairs",
	"General Management",
	"Finance",
];

const mainAwsAccounts = [
	"Core Payment",
	"AI Labs",
	"Vortex",
	"Hubtel",
	"Hubtel Developers",
];
const govAwsAccounts = ["Logging", "Backup", "Network", "Production"];
const graylogAccess = [
	"Hubtel Merchants",
	"Payments",
	"Instant Services",
	"Mobile",
	"Messaging and USSD",
	"Hubtel QC",
	"Hubtel Portals",
	"Hubtel Retailer",
	"Hubtel Customer and Merchants",
	"Fraud Payment",
	"InfoSec",
];
const esKibanaAccess = [
	"Messaging ES",
	"Send Money ES",
	"Receive Money ES",
	"Ecommerce Search ES",
	"Elastic Search Stream ES",
	"Graylog ES",
	"Health OS",
	"Hubtel Paylinks ES",
	"Instant Services ES",
	"Internal Audit OS",
	"Lend Score OS",
	"Marketing Portal ES",
	"RIsk Profile OS",
	"ML ES",
];
const otherAccess = [
	"Metabase",
	"NITA DB Server",
	"NITA WEB Server",
	"New Relic",
	"Azure DevOps",
	"Cloudflare",
	"Windows JumpBox",
	"Kannel",
	"Business Center",
	"Spacelift",
	"Ghipss Server",
	"ICC",
	"Webmin",
];

const formSchema = z
	.object({
		email: z.string().email(),
		fullName: z.string().min(2).max(50),
		department: z.string().min(1, { message: "Department is required" }),
		jobTitle: z.string().min(2).max(50),
		mainAws: z.array(z.string()).optional(),
		govAws: z.array(z.string()).optional(),
		graylog: z.array(z.string()).optional(),
		esKibana: z.array(z.string()).optional(),
		otherAccess: z.array(z.string()).optional(),
	})
	.refine(
		(data) => {
			const totalSelected =
				(data.mainAws?.length || 0) +
				(data.govAws?.length || 0) +
				(data.graylog?.length || 0) +
				(data.esKibana?.length || 0) +
				(data.otherAccess?.length || 0);
			return totalSelected > 0;
		},
		{
			message: "Please select at least one access request from any section",
			path: ["mainAws"],
		}
	);

export function RequestForm() {
	const [department, setDepartment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { toast } = useToast();
	const router = useRouter();
	const { user } = useAuth();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			fullName: "",
			department: "",
			jobTitle: "",
			mainAws: [],
			govAws: [],
			graylog: [],
			esKibana: [],
			otherAccess: [],
		},
	});

	useEffect(() => {
		if (user) {
			form.setValue("email", user.email);
			form.setValue("fullName", user.name);
		}
	}, [user, form]);

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsSubmitting(true);
		setError(null);
		try {
			const response = await fetch("/api/submit-request", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			if (response.ok) {
				const result = await response.json();
				toast({
					title: "Request Submitted",
					description:
						"Your access request has been submitted successfully. An approval request has been sent to the approver.",
				});
				router.push(`/request/confirmation?id=${result.id}`);
			} else {
				throw new Error("Failed to submit request");
			}
		} catch (error) {
			setError("Failed to submit request. Please try again.");
			toast({
				title: "Error",
				description: "Failed to submit request. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	}

	const showAllSections =
		department === "Infrastructure Department" || department === "Engineering";

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<Card>
					<CardHeader>
						<CardTitle>Personal Information</CardTitle>
						<CardDescription>
							Your basic information from your account
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-6">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input {...field} disabled />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="fullName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Full Name</FormLabel>
										<FormControl>
											<Input {...field} disabled />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="department"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Department</FormLabel>
										<Select
											onValueChange={(value) => {
												field.onChange(value);
												setDepartment(value);
												// Reset access fields
												form.setValue("mainAws", []);
												form.setValue("govAws", []);
												form.setValue("graylog", []);
												form.setValue("esKibana", []);
												form.setValue("otherAccess", []);
											}}
											required
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a department" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{departments.map((dept) => (
													<SelectItem key={dept} value={dept}>
														{dept}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="jobTitle"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Job Title</FormLabel>
										<FormControl>
											<Input placeholder="Software Engineer" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</CardContent>
				</Card>

				{department && (
					<Card>
						<CardHeader>
							<CardTitle>Access Requests</CardTitle>
							<CardDescription>
								Select the systems and services you need access to
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-6">
								{(showAllSections ||
									department === "Infrastructure Department" ||
									department === "Engineering") && (
									<>
										<div className="grid md:grid-cols-2 gap-6">
											<Card>
												<CardHeader>
													<CardTitle className="text-base">
														Main AWS Accounts
													</CardTitle>
												</CardHeader>
												<CardContent>
													<ScrollArea className="h-[200px] pr-4">
														<FormField
															control={form.control}
															name="mainAws"
															render={() => (
																<FormItem className="space-y-2">
																	{mainAwsAccounts.map((account) => (
																		<FormField
																			key={account}
																			control={form.control}
																			name="mainAws"
																			render={({ field }) => {
																				return (
																					<FormItem
																						key={account}
																						className="flex flex-row items-start space-x-3 space-y-0"
																					>
																						<FormControl>
																							<Checkbox
																								checked={field.value?.includes(
																									account
																								)}
																								onCheckedChange={(checked) => {
																									return checked
																										? field.onChange([
																												...(field.value || []),
																												account,
																										  ])
																										: field.onChange(
																												field.value?.filter(
																													(value) =>
																														value !== account
																												) || []
																										  );
																								}}
																							/>
																						</FormControl>
																						<FormLabel className="font-normal">
																							{account}
																						</FormLabel>
																					</FormItem>
																				);
																			}}
																		/>
																	))}
																</FormItem>
															)}
														/>
													</ScrollArea>
												</CardContent>
											</Card>

											<Card>
												<CardHeader>
													<CardTitle className="text-base">
														Gov AWS Accounts
													</CardTitle>
												</CardHeader>
												<CardContent>
													<ScrollArea className="h-[200px] pr-4">
														<FormField
															control={form.control}
															name="govAws"
															render={() => (
																<FormItem className="space-y-2">
																	{govAwsAccounts.map((account) => (
																		<FormField
																			key={account}
																			control={form.control}
																			name="govAws"
																			render={({ field }) => {
																				return (
																					<FormItem
																						key={account}
																						className="flex flex-row items-start space-x-3 space-y-0"
																					>
																						<FormControl>
																							<Checkbox
																								checked={field.value?.includes(
																									account
																								)}
																								onCheckedChange={(checked) => {
																									return checked
																										? field.onChange([
																												...(field.value || []),
																												account,
																										  ])
																										: field.onChange(
																												field.value?.filter(
																													(value) =>
																														value !== account
																												) || []
																										  );
																								}}
																							/>
																						</FormControl>
																						<FormLabel className="font-normal">
																							{account}
																						</FormLabel>
																					</FormItem>
																				);
																			}}
																		/>
																	))}
																</FormItem>
															)}
														/>
													</ScrollArea>
												</CardContent>
											</Card>
										</div>

										<div className="grid md:grid-cols-2 gap-6">
											<Card>
												<CardHeader>
													<CardTitle className="text-base">
														Graylog Access
													</CardTitle>
												</CardHeader>
												<CardContent>
													<ScrollArea className="h-[200px] pr-4">
														<FormField
															control={form.control}
															name="graylog"
															render={() => (
																<FormItem className="space-y-2">
																	{graylogAccess.map((access) => (
																		<FormField
																			key={access}
																			control={form.control}
																			name="graylog"
																			render={({ field }) => {
																				return (
																					<FormItem
																						key={access}
																						className="flex flex-row items-start space-x-3 space-y-0"
																					>
																						<FormControl>
																							<Checkbox
																								checked={field.value?.includes(
																									access
																								)}
																								onCheckedChange={(checked) => {
																									return checked
																										? field.onChange([
																												...(field.value || []),
																												access,
																										  ])
																										: field.onChange(
																												field.value?.filter(
																													(value) =>
																														value !== access
																												) || []
																										  );
																								}}
																							/>
																						</FormControl>
																						<FormLabel className="font-normal">
																							{access}
																						</FormLabel>
																					</FormItem>
																				);
																			}}
																		/>
																	))}
																</FormItem>
															)}
														/>
													</ScrollArea>
												</CardContent>
											</Card>

											<Card>
												<CardHeader>
													<CardTitle className="text-base">
														ES/Kibana Access
													</CardTitle>
												</CardHeader>
												<CardContent>
													<ScrollArea className="h-[200px] pr-4">
														<FormField
															control={form.control}
															name="esKibana"
															render={() => (
																<FormItem className="space-y-2">
																	{esKibanaAccess.map((access) => (
																		<FormField
																			key={access}
																			control={form.control}
																			name="esKibana"
																			render={({ field }) => {
																				return (
																					<FormItem
																						key={access}
																						className="flex flex-row items-start space-x-3 space-y-0"
																					>
																						<FormControl>
																							<Checkbox
																								checked={field.value?.includes(
																									access
																								)}
																								onCheckedChange={(checked) => {
																									return checked
																										? field.onChange([
																												...(field.value || []),
																												access,
																										  ])
																										: field.onChange(
																												field.value?.filter(
																													(value) =>
																														value !== access
																												) || []
																										  );
																								}}
																							/>
																						</FormControl>
																						<FormLabel className="font-normal">
																							{access}
																						</FormLabel>
																					</FormItem>
																				);
																			}}
																		/>
																	))}
																</FormItem>
															)}
														/>
													</ScrollArea>
												</CardContent>
											</Card>
										</div>
									</>
								)}

								<Card>
									<CardHeader>
										<CardTitle className="text-base">Other Access</CardTitle>
									</CardHeader>
									<CardContent>
										<ScrollArea className="h-[200px] pr-4">
											<FormField
												control={form.control}
												name="otherAccess"
												render={() => (
													<FormItem className="space-y-2">
														{otherAccess.map((access) => (
															<FormField
																key={access}
																control={form.control}
																name="otherAccess"
																render={({ field }) => {
																	return (
																		<FormItem
																			key={access}
																			className="flex flex-row items-start space-x-3 space-y-0"
																		>
																			<FormControl>
																				<Checkbox
																					checked={field.value?.includes(
																						access
																					)}
																					onCheckedChange={(checked) => {
																						return checked
																							? field.onChange([
																									...(field.value || []),
																									access,
																							  ])
																							: field.onChange(
																									field.value?.filter(
																										(value) => value !== access
																									) || []
																							  );
																					}}
																				/>
																			</FormControl>
																			<FormLabel className="font-normal">
																				{access}
																			</FormLabel>
																		</FormItem>
																	);
																}}
															/>
														))}
													</FormItem>
												)}
											/>
										</ScrollArea>
									</CardContent>
								</Card>
							</div>
						</CardContent>
					</Card>
				)}

				<div className="flex justify-end space-x-4">
					<Button type="submit" disabled={isSubmitting} size="lg">
						{isSubmitting ? "Submitting..." : "Submit Request"}
					</Button>
				</div>

				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
			</form>
		</Form>
	);
}
