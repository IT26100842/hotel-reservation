package com.wd50.Hotel_Reservation.controller;

import com.wd50.Hotel_Reservation.service.BillingService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingService service = new BillingService();

    @GetMapping("/booking/{bookingId}")
    public Map<String, Object> getBookingBalance(
            @PathVariable("bookingId") String bookingId) {

        return service.getBookingBalance(bookingId);
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
                        "error", "Could not read billing records"
                ));
    }
}