package com.wd50.Hotel_Reservation.controller;

import com.wd50.Hotel_Reservation.model.Booking;
import com.wd50.Hotel_Reservation.model.Room;
import com.wd50.Hotel_Reservation.model.User;
import com.wd50.Hotel_Reservation.service.BookingService;
import com.wd50.Hotel_Reservation.service.ReviewService;
import com.wd50.Hotel_Reservation.service.RoomService;
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
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController extends BaseController {

    private final UserService userService;
    private final RoomService roomService;
    private final BookingService bookingService;
    private final ReviewService reviewService;

    public AdminController(
            UserService userService,
            RoomService roomService,
            BookingService bookingService,
            ReviewService reviewService
    ) {
        this.userService = userService;
        this.roomService = roomService;
        this.bookingService = bookingService;
        this.reviewService = reviewService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Booking> bookings = bookingService.getAll();
        List<Room> rooms = roomService.getAll();
        List<User> users = userService.getAll();

        long totalPhysicalRooms = 0;
        for (Room r : rooms) {
            totalPhysicalRooms += r.getTotalRooms();
        }

        long confirmedCount = 0;
        long activeOccupiedCount = 0;
        long cancelledCount = 0;
        double totalRevenue = 0.0;

        for (Booking b : bookings) {
            if ("cancelled".equalsIgnoreCase(b.getStatus())) {
                cancelledCount++;
            } else {
                totalRevenue += b.getTotalAmount() != null ? b.getTotalAmount() : 0.0;
                confirmedCount++;
                if (b.hasActiveOccupation()) {
                    activeOccupiedCount++;
                }
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalBookings", bookings.size());
        stats.put("confirmedBookings", confirmedCount);
        stats.put("cancelledBookings", cancelledCount);
        stats.put("totalRooms", rooms.size());
        stats.put("totalPhysicalRooms", totalPhysicalRooms);
        stats.put("occupiedPhysicalRooms", activeOccupiedCount);
        stats.put("availablePhysicalRooms", Math.max(0, totalPhysicalRooms - activeOccupiedCount));
        stats.put("totalUsers", users.size());
        stats.put("totalAdmins", userService.getAdmins().size());
        stats.put("totalReviews", reviewService.getAll().size());
        stats.put("occupancyRate", totalPhysicalRooms > 0 ? Math.min(100, Math.round((double) activeOccupiedCount / totalPhysicalRooms * 100)) : 0);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAll());
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateGuest(@PathVariable Long id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        String role = resolveCallerRole(request, userService);
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Standard Administrators have view-only access to guest accounts."));
        }
        return ResponseEntity.ok(userService.updateGuest(id, body));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteGuest(@PathVariable Long id, HttpServletRequest request) {
        String role = resolveCallerRole(request, userService);
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Standard Administrators are not authorized to delete guest accounts."));
        }
        userService.deleteGuest(id);
        return ResponseEntity.ok(Map.of("message", "Guest account removed successfully", "id", id));
    }

    @GetMapping("/admins")
    public ResponseEntity<List<User>> getAllAdmins() {
        return ResponseEntity.ok(userService.getAdmins());
    }

    @PostMapping("/admins")
    public ResponseEntity<?> createAdmin(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String role = resolveCallerRole(request, userService);
        if (!"super_admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Only Super Administrators have permission to add new administrators and staff."));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createAdmin(body));
    }

    @PutMapping("/admins/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        String role = resolveCallerRole(request, userService);
        if (!"super_admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Only Super Administrators have permission to update administrator accounts."));
        }
        return ResponseEntity.ok(userService.updateAdmin(id, body));
    }

    @DeleteMapping("/admins/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id, HttpServletRequest request) {
        String role = resolveCallerRole(request, userService);
        if (!"super_admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Only Super Administrators have permission to remove administrator accounts."));
        }
        userService.deleteAdmin(id);
        return ResponseEntity.ok(Map.of("message", "Admin removed successfully", "id", id));
    }
}