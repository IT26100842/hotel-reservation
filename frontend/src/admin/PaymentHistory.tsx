import { useEffect, useState } from 'react';

import { paymentApi } from '../services/api';
import type { PaymentRecord } from '../services/api';

import { billingApi } from '../services/billingApi';
import type { BillingSummary } from '../services/billingApi';

import { refundApi } from '../services/refundApi';
import type { RefundRecord } from '../services/refundApi';

import { RefundForm } from './RefundForm';

interface PaymentHistoryProps {
    bookingId: string;
    refreshKey: number;
}

type HistoryPayment = PaymentRecord & {
    recordedAt?: string | null;
};

const formatMoney = (amount: number) => {
    return amount.toLocaleString('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const formatDate = (value?: string | null) => {

    if (!value) {
        return 'Not recorded';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Not recorded';
    }

    return date.toLocaleString('en-GB', {
        timeZone: 'Asia/Colombo',
        dateStyle: 'medium',
        timeStyle: 'short'
    });
};

const getErrorMessage = (error: unknown) => {
    return error instanceof Error
        ? error.message
        : 'Could not load records.';
};

export const PaymentHistory = ({
                                   bookingId,
                                   refreshKey
                               }: PaymentHistoryProps) => {

    const [payments, setPayments] = useState<HistoryPayment[]>([]);
    const [refunds, setRefunds] = useState<RefundRecord[]>([]);
    const [summary, setSummary] = useState<BillingSummary | null>(null);

    const [loading, setLoading] = useState(true);

    const [paymentError, setPaymentError] = useState('');
    const [refundError, setRefundError] = useState('');
    const [summaryError, setSummaryError] = useState('');

    const [reloadCount, setReloadCount] = useState(0);
    const [notice, setNotice] = useState('');

    useEffect(() => {

        let cancelled = false;

        const loadRecords = async () => {

            setLoading(true);

            setPaymentError('');
            setRefundError('');
            setSummaryError('');

            setPayments([]);
            setRefunds([]);
            setSummary(null);

            const results = await Promise.allSettled([
                paymentApi.getByBookingId(bookingId),
                billingApi.getByBookingId(bookingId),
                refundApi.getByBookingId(bookingId)
            ]);

            if (cancelled) {
                return;
            }

            const paymentResult = results[0];
            const summaryResult = results[1];
            const refundResult = results[2];

            if (paymentResult.status === 'fulfilled') {
                setPayments(paymentResult.value);
            } else {
                setPaymentError(
                    getErrorMessage(paymentResult.reason)
                );
            }

            if (summaryResult.status === 'fulfilled') {
                setSummary(summaryResult.value);
            } else {
                setSummaryError(
                    getErrorMessage(summaryResult.reason)
                );
            }

            if (refundResult.status === 'fulfilled') {
                setRefunds(refundResult.value);
            } else {
                setRefundError(
                    getErrorMessage(refundResult.reason)
                );
            }

            setLoading(false);
        };

        void loadRecords();

        return () => {
            cancelled = true;
        };

    }, [bookingId, refreshKey, reloadCount]);

    const handleRefundSaved = () => {
        setNotice('Refund record saved.');
        setReloadCount((count) => count + 1);
    };

    const getRefundedCents = (paymentId: string) => {

        return refunds
            .filter((refund) => refund.paymentId === paymentId)
            .reduce(
                (total, refund) =>
                    total + Math.round(refund.amount * 100),
                0
            );
    };

    return (
        <section className="rounded-xl border border-stone-300 p-4 space-y-4">

            <div className="flex items-center justify-between gap-3">

                <h3 className="font-semibold">
                    Billing &amp; Payment History
                </h3>

                <button
                    type="button"
                    disabled={loading}
                    onClick={() => setReloadCount((count) => count + 1)}
                    className="rounded-lg border border-stone-300 px-3 py-1.5 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>

            </div>

            {notice && (
                <p
                    role="status"
                    className="text-green-700 dark:text-green-400"
                >
                    {notice}
                </p>
            )}

            {loading && (
                <p role="status" className="text-stone-500 dark:text-stone-400">
                    Loading records...
                </p>
            )}

            {!loading && summary && (
                <div className="rounded-lg bg-stone-100 dark:bg-[#142621] p-3 space-y-2">

                    <div className="flex justify-between gap-3">
                        <span>Invoice total</span>
                        <strong>
                            LKR {formatMoney(summary.totalAmount)}
                        </strong>
                    </div>

                    <div className="flex justify-between gap-3">
                        <span>Payments received</span>
                        <strong>
                            LKR {formatMoney(summary.receivedAmount)}
                        </strong>
                    </div>

                    <div className="flex justify-between gap-3">
                        <span>Refunds recorded</span>
                        <strong>
                            LKR {formatMoney(summary.refundedAmount)}
                        </strong>
                    </div>

                    <div className="flex justify-between gap-3">
                        <span>Net paid amount</span>
                        <strong>
                            LKR {formatMoney(summary.paidAmount)}
                        </strong>
                    </div>

                    <div className="flex justify-between gap-3">
                        <span>Outstanding balance</span>
                        <strong>
                            LKR {formatMoney(summary.balanceAmount)}
                        </strong>
                    </div>

                    {summary.overpaidAmount > 0 && (
                        <div className="flex justify-between gap-3 text-amber-700 dark:text-amber-400">
                            <span>Overpaid amount</span>
                            <strong>
                                LKR {formatMoney(summary.overpaidAmount)}
                            </strong>
                        </div>
                    )}

                    <div className="flex justify-between gap-3 border-t border-stone-300 pt-2">
                        <span>Payment status</span>
                        <strong>
                            {summary.paymentStatus.replace(/_/g, ' ')}
                        </strong>
                    </div>

                </div>
            )}

            {summaryError && (
                <p role="alert" className="text-amber-700 dark:text-amber-400">
                    Billing summary: {summaryError}
                </p>
            )}

            {paymentError && (
                <p role="alert" className="text-red-600 dark:text-red-400">
                    Payment history: {paymentError}
                </p>
            )}

            {refundError && (
                <p role="alert" className="text-red-600 dark:text-red-400">
                    Refund history: {refundError}
                </p>
            )}

            {!loading && !paymentError && payments.length === 0 && (
                <p className="text-stone-500 dark:text-stone-400">
                    No payments recorded for this booking.
                </p>
            )}

            {!loading && !paymentError && payments.length > 0 && (
                <div className="space-y-3">

                    <h4 className="font-semibold">
                        Payments
                    </h4>

                    {payments.map((payment) => {

                        const refundedCents =
                            getRefundedCents(payment.paymentId);

                        const availableCents = Math.max(
                            0,
                            Math.round(payment.amount * 100) - refundedCents
                        );

                        return (
                            <article
                                key={payment.paymentId}
                                className="rounded-lg border border-stone-200 dark:border-stone-700 p-3 space-y-2"
                            >

                                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">
                    {payment.paymentMethod}
                  </span>

                                    <strong>
                                        LKR {formatMoney(payment.amount)}
                                    </strong>
                                </div>

                                <p className="text-stone-500 dark:text-stone-400">
                                    Recorded: {formatDate(payment.recordedAt)}
                                </p>

                                <p className="break-all">
                                    Payment ID: {payment.paymentId}
                                </p>

                                {payment.transactionReference && (
                                    <p className="break-all">
                                        Transaction reference: {payment.transactionReference}
                                    </p>
                                )}

                                {!refundError && (
                                    <p>
                                        Refunded: LKR {formatMoney(refundedCents / 100)}
                                    </p>
                                )}

                                {!refundError && availableCents > 0 && (
                                    <details>
                                        <summary className="cursor-pointer font-semibold text-amber-700 dark:text-amber-400">
                                            Record a refund
                                        </summary>

                                        <RefundForm
                                            paymentId={payment.paymentId}
                                            availableAmount={availableCents / 100}
                                            onSaved={handleRefundSaved}
                                        />
                                    </details>
                                )}

                                {!refundError && availableCents === 0 && (
                                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                                        Fully refunded
                                    </p>
                                )}

                            </article>
                        );
                    })}

                </div>
            )}

            {!loading && !refundError && (
                <div className="space-y-3">

                    <h4 className="font-semibold">
                        Refund History
                    </h4>

                    {refunds.length === 0 && (
                        <p className="text-stone-500 dark:text-stone-400">
                            No refunds recorded.
                        </p>
                    )}

                    {refunds.map((refund) => (
                        <article
                            key={refund.refundId}
                            className="rounded-lg border border-amber-300 dark:border-amber-800 p-3 space-y-2"
                        >

                            <strong>
                                LKR {formatMoney(refund.amount)}
                            </strong>

                            <p className="text-stone-500 dark:text-stone-400">
                                Recorded: {formatDate(refund.recordedAt)}
                            </p>

                            <p className="break-all">
                                Refund ID: {refund.refundId}
                            </p>

                            <p className="break-all">
                                Original payment: {refund.paymentId}
                            </p>

                            <p className="whitespace-pre-wrap break-words">
                                Reason: {refund.reason}
                            </p>

                        </article>
                    ))}

                </div>
            )}

            <p className="text-stone-500 dark:text-stone-400">
                Times shown in Sri Lanka time.
            </p>

        </section>
    );
};