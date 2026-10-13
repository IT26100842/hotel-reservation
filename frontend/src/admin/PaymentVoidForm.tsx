import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { paymentVoidApi } from '../services/paymentVoidApi';

interface PaymentVoidFormProps {
    paymentId: string;
    onSaved: () => void;
}

export function PaymentVoidForm({
                                    paymentId,
                                    onSaved,
                                }: PaymentVoidFormProps) {
    const [reason, setReason] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const submitting = useRef(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (submitting.current) {
            return;
        }

        setError('');

        const cleanReason = reason.trim();

        if (!cleanReason) {
            setError('Enter the reason for voiding this record.');
            return;
        }

        if (!confirmed) {
            setError('Confirm that this payment record is incorrect.');
            return;
        }

        submitting.current = true;
        setSaving(true);

        try {
            const details = {
                paymentId,
                reason: cleanReason,
            };

            const storageKey =
                'pending-payment-void:' + JSON.stringify(details);

            let requestId = sessionStorage.getItem(storageKey);

            if (!requestId) {
                requestId = crypto.randomUUID();
                sessionStorage.setItem(storageKey, requestId);
            }

            await paymentVoidApi.create({
                ...details,
                requestId,
            });

            sessionStorage.removeItem(storageKey);

            setReason('');
            setConfirmed(false);
            onSaved();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Could not void the payment record.'
            );
        } finally {
            submitting.current = false;
            setSaving(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-3 space-y-3 rounded-lg border border-red-200 p-4 dark:border-red-900"
        >
            <p className="text-sm text-stone-600 dark:text-stone-300">
                Use this for an incorrectly recorded payment. The original
                record stays in the history but no longer counts towards
                the paid amount. This does not return money.
            </p>

            <fieldset disabled={saving} className="space-y-3">
                <div>
                    <label
                        htmlFor={`void-reason-${paymentId}`}
                        className="mb-1 block text-sm font-medium"
                    >
                        Reason
                    </label>

                    <textarea
                        id={`void-reason-${paymentId}`}
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Explain why this payment record is incorrect"
                        rows={3}
                        required
                        className="w-full rounded-lg border border-stone-300 bg-white p-3 text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                    />
                </div>

                <label className="flex items-start gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(event) => setConfirmed(event.target.checked)}
                        required
                        className="mt-1"
                    />

                    <span>
            I confirm that this is an incorrect payment record
            and should be voided.
          </span>
                </label>

                <button
                    type="submit"
                    className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Void Payment Record'}
                </button>
            </fieldset>

            {error && (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </form>
    );
}