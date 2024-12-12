import { RequestForm } from "@/components/request-form";

export default function RequestPage() {
	return (
		<div className="container mx-auto py-10">
			<h1 className="text-2xl font-bold mb-5">Access Request Form</h1>
			<RequestForm />
		</div>
	);
}
