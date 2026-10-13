package com.wd50.Hotel_Reservation.service;

import com.wd50.Hotel_Reservation.model.PaymentModel;
import com.wd50.Hotel_Reservation.model.RefundModel;

import com.wd50.Hotel_Reservation.repository.PaymentRepository;
import com.wd50.Hotel_Reservation.repository.RefundRepository;
import com.wd50.Hotel_Reservation.repository.PaymentVoidRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

public class RefundService {

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final PaymentVoidRepository voidRepository;

    public RefundService() {
        paymentRepository = new PaymentRepository();
        refundRepository = new RefundRepository();
        voidRepository = new PaymentVoidRepository();
    }

    public RefundModel createRefund(
            String requestId,
            String paymentId,
            double amount,
            String reason) {

        synchronized (PaymentService.class) {

            String refundId = createRefundId(requestId);

            if (paymentId == null || paymentId.trim().isEmpty()) {
                throw new IllegalArgumentException(
                        "Payment ID is required"
                );
            }

            if (reason == null || reason.trim().isEmpty()) {
                throw new IllegalArgumentException(
                        "Refund reason is required"
                );
            }

            if (!Double.isFinite(amount) || amount <= 0) {
                throw new IllegalArgumentException(
                        "Refund amount must be greater than zero"
                );
            }

            BigDecimal refundAmount = toMoney(amount);

            if (refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException(
                        "Refund amount must be at least 0.01"
                );
            }

            String cleanPaymentId = paymentId.trim();
            String cleanReason = reason.trim();

            RefundModel existing =
                    refundRepository.findById(refundId);

            if (existing != null) {

                boolean samePayment = existing.getPaymentId()
                        .equalsIgnoreCase(cleanPaymentId);

                boolean sameAmount = toMoney(existing.getAmount())
                        .compareTo(refundAmount) == 0;

                boolean sameReason =
                        existing.getReason().equals(cleanReason);

                if (samePayment && sameAmount && sameReason) {
                    return existing;
                }

                throw new IllegalArgumentException(
                        "Request ID was already used for another refund"
                );
            }

            PaymentModel payment =
                    paymentRepository.findById(cleanPaymentId);

            if (payment == null) {
                throw new IllegalArgumentException(
                        "Original payment not found"
                );
            }

            if (voidRepository.findByPaymentId(
                    payment.getPaymentId()) != null) {

                throw new IllegalArgumentException(
                        "A voided payment cannot be refunded"
                );
            }

            BigDecimal alreadyRefunded = BigDecimal.ZERO;

            for (RefundModel refund :
                    refundRepository.findByPaymentId(
                            payment.getPaymentId()
                    )) {

                alreadyRefunded = alreadyRefunded.add(
                        toMoney(refund.getAmount())
                );
            }

            BigDecimal availableAmount = toMoney(payment.getAmount())
                    .subtract(alreadyRefunded);

            if (refundAmount.compareTo(availableAmount) > 0) {
                throw new IllegalArgumentException(
                        "Refund exceeds refundable amount: "
                                + availableAmount.toPlainString()
                );
            }

            RefundModel refund = new RefundModel(
                    refundId,
                    payment.getPaymentId(),
                    payment.getBookingId(),
                    refundAmount.doubleValue(),
                    cleanReason,
                    Instant.now().toString()
            );

            refundRepository.save(refund);

            return refund;
        }
    }

    public ArrayList<RefundModel> getRefundsByBookingId(
            String bookingId) {

        if (bookingId == null || bookingId.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Booking ID is required"
            );
        }

        return refundRepository.findByBookingId(bookingId.trim());
    }

    private BigDecimal toMoney(double amount) {
        return BigDecimal.valueOf(amount)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private String createRefundId(String requestId) {

        if (requestId == null || requestId.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Request ID is required"
            );
        }

        try {
            return "REF-" + UUID.fromString(requestId.trim());

        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Request ID must be a valid UUID"
            );
        }
    }
}