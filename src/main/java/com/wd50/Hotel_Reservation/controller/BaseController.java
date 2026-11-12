package com.wd50.Hotel_Reservation.controller;

import com.wd50.Hotel_Reservation.model.User;
import com.wd50.Hotel_Reservation.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.util.Map;
import java.util.Optional;

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

    /**
     * Resolves the verified administrative role of the request caller.
     * Prioritizes database lookup by admin ID or email, falling back to role header.
     */
    protected String resolveCallerRole(HttpServletRequest request, UserService userService) {
        if (request == null) return "";
        String roleHeader = request.getHeader("X-Admin-Role");
        String idHeader = request.getHeader("X-Admin-Id");
        String emailHeader = request.getHeader("X-Admin-Email");

        if (idHeader != null && !idHeader.isBlank() && userService != null) {
            try {
                Long uid = Long.parseLong(idHeader.replaceAll("\\D", ""));
                User u = userService.getById(uid);
                if (u != null && u.getRole() != null) {
                    return u.getRole().trim().toLowerCase();
                }
            } catch (Exception ignored) {}
        }
        if (emailHeader != null && !emailHeader.isBlank() && userService != null) {
            try {
                Optional<User> uOpt = userService.findByEmail(emailHeader.trim().toLowerCase());
                if (uOpt.isPresent() && uOpt.get().getRole() != null) {
                    return uOpt.get().getRole().trim().toLowerCase();
                }
            } catch (Exception ignored) {}
        }
        return roleHeader != null ? roleHeader.trim().toLowerCase() : "";
    }
}