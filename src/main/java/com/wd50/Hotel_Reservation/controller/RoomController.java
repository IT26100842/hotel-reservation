package com.wd50.Hotel_Reservation.controller;

import com.wd50.Hotel_Reservation.model.Room;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
public class RoomController extends BaseController {

    private final RoomService roomService;
    private final UserService userService;

    public RoomController(RoomService roomService, UserService userService) {
        this.roomService = roomService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Room>> getRooms(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer guests
    ) {
        return ResponseEntity.ok(roomService.searchRooms(type, minPrice, maxPrice, guests));
    }

    @GetMapping("/{idOrSlug}")
    public ResponseEntity<Room> getRoomByIdOrSlug(@PathVariable String idOrSlug) {
        return roomService.getRoomByIdOrSlug(idOrSlug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody Room room, HttpServletRequest request) {
        String role = resolveCallerRole(request, userService);
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Standard Administrators have view-only access to rooms."));
        }
        return ResponseEntity.ok(roomService.save(room));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable Long id, @RequestBody Room room, HttpServletRequest request) {
        String role = resolveCallerRole(request, userService);
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Standard Administrators have view-only access to rooms."));
        }
        return ResponseEntity.ok(roomService.updateRoom(id, room));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id, HttpServletRequest request) {
        String role = resolveCallerRole(request, userService);
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Standard Administrators have view-only access to rooms."));
        }
        roomService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Room deleted successfully", "id", id));
    }
}
