package com.wd50.Hotel_Reservation.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.util.Map;

public abstract class BaseController {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleServerError(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unexpected error"));
    }

    protected Long parseId(String rawId) {
        if (rawId == null) {
            throw new IllegalArgumentException("ID is required.");
        }
        String digits = rawId.replaceAll("\\D", "");
        if (digits.isEmpty()) {
            throw new IllegalArgumentException("Invalid ID: " + rawId);
        }
        return Long.parseLong(digits);
    }
}
