package com.wd50.Hotel_Reservation.service;

import com.wd50.Hotel_Reservation.model.InvoiceModel;
import com.wd50.Hotel_Reservation.repository.InvoiceRepository;

import java.util.ArrayList;
import java.util.UUID;

public class InvoiceService {

    private final PromoCodeService promoCodeService;
    private final InvoiceRepository repository;

    private static final Object INVOICE_LOCK = new Object();

    public InvoiceService() {
        promoCodeService = new PromoCodeService();
        repository = new InvoiceRepository();
    }

    public InvoiceModel createInvoice(
            String bookingId,
            double roomCharges,
            double extraCharges,
            double serviceCharge,
            double taxes,
            String promoCode) {

        synchronized (INVOICE_LOCK) {

            String cleanBookingId = validateBookingId(bookingId);

            if (!repository.findByBookingId(cleanBookingId).isEmpty()) {
                throw new IllegalArgumentException(
                        "An invoice already exists for this booking"
                );
            }

            String invoiceId =
                    "INV-" + UUID.randomUUID().toString();

            InvoiceModel invoice = new InvoiceModel(
                    invoiceId,
                    cleanBookingId,
                    roomCharges,
                    extraCharges,
                    serviceCharge,
                    taxes,
                    0
            );

            if (promoCode != null && !promoCode.trim().isEmpty()) {

                double discount = promoCodeService.applyPromoCode(
                        promoCode.trim(),
                        invoice.getRoomCharges()
                );

                invoice = new InvoiceModel(
                        invoiceId,
                        cleanBookingId,
                        invoice.getRoomCharges(),
                        invoice.getExtraCharges(),
                        invoice.getServiceCharge(),
                        invoice.getTaxes(),
                        discount
                );
            }

            repository.save(invoice);

            return invoice;
        }
    }

    public InvoiceModel getInvoiceById(String invoiceId) {

        if (invoiceId == null || invoiceId.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Invoice ID cannot be empty"
            );
        }

        InvoiceModel invoice =
                repository.findById(invoiceId.trim());

        if (invoice == null) {
            throw new IllegalArgumentException(
                    "Invoice not found"
            );
        }

        return invoice;
    }

    public ArrayList<InvoiceModel> getAllInvoices() {
        return repository.findAll();
    }

    public ArrayList<InvoiceModel> getInvoicesByBookingId(
            String bookingId) {

        return repository.findByBookingId(
                validateBookingId(bookingId)
        );
    }

    private String validateBookingId(String bookingId) {

        if (bookingId == null || bookingId.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Booking ID cannot be empty"
            );
        }

        return bookingId.trim();
    }
}