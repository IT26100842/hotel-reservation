export interface PaymentVoidRecord {
    voidId: string;
    paymentId: string;
    bookingId: string;
    reason: string;
    recordedAt: string;
}

export interface CreatePaymentVoidPayload {
    requestId: string;
    paymentId: string;
    reason: string;
}

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function voidFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));

        throw new Error(
            body.error || 'Could not complete the payment void request.'
        );
    }

    return response.json() as Promise<T>;
}

export const paymentVoidApi = {
    create(
        payload: CreatePaymentVoidPayload
    ): Promise<PaymentVoidRecord> {
        return voidFetch<PaymentVoidRecord>('/payment-voids', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    getByBookingId(
        bookingId: string
    ): Promise<PaymentVoidRecord[]> {
        return voidFetch<PaymentVoidRecord[]>(
            `/payment-voids/booking/${encodeURIComponent(bookingId)}`
        );
    },
};