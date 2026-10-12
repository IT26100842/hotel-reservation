package com.wd50.Hotel_Reservation.controller;

import com.wd50.Hotel_Reservation.dto.RefundRequest;
import com.wd50.Hotel_Reservation.model.RefundModel;
import com.wd50.Hotel_Reservation.service.RefundService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/api/refunds")
public class RefundController {

    private final RefundService service = new RefundService();

    @PostMapping
    public ResponseEntity<RefundModel> createRefund(
            @RequestBody RefundRequest request) {

        if (request.getAmount() == null) {
            throw new IllegalArgumentException(
                    "Refund amount is required"
            );
        }

        RefundModel refund = service.createRefund(
                request.getRequestId(),
                request.getPaymentId(),
                request.getAmount(),
                request.getReason()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(refund);
    }

    @GetMapping("/booking/{bookingId}")
    public ArrayList<RefundModel> getBookingRefunds(
            @PathVariable("bookingId") String bookingId) {

        return service.getRefundsByBookingId(bookingId);
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
                        "error", "Could not read or save refund records"
                ));
    }
}