package com.wd50.Hotel_Reservation.service;

import com.wd50.Hotel_Reservation.model.PaymentModel;
import com.wd50.Hotel_Reservation.model.PaymentVoidModel;

import com.wd50.Hotel_Reservation.repository.PaymentRepository;
import com.wd50.Hotel_Reservation.repository.PaymentVoidRepository;
import com.wd50.Hotel_Reservation.repository.RefundRepository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

public class PaymentVoidService {

    private final PaymentRepository paymentRepository;
    private final PaymentVoidRepository voidRepository;
    private final RefundRepository refundRepository;

    public PaymentVoidService() {
        paymentRepository = new PaymentRepository();
        voidRepository = new PaymentVoidRepository();
        refundRepository = new RefundRepository();
    }

    public PaymentVoidModel voidPayment(
            String requestId,
            String paymentId,
            String reason) {

        synchronized (PaymentService.class) {

            String voidId = createVoidId(requestId);

            if (paymentId == null || paymentId.trim().isEmpty()) {
                throw new IllegalArgumentException(
                        "Payment ID is required"
                );
            }

            if (reason == null || reason.trim().isEmpty()) {
                throw new IllegalArgumentException(
                        "Void reason is required"
                );
            }

            String cleanPaymentId = paymentId.trim();
            String cleanReason = reason.trim();

            PaymentVoidModel existing =
                    voidRepository.findById(voidId);

            if (existing != null) {

                boolean samePayment = existing.getPaymentId()
                        .equalsIgnoreCase(cleanPaymentId);

                boolean sameReason =
                        existing.getReason().equals(cleanReason);

                if (samePayment && sameReason) {
                    return existing;
                }

                throw new IllegalArgumentException(
                        "Request ID was already used for another void"
                );
            }

            PaymentModel payment =
                    paymentRepository.findById(cleanPaymentId);

            if (payment == null) {
                throw new IllegalArgumentException(
                        "Payment not found"
                );
            }

            if (voidRepository.findByPaymentId(
                    payment.getPaymentId()) != null) {

                throw new IllegalArgumentException(
                        "Payment is already voided"
                );
            }

            if (!refundRepository.findByPaymentId(
                    payment.getPaymentId()).isEmpty()) {

                throw new IllegalArgumentException(
                        "A payment with refund records cannot be voided"
                );
            }

            PaymentVoidModel record = new PaymentVoidModel(
                    voidId,
                    payment.getPaymentId(),
                    payment.getBookingId(),
                    cleanReason,
                    Instant.now().toString()
            );

            voidRepository.save(record);

            return record;
        }
    }

    public ArrayList<PaymentVoidModel> getByBookingId(
            String bookingId) {

        if (bookingId == null || bookingId.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Booking ID is required"
            );
        }

        return voidRepository.findByBookingId(bookingId.trim());
    }

    private String createVoidId(String requestId) {

        if (requestId == null || requestId.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Request ID is required"
            );
        }

        try {
            return "VOID-" + UUID.fromString(requestId.trim());

        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Request ID must be a valid UUID"
            );
        }
    }
}