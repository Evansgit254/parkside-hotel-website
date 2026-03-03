import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getSecretKey(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret === "generate_a_secure_random_string_here") {
        if (process.env.NODE_ENV === "production") {
            throw new Error("CRITICAL: JWT_SECRET not configured for middleware.");
        }
        return new TextEncoder().encode("dev_secret_only_not_for_production");
    }
    return new TextEncoder().encode(secret);
}


export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect all /admin routes except the login page
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        const token = request.cookies.get("admin_session")?.value;

        if (!token) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }

        try {
            const { payload } = await jwtVerify(token, getSecretKey());
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
