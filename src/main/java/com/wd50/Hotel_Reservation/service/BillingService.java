package com.wd50.Hotel_Reservation.service;

import com.wd50.Hotel_Reservation.model.InvoiceModel;
import com.wd50.Hotel_Reservation.model.PaymentModel;
import com.wd50.Hotel_Reservation.model.RefundModel;

import com.wd50.Hotel_Reservation.repository.InvoiceRepository;
import com.wd50.Hotel_Reservation.repository.PaymentRepository;
import com.wd50.Hotel_Reservation.repository.RefundRepository;
import com.wd50.Hotel_Reservation.repository.PaymentVoidRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Map;

public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final PaymentVoidRepository voidRepository;

    public BillingService() {
        invoiceRepository = new InvoiceRepository();
        paymentRepository = new PaymentRepository();
        refundRepository = new RefundRepository();
        voidRepository = new PaymentVoidRepository();
    }

    public Map<String, Object> getBookingBalance(String bookingId) {

        synchronized (PaymentService.class) {

            if (bookingId == null || bookingId.trim().isEmpty()) {
                throw new IllegalArgumentException(
                        "Booking ID cannot be empty"
                );
            }

            String cleanBookingId = bookingId.trim();

            ArrayList<InvoiceModel> invoices =
                    invoiceRepository.findByBookingId(cleanBookingId);

            if (invoices.isEmpty()) {
                throw new IllegalArgumentException(
                        "No invoices found for this booking"
                );
            }

            BigDecimal totalAmount = BigDecimal.ZERO;
            BigDecimal receivedAmount = BigDecimal.ZERO;
            BigDecimal refundedAmount = BigDecimal.ZERO;
            BigDecimal voidedAmount = BigDecimal.ZERO;

            for (InvoiceModel invoice : invoices) {
                totalAmount = totalAmount.add(
                        toMoney(invoice.getTotalAmount())
                );
            }

            for (PaymentModel payment :
                    paymentRepository.findByBookingId(cleanBookingId)) {

                BigDecimal amount = toMoney(payment.getAmount());

                receivedAmount = receivedAmount.add(amount);

                if (voidRepository.findByPaymentId(
                        payment.getPaymentId()) != null) {

                    voidedAmount = voidedAmount.add(amount);
                }
            }

            for (RefundModel refund :
                    refundRepository.findByBookingId(cleanBookingId)) {

                refundedAmount = refundedAmount.add(
                        toMoney(refund.getAmount())
                );
            }

            BigDecimal paidAmount = receivedAmount
                    .subtract(voidedAmount)
                    .subtract(refundedAmount);

            BigDecimal balanceAmount = totalAmount
                    .subtract(paidAmount)
                    .max(BigDecimal.ZERO);

            BigDecimal overpaidAmount = paidAmount
                    .subtract(totalAmount)
                    .max(BigDecimal.ZERO);

            String paymentStatus;

            if (paidAmount.compareTo(totalAmount) > 0) {
                paymentStatus = "OVERPAID";

            } else if (paidAmount.compareTo(totalAmount) == 0) {
                paymentStatus = "PAID";

            } else if (paidAmount.compareTo(BigDecimal.ZERO) == 0) {
                paymentStatus = "UNPAID";

            } else {
                paymentStatus = "PARTIALLY_PAID";
            }

            return Map.of(
                    "bookingId", cleanBookingId,
                    "totalAmount", totalAmount,
                    "receivedAmount", receivedAmount,
                    "voidedAmount", voidedAmount,
                    "refundedAmount", refundedAmount,
                    "paidAmount", paidAmount,
                    "balanceAmount", balanceAmount,
                    "overpaidAmount", overpaidAmount,
                    "paymentStatus", paymentStatus
            );
        }
    }

    private BigDecimal toMoney(double amount) {
        return BigDecimal.valueOf(amount)
                .setScale(2, RoundingMode.HALF_UP);
    }
}