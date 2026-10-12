package com.wd50.Hotel_Reservation.model;

public class CreditCardPayment extends PaymentModel {

    private final String transactionReference;

    public CreditCardPayment(
            String paymentId,
            String bookingId,
            double amount,
            String transactionReference) {

        super(paymentId, bookingId, amount);

        this.transactionReference =
                validateReference(transactionReference);
    }

    public CreditCardPayment(
            String paymentId,
            String bookingId,
            double amount,
            String transactionReference,
            String recordedAt) {

        super(paymentId, bookingId, amount, recordedAt);

        this.transactionReference =
                validateReference(transactionReference);
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public String getPaymentMethod() {
        return "CARD";
    }

    private String validateReference(String reference) {

        if (reference == null || reference.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Transaction reference cannot be empty"
            );
        }

        return reference.trim();
    }
}