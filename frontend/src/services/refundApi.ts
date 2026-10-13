export interface RefundRecord {
    refundId: string;
    paymentId: string;
    bookingId: string;
    amount: number;
    reason: string;
    recordedAt: string;
}

export interface CreateRefundPayload {
    requestId: string;
    paymentId: string;
    amount: number;
    reason: string;
}

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function refundFetch<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));

        throw new Error(
            body.error || 'Could not complete the refund request.'
        );
    }

    return response.json();
}

export const refundApi = {

    async create(
        refund: CreateRefundPayload
    ): Promise<RefundRecord> {

        return refundFetch<RefundRecord>('/refunds', {
            method: 'POST',
            body: JSON.stringify(refund)
        });
    },

    async getByBookingId(
        bookingId: string
    ): Promise<RefundRecord[]> {

        return refundFetch<RefundRecord[]>(
            `/refunds/booking/${encodeURIComponent(bookingId)}`
        );
    }
};