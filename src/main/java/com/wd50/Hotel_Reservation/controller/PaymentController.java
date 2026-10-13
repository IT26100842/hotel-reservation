package com.wd50.Hotel_Reservation.controller;

import com.wd50.Hotel_Reservation.dto.PaymentRequest;
import com.wd50.Hotel_Reservation.model.PaymentModel;
import com.wd50.Hotel_Reservation.service.PaymentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService service = new PaymentService();

    @PostMapping
    public ResponseEntity<PaymentModel> createPayment(
            @RequestBody PaymentRequest request) {

        if (request.getRequestId() == null
                || request.getRequestId().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Request ID is required"
            );
        }

        if (request.getAmount() == null) {
            throw new IllegalArgumentException(
                    "Payment amount is required"
            );
        }

        if (request.getPaymentMethod() == null
                || request.getPaymentMethod().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Payment method is required"
            );
        }

        String method = request.getPaymentMethod().trim();

        PaymentModel payment;

        if (method.equalsIgnoreCase("CASH")) {

            payment = service.createCashPayment(
                    request.getBookingId(),
                    request.getAmount(),
                    request.getRequestId()
            );

        } else if (method.equalsIgnoreCase("CARD")) {

            payment = service.createCardPayment(
                    request.getBookingId(),
                    request.getAmount(),
                    request.getTransactionReference(),
                    request.getRequestId()
            );

        } else {
            throw new IllegalArgumentException(
                    "Payment method must be CASH or CARD"
            );
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(payment);
    }

    @GetMapping
    public ArrayList<PaymentModel> getAllPayments() {
        return service.getAllPayments();
    }

    @GetMapping("/{paymentId}")
    public PaymentModel getPayment(
            @PathVariable("paymentId") String paymentId) {

        return service.getPaymentById(paymentId);
    }

    @GetMapping("/booking/{bookingId}")
    public ArrayList<PaymentModel> getBookingPayments(
            @PathVariable("bookingId") String bookingId) {

        return service.getPaymentsByBookingId(bookingId);
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
                        "error", "Could not read or save payments"
                ));
    }
}