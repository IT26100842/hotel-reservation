package com.wd50.Hotel_Reservation.controller;

import com.wd50.Hotel_Reservation.dto.InvoiceRequest;
import com.wd50.Hotel_Reservation.model.InvoiceModel;
import com.wd50.Hotel_Reservation.service.InvoiceService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService service = new InvoiceService();

    @PostMapping
    public ResponseEntity<InvoiceModel> createInvoice(
            @RequestBody InvoiceRequest request) {

        if (request.getRoomCharges() == null) {
            throw new IllegalArgumentException(
                    "Room charges are required"
            );
        }

        if (request.getExtraCharges() == null) {
            throw new IllegalArgumentException(
                    "Extra charges are required. Use zero if none"
            );
        }

        if (request.getServiceCharge() == null) {
            throw new IllegalArgumentException(
                    "Service charge is required. Use zero if none"
            );
        }

        if (request.getTaxes() == null) {
            throw new IllegalArgumentException(
                    "Taxes are required. Use zero if none"
            );
        }

        InvoiceModel invoice = service.createInvoice(
                request.getBookingId(),
                request.getRoomCharges(),
                request.getExtraCharges(),
                request.getServiceCharge(),
                request.getTaxes(),
                request.getPromoCode()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(invoice);
    }

    @GetMapping
    public ArrayList<InvoiceModel> getAllInvoices() {
        return service.getAllInvoices();
    }

    @GetMapping("/{invoiceId}")
    public InvoiceModel getInvoice(
            @PathVariable("invoiceId") String invoiceId) {

        return service.getInvoiceById(invoiceId);
    }

    @GetMapping("/booking/{bookingId}")
    public ArrayList<InvoiceModel> getBookingInvoices(
            @PathVariable("bookingId") String bookingId) {

        return service.getInvoicesByBookingId(bookingId);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleInvalidInput(
            IllegalArgumentException e) {

        return ResponseEntity
                .badRequest()
                .body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleFileError(
            IllegalStateException e) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error", "Could not read or save invoices"
                ));
    }
}