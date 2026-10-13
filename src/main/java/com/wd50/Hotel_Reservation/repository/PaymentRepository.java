package com.wd50.Hotel_Reservation.repository;

import com.wd50.Hotel_Reservation.model.PaymentModel;
import com.wd50.Hotel_Reservation.model.CashPayment;
import com.wd50.Hotel_Reservation.model.CreditCardPayment;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;

public class PaymentRepository {

    private final Path filePath = Path.of("data", "payments.txt");

    private static final Object FILE_LOCK = new Object();

    public void save(PaymentModel payment) {

        synchronized (FILE_LOCK) {

            if (payment == null) {
                throw new IllegalArgumentException(
                        "Payment cannot be empty"
                );
            }

            validateText(payment.getPaymentId());
            validateText(payment.getBookingId());

            if (findById(payment.getPaymentId()) != null) {
                throw new IllegalArgumentException(
                        "Payment ID already exists"
                );
            }

            String reference = "";

            if (payment instanceof CreditCardPayment) {

                CreditCardPayment card =
                        (CreditCardPayment) payment;

                reference = card.getTransactionReference();
                validateText(reference);

            } else if (!(payment instanceof CashPayment)) {

                throw new IllegalArgumentException(
                        "Unsupported payment type"
                );
            }

            String recordedAt = payment.getRecordedAt();

            if (recordedAt == null) {
                recordedAt = "";
            }

            String line = payment.getPaymentId() + "|"
                    + payment.getBookingId() + "|"
                    + payment.getAmount() + "|"
                    + payment.getPaymentMethod() + "|"
                    + reference + "|"
                    + recordedAt
                    + System.lineSeparator();

            try {
                Files.createDirectories(filePath.getParent());

                Files.writeString(
                        filePath,
                        line,
                        StandardCharsets.UTF_8,
                        StandardOpenOption.CREATE,
                        StandardOpenOption.APPEND
                );

            } catch (IOException e) {
                throw new IllegalStateException(
                        "Could not save payment", e
                );
            }
        }
    }

    public ArrayList<PaymentModel> findAll() {

        synchronized (FILE_LOCK) {

            ArrayList<PaymentModel> payments = new ArrayList<>();

            if (Files.notExists(filePath)) {
                return payments;
            }

            try {
                for (String line :
                        Files.readAllLines(
                                filePath,
                                StandardCharsets.UTF_8
                        )) {

                    if (line.trim().isEmpty()) {
                        continue;
                    }

                    String[] parts = line.split("\\|", -1);

                    if (parts.length != 5 && parts.length != 6) {
                        throw new IllegalArgumentException(
                                "Invalid payment record"
                        );
                    }

                    String paymentId = parts[0];
                    String bookingId = parts[1];
                    double amount = Double.parseDouble(parts[2]);
                    String method = parts[3];
                    String reference = parts[4];

                    String recordedAt = null;

                    if (parts.length == 6
                            && !parts[5].trim().isEmpty()) {

                        recordedAt = parts[5];
                    }

                    PaymentModel payment;

                    if (method.equals("CASH")) {

                        payment = new CashPayment(
                                paymentId,
                                bookingId,
                                amount,
                                recordedAt
                        );

                    } else if (method.equals("CARD")) {

                        payment = new CreditCardPayment(
                                paymentId,
                                bookingId,
                                amount,
                                reference,
                                recordedAt
                        );

                    } else {

                        throw new IllegalArgumentException(
                                "Invalid payment method in file"
                        );
                    }

                    payments.add(payment);
                }

            } catch (IOException | IllegalArgumentException e) {

                throw new IllegalStateException(
                        "Could not read payments", e
                );
            }

            return payments;
        }
    }

    public PaymentModel findById(String paymentId) {

        for (PaymentModel payment : findAll()) {

            if (payment.getPaymentId()
                    .equalsIgnoreCase(paymentId)) {

                return payment;
            }
        }

        return null;
    }

    public ArrayList<PaymentModel> findByBookingId(
            String bookingId) {

        ArrayList<PaymentModel> results = new ArrayList<>();

        for (PaymentModel payment : findAll()) {

            if (payment.getBookingId()
                    .equalsIgnoreCase(bookingId)) {

                results.add(payment);
            }
        }

        return results;
    }

    private void validateText(String text) {

        if (text == null || text.contains("|")
                || text.contains("\n") || text.contains("\r")) {

            throw new IllegalArgumentException(
                    "Payment details cannot contain | or new lines"
            );
        }
    }
}