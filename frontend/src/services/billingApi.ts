export interface BillingSummary {
    bookingId: string;
    totalAmount: number;
    receivedAmount: number;
    voidedAmount: number;
    refundedAmount: number;
    paidAmount: number;
    balanceAmount: number;
    overpaidAmount: number;
    paymentStatus: string;
}

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const billingApi = {
    async getByBookingId(
        bookingId: string
    ): Promise<BillingSummary> {
        const response = await fetch(
            `${BASE_URL}/billing/booking/${encodeURIComponent(bookingId)}`
        );

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));

            throw new Error(
                body.error || 'Could not load the billing summary.'
            );
        }

        return response.json() as Promise<BillingSummary>;
    },
};