package com.wd50.Hotel_Reservation.controller;

import com.wd50.Hotel_Reservation.dto.PaymentVoidRequest;
import com.wd50.Hotel_Reservation.model.PaymentVoidModel;
import com.wd50.Hotel_Reservation.service.PaymentVoidService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/api/payment-voids")
public class PaymentVoidController {

    private final PaymentVoidService service =
            new PaymentVoidService();

    @PostMapping
    public ResponseEntity<PaymentVoidModel> voidPayment(
            @RequestBody PaymentVoidRequest request) {

        PaymentVoidModel record = service.voidPayment(
                request.getRequestId(),
                request.getPaymentId(),
                request.getReason()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(record);
    }

    @GetMapping("/booking/{bookingId}")
    public ArrayList<PaymentVoidModel> getBookingVoids(
            @PathVariable("bookingId") String bookingId) {

        return service.getByBookingId(bookingId);
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
                        "error", "Could not read or save void records"
                ));
    }
}