import { useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { paymentApi } from '../services/api';
import { PaymentHistory } from './PaymentHistory';

interface PaymentFormProps {
    bookingId: string;
}

export const PaymentForm = ({ bookingId }: PaymentFormProps) => {

    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<'CASH' | 'CARD'>('CASH');
    const [reference, setReference] = useState('');

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [historyVersion, setHistoryVersion] = useState(0);

    const submitting = useRef(false);

    const inputStyle =
        'w-full rounded-lg border border-stone-300 p-2 ' +
        'bg-white text-stone-900 dark:bg-[#142621] dark:text-white';

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        if (submitting.current) {
            return;
        }

        setMessage('');
        setError('');

        const paymentAmount = Number(amount);

        if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
            setError('Enter an amount greater than zero.');
            return;
        }

        if (method === 'CARD' && !reference.trim()) {
            setError('Enter the card transaction reference.');
            return;
        }

        submitting.current = true;
        setSaving(true);

        try {
            const details = {
                bookingId,
                amount: paymentAmount,
                paymentMethod: method,
                transactionReference:
                    method === 'CARD' ? reference.trim() : undefined
            };

            const storageKey =
                'pending-payment:' + JSON.stringify(details);

            let requestId = sessionStorage.getItem(storageKey);

            if (!requestId) {
                requestId = crypto.randomUUID();
                sessionStorage.setItem(storageKey, requestId);
            }

            const payment = await paymentApi.create({
                ...details,
                requestId
            });

            sessionStorage.removeItem(storageKey);

            setMessage(
                `Payment record saved. ID: ${payment.paymentId}`
            );

            setAmount('');
            setReference('');

            setHistoryVersion((version) => version + 1);

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Could not save the payment record.'
            );

        } finally {
            submitting.current = false;
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4 text-stone-900 dark:text-white">

            <PaymentHistory
                bookingId={bookingId}
                refreshKey={historyVersion}
            />

            <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-stone-300 p-4 space-y-3"
            >

                <h3 className="font-semibold">
                    Record Received Payment
                </h3>

                <p className="text-xs text-stone-500 dark:text-stone-400">
                    Record cash received or a completed card-terminal transaction.
                </p>

                <fieldset disabled={saving} className="space-y-3">

                    <div>
                        <label
                            htmlFor="payment-amount"
                            className="block mb-1"
                        >
                            Amount received (LKR)
                        </label>

                        <input
                            id="payment-amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            required
                            value={amount}
                            onChange={(event) =>
                                setAmount(event.target.value)
                            }
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="payment-method"
                            className="block mb-1"
                        >
                            Payment method
                        </label>

                        <select
                            id="payment-method"
                            value={method}
                            onChange={(event) =>
                                setMethod(
                                    event.target.value === 'CARD' ? 'CARD' : 'CASH'
                                )
                            }
                            className={inputStyle}
                        >
                            <option value="CASH">
                                Cash received
                            </option>

                            <option value="CARD">
                                Completed card transaction
                            </option>
                        </select>
                    </div>

                    {method === 'CARD' && (
                        <div>
                            <label
                                htmlFor="payment-reference"
                                className="block mb-1"
                            >
                                Transaction reference
                            </label>

                            <input
                                id="payment-reference"
                                type="text"
                                required
                                value={reference}
                                onChange={(event) =>
                                    setReference(event.target.value)
                                }
                                className={inputStyle}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save Payment Record'}
                    </button>

                </fieldset>

                {message && (
                    <p
                        role="status"
                        className="text-green-700 dark:text-green-400 break-all"
                    >
                        {message}
                    </p>
                )}

                {error && (
                    <p
                        role="alert"
                        className="text-red-600 dark:text-red-400"
                    >
                        {error}
                    </p>
                )}

            </form>

        </div>
    );
};