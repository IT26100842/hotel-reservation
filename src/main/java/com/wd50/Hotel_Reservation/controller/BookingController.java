package com.wd50.Hotel_Reservation.controller;

import com.wd50.Hotel_Reservation.dto.BookingRequest;
import com.wd50.Hotel_Reservation.dto.CancelBookingRequest;
import com.wd50.Hotel_Reservation.dto.RateBookingRequest;
import com.wd50.Hotel_Reservation.model.Booking;
import com.wd50.Hotel_Reservation.service.BookingService;
import com.wd50.Hotel_Reservation.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController extends BaseController {

    private final BookingService bookingService;
    private final UserService userService;

    public BookingController(BookingService bookingService, UserService userService) {
        this.bookingService = bookingService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request));
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getBookings(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Long userId
    ) {
        return ResponseEntity.ok(bookingService.getBookingsByGuest(email, userId));
    }

    @GetMapping("/{reference}")
    public ResponseEntity<Booking> getBookingByReference(@PathVariable String reference) {
        return bookingService.getBookingByReference(reference)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) CancelBookingRequest request
    ) {
        String reason = request != null ? request.getReason() : "Cancelled by guest";
        return ResponseEntity.ok(bookingService.cancelBooking(id, reason));
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<Booking> rateBooking(
            @PathVariable Long id,
            @RequestBody RateBookingRequest request
    ) {
        return ResponseEntity.ok(bookingService.rateBooking(
                id,
                request != null ? request.getRating() : 5,
                request != null ? request.getComment() : null
        ));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            HttpServletRequest servletRequest
    ) {
        String role = resolveCallerRole(servletRequest, userService);
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Standard Administrators have view-only access to reservations."));
        }
        return ResponseEntity.ok(bookingService.updateStatus(id, body != null ? body.get("status") : null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(
            @PathVariable Long id,
            @RequestBody BookingRequest request,
            HttpServletRequest servletRequest
    ) {
        String role = resolveCallerRole(servletRequest, userService);
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Standard Administrators have view-only access to reservations."));
        }
        return ResponseEntity.ok(bookingService.updateBookingDetails(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id, HttpServletRequest request) {
        String role = resolveCallerRole(request, userService);
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Standard Administrators cannot delete reservation records. Please contact an Operations Manager or Super Administrator."));
        }
        bookingService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Booking deleted successfully", "id", id));
    }
}
