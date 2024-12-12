import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
	function middleware(req) {
		const token = req.nextauth.token;
		const isAdmin = token?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
		const pathname = req.nextUrl.pathname;

		// Redirect authenticated admin users trying to access /request to /admin
		if (isAdmin && pathname === "/request") {
			return NextResponse.redirect(new URL("/admin", req.url));
		}

		// Redirect non-admin users trying to access /admin to /request
		if (!isAdmin && pathname === "/admin") {
			return NextResponse.redirect(new URL("/request", req.url));
		}

		return NextResponse.next();
	},
	{
		callbacks: {
			authorized: ({ token }) => !!token,
		},
	}
);

export const config = {
	matcher: ["/admin", "/request", "/request/confirmation"],
};
