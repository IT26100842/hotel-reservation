import { useEffect, useState } from 'react';

import { paymentApi } from '../services/api';
import type { PaymentRecord } from '../services/api';

import { billingApi } from '../services/billingApi';
import type { BillingSummary } from '../services/billingApi';

import { refundApi } from '../services/refundApi';
import type { RefundRecord } from '../services/refundApi';

import { paymentVoidApi } from '../services/paymentVoidApi';
import type { PaymentVoidRecord } from '../services/paymentVoidApi';

import { RefundForm } from './RefundForm';
import { PaymentVoidForm } from './PaymentVoidForm';

interface PaymentHistoryProps {
    bookingId: string;
    refreshKey?: number;
}

type HistoryPayment = PaymentRecord & {
    recordedAt?: string | null;
};

function formatMoney(amount: number): string {
    return amount.toLocaleString('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatDate(value?: string | null): string {
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
        timeStyle: 'short',
    });
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Could not load these records.';
}

function sameId(first: string, second: string): boolean {
    return first.toUpperCase() === second.toUpperCase();
}

export function PaymentHistory({
                                   bookingId,
                                   refreshKey = 0,
                               }: PaymentHistoryProps) {
    const [payments, setPayments] = useState<HistoryPayment[]>([]);
    const [refunds, setRefunds] = useState<RefundRecord[]>([]);
    const [voids, setVoids] = useState<PaymentVoidRecord[]>([]);
    const [summary, setSummary] = useState<BillingSummary | null>(null);

    const [loading, setLoading] = useState(true);
    const [paymentError, setPaymentError] = useState('');
    const [refundError, setRefundError] = useState('');
    const [voidError, setVoidError] = useState('');
    const [summaryError, setSummaryError] = useState('');

    const [reloadCount, setReloadCount] = useState(0);
    const [notice, setNotice] = useState('');

    useEffect(() => {
        setNotice('');
    }, [bookingId]);

    useEffect(() => {
        let cancelled = false;

        async function loadRecords() {
            setLoading(true);

            setPayments([]);
            setRefunds([]);
            setVoids([]);
            setSummary(null);

            setPaymentError('');
            setRefundError('');
            setVoidError('');
            setSummaryError('');

            const [
                paymentResult,
                summaryResult,
                refundResult,
                voidResult,
            ] = await Promise.allSettled([
                paymentApi.getByBookingId(bookingId),
                billingApi.getByBookingId(bookingId),
                refundApi.getByBookingId(bookingId),
                paymentVoidApi.getByBookingId(bookingId),
            ]);

            if (cancelled) {
                return;
            }

            if (paymentResult.status === 'fulfilled') {
                setPayments(paymentResult.value);
            } else {
                setPaymentError(getErrorMessage(paymentResult.reason));
            }

            if (summaryResult.status === 'fulfilled') {
                setSummary(summaryResult.value);
            } else {
                setSummaryError(getErrorMessage(summaryResult.reason));
            }

            if (refundResult.status === 'fulfilled') {
                setRefunds(refundResult.value);
            } else {
                setRefundError(getErrorMessage(refundResult.reason));
            }

            if (voidResult.status === 'fulfilled') {
                setVoids(voidResult.value);
            } else {
                setVoidError(getErrorMessage(voidResult.reason));
            }

            setLoading(false);
        }

        void loadRecords();

        return () => {
            cancelled = true;
        };
    }, [bookingId, refreshKey, reloadCount]);

    function handleSaved(message: string) {
        setNotice(message);
        setReloadCount((current) => current + 1);
    }

    return (
        <section className="space-y-4 rounded-xl border border-stone-200 p-4 text-stone-900 dark:border-stone-700 dark:text-white">
            <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">
                    Billing &amp; Payment History
                </h3>

                <button
                    type="button"
                    disabled={loading}
                    onClick={() => setReloadCount((current) => current + 1)}
                    className="rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 disabled:opacity-50"
                >
                    Refresh
                </button>
            </div>

            {notice && (
                <p role="status" className="text-sm text-green-700 dark:text-green-400">
                    {notice}
                </p>
            )}

            {loading ? (
                <p className="text-sm text-stone-500">
                    Loading billing records...
                </p>
            ) : (
                <>
                    {summaryError && (
                        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                            Billing: {summaryError}
                        </p>
                    )}

                    {summary && (
                        <div className="space-y-2 rounded-lg bg-stone-100 p-4 text-sm dark:bg-stone-800">
                            <div className="flex justify-between gap-3">
                                <span>Invoice total</span>
                                <span>LKR {formatMoney(summary.totalAmount)}</span>
                            </div>

                            <div className="flex justify-between gap-3">
                                <span>Recorded payment total</span>
                                <span>LKR {formatMoney(summary.receivedAmount)}</span>
                            </div>

                            <div className="flex justify-between gap-3">
                                <span>Voided amount</span>
                                <span>LKR {formatMoney(summary.voidedAmount)}</span>
                            </div>

                            <div className="flex justify-between gap-3">
                                <span>Refunds recorded</span>
                                <span>LKR {formatMoney(summary.refundedAmount)}</span>
                            </div>

                            <div className="flex justify-between gap-3 font-medium">
                                <span>Net paid amount</span>
                                <span>LKR {formatMoney(summary.paidAmount)}</span>
                            </div>

                            <div className="flex justify-between gap-3 border-t border-stone-300 pt-2 font-semibold dark:border-stone-600">
                                <span>Outstanding balance</span>
                                <span>LKR {formatMoney(summary.balanceAmount)}</span>
                            </div>

                            {summary.overpaidAmount > 0 && (
                                <div className="flex justify-between gap-3">
                                    <span>Overpaid amount</span>
                                    <span>LKR {formatMoney(summary.overpaidAmount)}</span>
                                </div>
                            )}

                            <p className="pt-1 font-medium">
                                Status: {summary.paymentStatus.replace(/_/g, ' ')}
                            </p>
                        </div>
                    )}

                    {paymentError && (
                        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                            Payments: {paymentError}
                        </p>
                    )}

                    {refundError && (
                        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                            Refunds: {refundError}
                        </p>
                    )}

                    {voidError && (
                        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                            Voids: {voidError}
                        </p>
                    )}

                    {(refundError || voidError) && (
                        <p className="text-sm text-stone-600 dark:text-stone-300">
                            Refund and void actions will be available after
                            both record lists load successfully. Try Refresh.
                        </p>
                    )}

                    {!paymentError && payments.length === 0 && (
                        <p className="text-sm text-stone-500">
                            No payment records for this booking.
                        </p>
                    )}

                    {!paymentError && payments.map((payment) => {
                        const paymentRefunds = refunds.filter((refund) =>
                            sameId(refund.paymentId, payment.paymentId)
                        );

                        const refundedCents = paymentRefunds.reduce(
                            (total, refund) =>
                                total + Math.round(refund.amount * 100),
                            0
                        );

                        const availableCents = Math.max(
                            Math.round(payment.amount * 100) - refundedCents,
                            0
                        );

                        const voidRecord = voids.find((record) =>
                            sameId(record.paymentId, payment.paymentId)
                        );

                        const recordsLoaded = !refundError && !voidError;

                        return (
                            <article
                                key={payment.paymentId}
                                className="space-y-3 rounded-lg border border-stone-200 p-4 dark:border-stone-700"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-medium">
                                        {payment.paymentMethod} — LKR{' '}
                                        {formatMoney(payment.amount)}
                                    </p>

                                    {voidRecord && (
                                        <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-300">
                      VOIDED
                    </span>
                                    )}
                                </div>

                                <div className="space-y-1 text-sm text-stone-600 dark:text-stone-300">
                                    <p className="break-all">
                                        Payment ID: {payment.paymentId}
                                    </p>

                                    <p>
                                        Recorded: {formatDate(payment.recordedAt)}
                                    </p>

                                    {payment.transactionReference && (
                                        <p className="break-all">
                                            Transaction reference:{' '}
                                            {payment.transactionReference}
                                        </p>
                                    )}

                                    {!refundError && (
                                        <p>
                                            Refunded: LKR{' '}
                                            {formatMoney(refundedCents / 100)}
                                        </p>
                                    )}
                                </div>

                                {voidRecord && (
                                    <div className="space-y-1 rounded-lg bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950 dark:text-red-200">
                                        <p>
                                            Voided: {formatDate(voidRecord.recordedAt)}
                                        </p>

                                        <p className="break-all">
                                            Void ID: {voidRecord.voidId}
                                        </p>

                                        <p className="whitespace-pre-wrap break-words">
                                            Reason: {voidRecord.reason}
                                        </p>
                                    </div>
                                )}

                                {recordsLoaded &&
                                    !voidRecord &&
                                    availableCents > 0 && (
                                        <details>
                                            <summary className="cursor-pointer text-sm font-medium">
                                                Record a refund
                                            </summary>

                                            <RefundForm
                                                paymentId={payment.paymentId}
                                                availableAmount={availableCents / 100}
                                                onSaved={() =>
                                                    handleSaved('Refund record saved.')
                                                }
                                            />
                                        </details>
                                    )}

                                {recordsLoaded &&
                                    !voidRecord &&
                                    availableCents === 0 && (
                                        <p className="text-sm font-medium">
                                            Fully refunded
                                        </p>
                                    )}

                                {recordsLoaded &&
                                    !voidRecord &&
                                    paymentRefunds.length === 0 && (
                                        <details>
                                            <summary className="cursor-pointer text-sm font-medium text-red-700 dark:text-red-400">
                                                Void an incorrect payment record
                                            </summary>

                                            <PaymentVoidForm
                                                paymentId={payment.paymentId}
                                                onSaved={() =>
                                                    handleSaved('Payment record voided.')
                                                }
                                            />
                                        </details>
                                    )}
                            </article>
                        );
                    })}

                    {!refundError && (
                        <div className="space-y-3 border-t border-stone-200 pt-4 dark:border-stone-700">
                            <h4 className="font-semibold">Refund History</h4>

                            {refunds.length === 0 ? (
                                <p className="text-sm text-stone-500">
                                    No refund records for this booking.
                                </p>
                            ) : (
                                refunds.map((refund) => (
                                    <article
                                        key={refund.refundId}
                                        className="space-y-1 rounded-lg border border-stone-200 p-3 text-sm dark:border-stone-700"
                                    >
                                        <p className="font-medium">
                                            LKR {formatMoney(refund.amount)}
                                        </p>

                                        <p>
                                            Recorded: {formatDate(refund.recordedAt)}
                                        </p>

                                        <p className="break-all">
                                            Refund ID: {refund.refundId}
                                        </p>

                                        <p className="break-all">
                                            Payment ID: {refund.paymentId}
                                        </p>

                                        <p className="whitespace-pre-wrap break-words">
                                            Reason: {refund.reason}
                                        </p>
                                    </article>
                                ))
                            )}
                        </div>
                    )}

                    <p className="text-xs text-stone-500">
                        Times are shown in Sri Lanka time.
                    </p>
                </>
            )}
        </section>
    );
}