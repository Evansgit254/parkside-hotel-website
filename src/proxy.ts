import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || "dev_secret_only"
);

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect all /admin routes except the login page
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        const token = request.cookies.get("admin_session")?.value;

        if (!token) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }

        try {
            const { payload } = await jwtVerify(token, SECRET_KEY);
            if (payload.role !== "admin") {
                return NextResponse.redirect(new URL("/admin/login", request.url));
            }
        } catch {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
