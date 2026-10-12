package com.wd50.Hotel_Reservation.model;

import java.time.Instant;
import java.time.format.DateTimeParseException;

public class RefundModel {

    private final String refundId;
    private final String paymentId;
    private final String bookingId;
    private final double amount;
    private final String reason;
    private final String recordedAt;

    public RefundModel(
            String refundId,
            String paymentId,
            String bookingId,
            double amount,
            String reason,
            String recordedAt) {

        this.refundId = validateText(refundId, "Refund ID");
        this.paymentId = validateText(paymentId, "Payment ID");
        this.bookingId = validateText(bookingId, "Booking ID");
        this.reason = validateText(reason, "Refund reason");

        if (!Double.isFinite(amount) || amount <= 0) {
            throw new IllegalArgumentException(
                    "Refund amount must be greater than zero"
            );
        }

        this.amount = amount;

        if (recordedAt == null || recordedAt.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Refund date is required"
            );
        }

        try {
            this.recordedAt =
                    Instant.parse(recordedAt.trim()).toString();

        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException(
                    "Invalid refund date"
            );
        }
    }

    public String getRefundId() {
        return refundId;
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

    public String getReason() {
        return reason;
    }

    public String getRecordedAt() {
        return recordedAt;
    }

    private String validateText(String text, String fieldName) {

        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    fieldName + " cannot be empty"
            );
        }

        return text.trim();
    }
}