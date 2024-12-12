import "@/app/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import NextAuthSessionProvider from "@/components/session-provider";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Access Request Management System",
	description: "Manage access requests efficiently",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const headersList = headers();
	const pathname = headersList.get("x-pathname") || "/";
	const showHeader = pathname !== "/signin";

	return (
		<html lang="en">
			<body className={inter.className}>
				<NextAuthSessionProvider>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
						<div className="min-h-screen bg-background">
							{showHeader && <Header />}
							{children}
						</div>
						<Toaster />
					</ThemeProvider>
				</NextAuthSessionProvider>
			</body>
		</html>
	);
}
