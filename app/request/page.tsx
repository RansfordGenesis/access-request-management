import { RequestForm } from "@/components/request-form";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Header } from "@/components/header";

export default function RequestPage() {
	return (
		<ProtectedRoute>
			<Header />
			<div className="container max-w-4xl mx-auto py-10 px-4">
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-bold mb-3">Access Request Form</h1>
					<p className="text-muted-foreground">
						Request access to various systems and services. Please fill out the
						form below with your details.
					</p>
				</div>
				<RequestForm />
			</div>
		</ProtectedRoute>
	);
}
