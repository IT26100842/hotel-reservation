package com.wd50.Hotel_Reservation.repository;

import com.wd50.Hotel_Reservation.model.InvoiceModel;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;

public class InvoiceRepository {

    private final Path filePath = Path.of("data", "invoices.txt");

    public synchronized void save(InvoiceModel invoice) {

        if (invoice == null) {
            throw new IllegalArgumentException("Invoice cannot be empty");
        }

        validateText(invoice.getInvoiceId());
        validateText(invoice.getBookingId());

        if (findById(invoice.getInvoiceId()) != null) {
            throw new IllegalArgumentException("Invoice ID already exists");
        }

        String line = invoice.getInvoiceId() + "|"
                + invoice.getBookingId() + "|"
                + invoice.getRoomCharges() + "|"
                + invoice.getExtraCharges() + "|"
                + invoice.getServiceCharge() + "|"
                + invoice.getTaxes() + "|"
                + invoice.getDiscountAmount()
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
            throw new IllegalStateException("Could not save invoice", e);
        }
    }

    public synchronized ArrayList<InvoiceModel> findAll() {

        ArrayList<InvoiceModel> invoices = new ArrayList<>();

        if (Files.notExists(filePath)) {
            return invoices;
        }

        try {
            for (String line :
                    Files.readAllLines(filePath, StandardCharsets.UTF_8)) {

                if (line.trim().isEmpty()) {
                    continue;
                }

                String[] parts = line.split("\\|", -1);

                if (parts.length != 7) {
                    throw new IllegalArgumentException(
                            "Invalid invoice record"
                    );
                }

                InvoiceModel invoice = new InvoiceModel(
                        parts[0],
                        parts[1],
                        Double.parseDouble(parts[2]),
                        Double.parseDouble(parts[3]),
                        Double.parseDouble(parts[4]),
                        Double.parseDouble(parts[5]),
                        Double.parseDouble(parts[6])
                );

                invoices.add(invoice);
            }

        } catch (IOException | IllegalArgumentException e) {
            throw new IllegalStateException("Could not read invoices", e);
        }

        return invoices;
    }

    public synchronized InvoiceModel findById(String invoiceId) {

        for (InvoiceModel invoice : findAll()) {

            if (invoice.getInvoiceId().equalsIgnoreCase(invoiceId)) {
                return invoice;
            }
        }

        return null;
    }

    public synchronized ArrayList<InvoiceModel> findByBookingId(
            String bookingId) {

        ArrayList<InvoiceModel> results = new ArrayList<>();

        for (InvoiceModel invoice : findAll()) {

            if (invoice.getBookingId().equalsIgnoreCase(bookingId)) {
                results.add(invoice);
            }
        }

        return results;
    }

    private void validateText(String text) {

        if (text == null || text.contains("|")
                || text.contains("\n") || text.contains("\r")) {

            throw new IllegalArgumentException(
                    "Invoice details cannot contain | or new lines"
            );
        }
    }
}