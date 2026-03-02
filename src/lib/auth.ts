import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = process.env.JWT_SECRET;
if (!secret) {
    if (process.env.NODE_ENV === "production") {
        throw new Error("CRITICAL: JWT_SECRET environment variable is missing. Authentication cannot proceed.");
    }
}
const SECRET_KEY = new TextEncoder().encode(secret || "dev_secret_only");

export async function signToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("2h")
        .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function getAuthSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return null;
    return await verifyToken(token);
}
