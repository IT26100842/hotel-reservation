package com.wd50.Hotel_Reservation.repository;

import com.wd50.Hotel_Reservation.model.PaymentVoidModel;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.Base64;

public class PaymentVoidRepository {

    private final Path filePath =
            Path.of("data", "payment-voids.txt");

    private static final Object FILE_LOCK = new Object();

    public void save(PaymentVoidModel record) {

        synchronized (FILE_LOCK) {

            if (record == null) {
                throw new IllegalArgumentException(
                        "Void record cannot be empty"
                );
            }

            if (findById(record.getVoidId()) != null) {
                throw new IllegalArgumentException(
                        "Void ID already exists"
                );
            }

            if (findByPaymentId(record.getPaymentId()) != null) {
                throw new IllegalArgumentException(
                        "Payment is already voided"
                );
            }

            String encodedReason = Base64.getEncoder()
                    .encodeToString(
                            record.getReason().getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            String line = record.getVoidId() + "|"
                    + record.getPaymentId() + "|"
                    + record.getBookingId() + "|"
                    + encodedReason + "|"
                    + record.getRecordedAt()
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
                        "Could not save void record", e
                );
            }
        }
    }

    public ArrayList<PaymentVoidModel> findAll() {

        synchronized (FILE_LOCK) {

            ArrayList<PaymentVoidModel> records =
                    new ArrayList<>();

            if (Files.notExists(filePath)) {
                return records;
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

                    if (parts.length != 5) {
                        throw new IllegalArgumentException(
                                "Invalid void record"
                        );
                    }

                    String reason = new String(
                            Base64.getDecoder().decode(parts[3]),
                            StandardCharsets.UTF_8
                    );

                    records.add(new PaymentVoidModel(
                            parts[0],
                            parts[1],
                            parts[2],
                            reason,
                            parts[4]
                    ));
                }

            } catch (IOException | IllegalArgumentException e) {
                throw new IllegalStateException(
                        "Could not read void records", e
                );
            }

            return records;
        }
    }

    public PaymentVoidModel findById(String voidId) {

        for (PaymentVoidModel record : findAll()) {

            if (record.getVoidId().equalsIgnoreCase(voidId)) {
                return record;
            }
        }

        return null;
    }

    public PaymentVoidModel findByPaymentId(String paymentId) {

        for (PaymentVoidModel record : findAll()) {

            if (record.getPaymentId().equalsIgnoreCase(paymentId)) {
                return record;
            }
        }

        return null;
    }

    public ArrayList<PaymentVoidModel> findByBookingId(
            String bookingId) {

        ArrayList<PaymentVoidModel> results = new ArrayList<>();

        for (PaymentVoidModel record : findAll()) {

            if (record.getBookingId().equalsIgnoreCase(bookingId)) {
                results.add(record);
            }
        }

        return results;
    }
}