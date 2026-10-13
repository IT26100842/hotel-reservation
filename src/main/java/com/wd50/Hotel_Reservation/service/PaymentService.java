package com.wd50.Hotel_Reservation.service;

import com.wd50.Hotel_Reservation.model.PaymentModel;
import com.wd50.Hotel_Reservation.model.CashPayment;
import com.wd50.Hotel_Reservation.model.CreditCardPayment;
import com.wd50.Hotel_Reservation.model.InvoiceModel;
import com.wd50.Hotel_Reservation.model.RefundModel;

import com.wd50.Hotel_Reservation.repository.PaymentRepository;
import com.wd50.Hotel_Reservation.repository.InvoiceRepository;
import com.wd50.Hotel_Reservation.repository.RefundRepository;
import com.wd50.Hotel_Reservation.repository.PaymentVoidRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.UUID;

public class PaymentService {

    private final PaymentRepository repository;
    private final InvoiceRepository invoiceRepository;
    private final RefundRepository refundRepository;
    private final PaymentVoidRepository voidRepository;

    public PaymentService() {
        repository = new PaymentRepository();
        invoiceRepository = new InvoiceRepository();
        refundRepository = new RefundRepository();
        voidRepository = new PaymentVoidRepository();
    }

    public PaymentModel createCashPayment(
            String bookingId,
            double amount,
            String requestId) {

        PaymentModel payment = new CashPayment(
                createPaymentId(requestId),
                bookingId,
                validateAmount(amount)
        );

        return savePayment(payment);
    }

    public PaymentModel createCardPayment(
            String bookingId,
            double amount,
            String transactionReference,
            String requestId) {

        PaymentModel payment = new CreditCardPayment(
                createPaymentId(requestId),
                bookingId,
                validateAmount(amount),
                transactionReference
        );

        return savePayment(payment);
    }

    private PaymentModel savePayment(PaymentModel payment) {

        synchronized (PaymentService.class) {

            PaymentModel existing =
                    repository.findById(payment.getPaymentId());

            if (existing != null) {

                if (!isSamePayment(existing, payment)) {
                    throw new IllegalArgumentException(
                            "Request ID was already used for another payment"
                    );
                }

                if (isVoided(existing.getPaymentId())) {
                    throw new IllegalArgumentException(
                            "This payment was voided. A new payment needs a new request ID"
                    );
                }

                return existing;
            }

            validateCardReference(payment);

            ArrayList<InvoiceModel> invoices =
                    invoiceRepository.findByBookingId(
                            payment.getBookingId()
                    );

            if (invoices.isEmpty()) {
                throw new IllegalArgumentException(
                        "Create an invoice for this booking first"
                );
            }

            BigDecimal totalAmount = BigDecimal.ZERO;

            for (InvoiceModel invoice : invoices) {
                totalAmount = totalAmount.add(
                        toMoney(invoice.getTotalAmount())
                );
            }

            BigDecimal paidAmount = BigDecimal.ZERO;

            for (PaymentModel saved :
                    repository.findByBookingId(
                            payment.getBookingId()
                    )) {

                if (!isVoided(saved.getPaymentId())) {
                    paidAmount = paidAmount.add(
                            toMoney(saved.getAmount())
                    );
                }
            }

            BigDecimal refundedAmount = BigDecimal.ZERO;

            for (RefundModel refund :
                    refundRepository.findByBookingId(
                            payment.getBookingId()
                    )) {

                refundedAmount = refundedAmount.add(
                        toMoney(refund.getAmount())
                );
            }

            BigDecimal netPaid =
                    paidAmount.subtract(refundedAmount);

            BigDecimal remainingAmount =
                    totalAmount.subtract(netPaid);

            if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException(
                        "No outstanding balance for this booking"
                );
            }

            if (toMoney(payment.getAmount())
                    .compareTo(remainingAmount) > 0) {

                throw new IllegalArgumentException(
                        "Payment exceeds remaining balance: "
                                + remainingAmount.toPlainString()
                );
            }

            repository.save(payment);

            return payment;
        }
    }

    private boolean isSamePayment(
            PaymentModel existing,
            PaymentModel incoming) {

        boolean sameBooking = existing.getBookingId()
                .equalsIgnoreCase(incoming.getBookingId());

        boolean sameAmount = toMoney(existing.getAmount())
                .compareTo(toMoney(incoming.getAmount())) == 0;

        boolean sameMethod = existing.getPaymentMethod()
                .equals(incoming.getPaymentMethod());

        if (!sameBooking || !sameAmount || !sameMethod) {
            return false;
        }

        if (existing instanceof CreditCardPayment
                && incoming instanceof CreditCardPayment) {

            CreditCardPayment oldCard =
                    (CreditCardPayment) existing;

            CreditCardPayment newCard =
                    (CreditCardPayment) incoming;

            return oldCard.getTransactionReference()
                    .equalsIgnoreCase(
                            newCard.getTransactionReference()
                    );
        }

        return existing instanceof CashPayment
                && incoming instanceof CashPayment;
    }

    private void validateCardReference(PaymentModel payment) {

        if (!(payment instanceof CreditCardPayment)) {
            return;
        }

        CreditCardPayment newCard = (CreditCardPayment) payment;

        for (PaymentModel saved : repository.findAll()) {

            if (isVoided(saved.getPaymentId())) {
                continue;
            }

            if (saved instanceof CreditCardPayment) {

                CreditCardPayment oldCard =
                        (CreditCardPayment) saved;

                if (oldCard.getTransactionReference()
                        .equalsIgnoreCase(
                                newCard.getTransactionReference()
                        )) {

                    throw new IllegalArgumentException(
                            "Card transaction reference already recorded"
                    );
                }
            }
        }
    }

    private boolean isVoided(String paymentId) {
        return voidRepository.findByPaymentId(paymentId) != null;
    }

    public PaymentModel getPaymentById(String paymentId) {

        if (paymentId == null || paymentId.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Payment ID cannot be empty"
            );
        }

        PaymentModel payment =
                repository.findById(paymentId.trim());

        if (payment == null) {
            throw new IllegalArgumentException(
                    "Payment not found"
            );
        }

        return payment;
    }

    public ArrayList<PaymentModel> getAllPayments() {
        return repository.findAll();
    }

    public ArrayList<PaymentModel> getPaymentsByBookingId(
            String bookingId) {

        if (bookingId == null || bookingId.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Booking ID cannot be empty"
            );
        }

        return repository.findByBookingId(bookingId.trim());
    }

    private double validateAmount(double amount) {

        if (!Double.isFinite(amount) || amount <= 0) {
            throw new IllegalArgumentException(
                    "Amount must be greater than zero"
            );
        }

        BigDecimal rounded = toMoney(amount);

        if (rounded.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Amount must be at least 0.01"
            );
        }

        return rounded.doubleValue();
    }

    private BigDecimal toMoney(double amount) {
        return BigDecimal.valueOf(amount)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private String createPaymentId(String requestId) {

        if (requestId == null || requestId.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Request ID is required"
            );
        }

        try {
            return "PAY-" + UUID.fromString(requestId.trim());

        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Request ID must be a valid UUID"
            );
        }
    }
}