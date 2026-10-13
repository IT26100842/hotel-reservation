import { useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { refundApi } from '../services/refundApi';

interface RefundFormProps {
    paymentId: string;
    availableAmount: number;
    onSaved: () => void;
}

export const RefundForm = ({
                               paymentId,
                               availableAmount,
                               onSaved
                           }: RefundFormProps) => {

    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [confirmed, setConfirmed] = useState(false);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

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

        setError('');

        const enteredAmount = Number(amount);

        if (!Number.isFinite(enteredAmount) || enteredAmount <= 0) {
            setError('Enter a refund amount greater than zero.');
            return;
        }

        const refundCents = Math.round(enteredAmount * 100);
        const availableCents = Math.round(availableAmount * 100);

        if (refundCents <= 0 || refundCents > availableCents) {
            setError('Refund exceeds the available refundable amount.');
            return;
        }

        if (!reason.trim()) {
            setError('Enter the refund reason.');
            return;
        }

        if (!confirmed) {
            setError('Confirm that the money has already been returned.');
            return;
        }

        submitting.current = true;
        setSaving(true);

        try {
            const details = {
                paymentId,
                amount: refundCents / 100,
                reason: reason.trim()
            };

            const storageKey =
                'pending-refund:' + JSON.stringify(details);

            let requestId = sessionStorage.getItem(storageKey);

            if (!requestId) {
                requestId = crypto.randomUUID();
                sessionStorage.setItem(storageKey, requestId);
            }

            await refundApi.create({
                ...details,
                requestId
            });

            sessionStorage.removeItem(storageKey);

            setAmount('');
            setReason('');
            setConfirmed(false);

            onSaved();

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Could not save the refund record.'
            );

        } finally {
            submitting.current = false;
            setSaving(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-3 rounded-lg border border-amber-300 p-3 space-y-3"
        >

            <p className="text-stone-600 dark:text-stone-300">
                Record money already returned to the guest.
                This form does not transfer money.
            </p>

            <p className="font-semibold">
                Refundable amount: LKR{' '}
                {availableAmount.toLocaleString('en-LK', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}
            </p>

            <fieldset disabled={saving} className="space-y-3">

                <label className="block">
          <span className="block mb-1">
            Refund amount (LKR)
          </span>

                    <input
                        type="number"
                        min="0.01"
                        max={availableAmount}
                        step="0.01"
                        required
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        className={inputStyle}
                    />
                </label>

                <label className="block">
          <span className="block mb-1">
            Reason
          </span>

                    <textarea
                        required
                        rows={2}
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        className={inputStyle}
                    />
                </label>

                <label className="flex items-start gap-2">
                    <input
                        type="checkbox"
                        required
                        checked={confirmed}
                        onChange={(event) =>
                            setConfirmed(event.target.checked)
                        }
                        className="mt-0.5"
                    />

                    <span>
            I confirm that this money has already been returned.
          </span>
                </label>

                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-amber-700 px-4 py-2 text-white hover:bg-amber-600 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Refund Record'}
                </button>

            </fieldset>

            {error && (
                <p
                    role="alert"
                    className="text-red-600 dark:text-red-400"
                >
                    {error}
                </p>
            )}

        </form>
    );
};