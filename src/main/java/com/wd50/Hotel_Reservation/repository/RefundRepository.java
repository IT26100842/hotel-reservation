package com.wd50.Hotel_Reservation.repository;

import com.wd50.Hotel_Reservation.model.RefundModel;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.Base64;

public class RefundRepository {

    private final Path filePath = Path.of("data", "refunds.txt");

    private static final Object FILE_LOCK = new Object();

    public void save(RefundModel refund) {

        synchronized (FILE_LOCK) {

            if (refund == null) {
                throw new IllegalArgumentException(
                        "Refund cannot be empty"
                );
            }

            if (findById(refund.getRefundId()) != null) {
                throw new IllegalArgumentException(
                        "Refund ID already exists"
                );
            }

            validateId(refund.getRefundId());
            validateId(refund.getPaymentId());
            validateId(refund.getBookingId());

            String encodedReason = Base64.getEncoder()
                    .encodeToString(
                            refund.getReason().getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            String line = refund.getRefundId() + "|"
                    + refund.getPaymentId() + "|"
                    + refund.getBookingId() + "|"
                    + refund.getAmount() + "|"
                    + encodedReason + "|"
                    + refund.getRecordedAt()
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
                        "Could not save refund", e
                );
            }
        }
    }

    public ArrayList<RefundModel> findAll() {

        synchronized (FILE_LOCK) {

            ArrayList<RefundModel> refunds = new ArrayList<>();

            if (Files.notExists(filePath)) {
                return refunds;
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

                    if (parts.length != 6) {
                        throw new IllegalArgumentException(
                                "Invalid refund record"
                        );
                    }

                    String reason = new String(
                            Base64.getDecoder().decode(parts[4]),
                            StandardCharsets.UTF_8
                    );

                    RefundModel refund = new RefundModel(
                            parts[0],
                            parts[1],
                            parts[2],
                            Double.parseDouble(parts[3]),
                            reason,
                            parts[5]
                    );

                    refunds.add(refund);
                }

            } catch (IOException | IllegalArgumentException e) {
                throw new IllegalStateException(
                        "Could not read refunds", e
                );
            }

            return refunds;
        }
    }

    public RefundModel findById(String refundId) {

        for (RefundModel refund : findAll()) {

            if (refund.getRefundId().equalsIgnoreCase(refundId)) {
                return refund;
            }
        }

        return null;
    }

    public ArrayList<RefundModel> findByPaymentId(String paymentId) {

        ArrayList<RefundModel> results = new ArrayList<>();

        for (RefundModel refund : findAll()) {

            if (refund.getPaymentId().equalsIgnoreCase(paymentId)) {
                results.add(refund);
            }
        }

        return results;
    }

    public ArrayList<RefundModel> findByBookingId(String bookingId) {

        ArrayList<RefundModel> results = new ArrayList<>();

        for (RefundModel refund : findAll()) {

            if (refund.getBookingId().equalsIgnoreCase(bookingId)) {
                results.add(refund);
            }
        }

        return results;
    }

    private void validateId(String value) {

        if (value.contains("|")
                || value.contains("\n")
                || value.contains("\r")) {

            throw new IllegalArgumentException(
                    "IDs cannot contain | or new lines"
            );
        }
    }
}