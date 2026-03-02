import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.JWT_SECRET;
if (!secret) {
    if (process.env.NODE_ENV === "production") {
        throw new Error("CRITICAL: JWT_SECRET environment variable is missing. Authentication cannot proceed.");
    }
}
const SECRET_KEY = new TextEncoder().encode(secret || "dev_secret_only");

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect all /admin routes except login
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
        } catch (error) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
