package com.wd50.Hotel_Reservation.model;

import java.time.Instant;
import java.time.format.DateTimeParseException;

public abstract class PaymentModel {

    private final String paymentId;
    private final String bookingId;
    private final double amount;
    private final String recordedAt;

    public PaymentModel(
            String paymentId,
            String bookingId,
            double amount) {

        this(
                paymentId,
                bookingId,
                amount,
                Instant.now().toString()
        );
    }

    public PaymentModel(
            String paymentId,
            String bookingId,
            double amount,
            String recordedAt) {

        if (paymentId == null || paymentId.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Payment ID cannot be empty"
            );
        }

        if (bookingId == null || bookingId.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Booking ID cannot be empty"
            );
        }

        if (!Double.isFinite(amount) || amount <= 0) {
            throw new IllegalArgumentException(
                    "Amount must be greater than zero"
            );
        }

        this.paymentId = paymentId.trim();
        this.bookingId = bookingId.trim();
        this.amount = amount;

        if (recordedAt == null || recordedAt.trim().isEmpty()) {

            this.recordedAt = null;

        } else {

            try {
                this.recordedAt =
                        Instant.parse(recordedAt.trim()).toString();

            } catch (DateTimeParseException e) {
                throw new IllegalArgumentException(
                        "Invalid payment date and time"
                );
            }
        }
    }

    public String getPaymentId() {
        return paymentId;
    }

    public String getBookingId() {
        return bookingId;
    }

    public double getAmount() {
        return amount;
    }

    public String getRecordedAt() {
        return recordedAt;
    }

    public abstract String getPaymentMethod();
}