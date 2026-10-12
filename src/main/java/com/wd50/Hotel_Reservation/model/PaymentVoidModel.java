package com.wd50.Hotel_Reservation.model;

import java.time.Instant;
import java.time.format.DateTimeParseException;

public class PaymentVoidModel {

    private final String voidId;
    private final String paymentId;
    private final String bookingId;
    private final String reason;
    private final String recordedAt;

    public PaymentVoidModel(
            String voidId,
            String paymentId,
            String bookingId,
            String reason,
            String recordedAt) {

        this.voidId = validateId(voidId);
        this.paymentId = validateId(paymentId);
        this.bookingId = validateId(bookingId);

        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Void reason is required"
            );
        }

        this.reason = reason.trim();

        if (recordedAt == null || recordedAt.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Void date is required"
            );
        }

        try {
            this.recordedAt =
                    Instant.parse(recordedAt.trim()).toString();

        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException(
                    "Invalid void date"
            );
        }
    }

    public String getVoidId() {
        return voidId;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public String getBookingId() {
        return bookingId;
    }

    public String getReason() {
        return reason;
    }

    public String getRecordedAt() {
        return recordedAt;
    }

    private String validateId(String value) {

        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "ID cannot be empty"
            );
        }

        if (value.contains("|")
                || value.contains("\n")
                || value.contains("\r")) {

            throw new IllegalArgumentException(
                    "ID cannot contain | or new lines"
            );
        }

        return value.trim();
    }
}