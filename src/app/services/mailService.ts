/**
 * Notification Service — Resend Integration
 * Handles all transactional email communication for Parkside Villa.
 *
 * Setup:
 * 1. Sign up at https://resend.com
 * 2. Add and verify your domain (e.g. parksidevillakitui.com)
 * 3. Create an API key and add RESEND_API_KEY to your .env and Vercel env vars
 * 4. Set NOTIFICATION_FROM_EMAIL (e.g. "Parkside Villa <hello@parksidevillakitui.com>")
 * 5. Set NOTIFICATION_ADMIN_EMAIL (e.g. "concierge@parksidevillakitui.com")
 */

import { Resend } from "resend";

function getResend() {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
        console.warn("⚠️  RESEND_API_KEY not set — emails will be logged but not sent.");
        return null;
    }
    return new Resend(key);
}

const FROM_EMAIL = process.env.NOTIFICATION_FROM_EMAIL || "Parkside Villa <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.NOTIFICATION_ADMIN_EMAIL || "concierge@parksidevillakitui.com";

export class NotificationService {

    /**
     * Send a generic email. Falls back to console.log if Resend is not configured.
     */
    static async sendEmail(to: string, subject: string, body: string) {
        const resend = getResend();

        if (!resend) {
            console.log(`[NotificationService] (NO API KEY) Email to ${to}: ${subject}`);
            return { success: true, messageId: `local_${Date.now()}` };
        }

        try {
            const { data, error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: [to],
                subject,
                html: wrapHtml(subject, body),
            });

            if (error) {
                console.error("[NotificationService] Resend error:", error);
                return { success: false, error: error.message };
            }

            return { success: true, messageId: data?.id };
        } catch (err) {
            console.error("[NotificationService] Send failed:", err);
            return { success: false, error: "Email delivery failed" };
        }
    }

    /**
     * SMS stub — integrate Twilio or Africa's Talking when ready.
     */
    static async sendSMS(to: string, message: string) {
        console.log(`[NotificationService] SMS to ${to}: ${message}`);
        return { success: true };
    }

    /**
     * Notify guest of confirmed booking.
     */
    static async notifyBookingConfirmation(email: string, room: string, date: string) {
        const subject = "Reservation Confirmed — Parkside Villa";
        const body = `
            <p>Dear Guest,</p>
            <p>Your stay in the <strong>${room}</strong> for <strong>${date}</strong> has been confirmed.</p>
            <p>We look forward to welcoming you to Parkside Villa Kitui.</p>
            <p style="margin-top:2rem;color:#6B7280;font-size:0.875rem;">
                If you need to modify your reservation, please contact us at 
                <a href="mailto:${ADMIN_EMAIL}" style="color:#7C6E54;">${ADMIN_EMAIL}</a>.
            </p>
        `;
        return this.sendEmail(email, subject, body);
    }

    /**
     * Notify admin/concierge of a new lead/inquiry.
     */
    static async notifyAdminNewLead(lead: any) {
        const subject = `New Inquiry: ${lead.name}`;
        const body = `
            <p>A new guest inquiry has been received:</p>
            <table style="border-collapse:collapse;margin:1rem 0;">
                <tr><td style="padding:0.5rem 1rem;color:#6B7280;font-weight:600;">Name</td><td style="padding:0.5rem 1rem;">${lead.name}</td></tr>
                <tr><td style="padding:0.5rem 1rem;color:#6B7280;font-weight:600;">Email</td><td style="padding:0.5rem 1rem;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
                ${lead.phone ? `<tr><td style="padding:0.5rem 1rem;color:#6B7280;font-weight:600;">Phone</td><td style="padding:0.5rem 1rem;">${lead.phone}</td></tr>` : ""}
                ${lead.roomSlug ? `<tr><td style="padding:0.5rem 1rem;color:#6B7280;font-weight:600;">Room</td><td style="padding:0.5rem 1rem;">${lead.roomSlug}</td></tr>` : ""}
                ${lead.date ? `<tr><td style="padding:0.5rem 1rem;color:#6B7280;font-weight:600;">Date</td><td style="padding:0.5rem 1rem;">${lead.date}</td></tr>` : ""}
                ${lead.guests ? `<tr><td style="padding:0.5rem 1rem;color:#6B7280;font-weight:600;">Guests</td><td style="padding:0.5rem 1rem;">${lead.guests}</td></tr>` : ""}
            </table>
            <p style="margin-top:1rem;">
                <a href="https://www.parksidevillakitui.com/admin/leads" 
                   style="display:inline-block;padding:0.75rem 1.5rem;background:#7C6E54;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
                    View in Dashboard →
                </a>
            </p>
        `;
        return this.sendEmail(ADMIN_EMAIL, subject, body);
    }

    /**
     * Notify admin of a new public review submission.
     */
    static async notifyAdminNewReview(review: { name: string; title: string; text: string }) {
        const subject = `New Guest Review: ${review.name}`;
        const body = `
            <p>A new guest review has been submitted:</p>
            <blockquote style="margin:1rem 0;padding:1rem 1.5rem;border-left:4px solid #7C6E54;background:#F7F8FC;border-radius:0 8px 8px 0;">
                <p style="font-weight:600;margin-bottom:0.5rem;">"${review.title}"</p>
                <p style="color:#6B7280;line-height:1.6;">${review.text}</p>
                <p style="margin-top:0.75rem;font-size:0.875rem;color:#9CA3AF;">— ${review.name}</p>
            </blockquote>
            <p style="margin-top:1rem;">
                <a href="https://www.parksidevillakitui.com/admin/testimonials" 
                   style="display:inline-block;padding:0.75rem 1.5rem;background:#7C6E54;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
                    Review in Dashboard →
                </a>
            </p>
        `;
        return this.sendEmail(ADMIN_EMAIL, subject, body);
    }
}

/**
 * Wraps email body in a branded HTML template.
 */
function wrapHtml(subject: string, body: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#F7F8FC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FC;padding:2rem 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:2rem;text-align:center;">
                            <h1 style="margin:0;color:#C9A84C;font-size:1.5rem;font-weight:700;letter-spacing:0.05em;">
                                PARKSIDE VILLA
                            </h1>
                            <p style="margin:0.25rem 0 0;color:rgba(255,255,255,0.6);font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;">
                                Kitui's Premier Hospitality
                            </p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:2rem;">
                            ${body}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding:1.5rem 2rem;background:#F7F8FC;border-top:1px solid rgba(0,0,0,0.05);text-align:center;">
                            <p style="margin:0;font-size:0.75rem;color:#9CA3AF;">
                                Parkside Villa Kitui · Kitui, Kenya<br>
                                <a href="https://www.parksidevillakitui.com" style="color:#7C6E54;text-decoration:none;">www.parksidevillakitui.com</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}
