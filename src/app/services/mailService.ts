/**
 * Service Abstraction for External Notifications (Email/SMS)
 * Integration Points: SendGrid, Twilio, etc.
 */

export class NotificationService {
    static async sendEmail(to: string, subject: string, body: string) {
        console.log(`[NotificationService] Sending Email to ${to}: ${subject}`);
        // Integration Logic Here (e.g. fetch to SendGrid API)
        return { success: true, messageId: `msg_${Date.now()}` };
    }

    static async sendSMS(to: string, message: string) {
        console.log(`[NotificationService] Sending SMS to ${to}: ${message}`);
        // Integration Logic Here (e.g. fetch to Twilio API)
        return { success: true };
    }

    static async notifyBookingConfirmation(email: string, room: string, date: string) {
        const subject = "Reservation Confirmed - Parkside Villa";
        const body = `Your stay in the ${room} for ${date} is confirmed. We look forward to welcoming you!`;
        return this.sendEmail(email, subject, body);
    }

    static async notifyAdminNewLead(lead: any) {
        const subject = `New Lead: ${lead.name}`;
        const body = `A new inquiry has been received for the ${lead.room}. Date: ${lead.date}`;
        return this.sendEmail("concierge@parksidevillakitui.com", subject, body);
    }
}
