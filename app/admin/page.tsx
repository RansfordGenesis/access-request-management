import { AdminDashboard } from "@/components/admin-dashboard";

export default function AdminPage() {
	return (
		<div className="container mx-auto py-10">
			<h1 className="text-2xl font-bold mb-5">Admin Dashboard</h1>
			<AdminDashboard />
		</div>
	);
}
