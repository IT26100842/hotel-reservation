package com.wd50.Hotel_Reservation.controller;

import com.wd50.Hotel_Reservation.model.RoomCategory;
import com.wd50.Hotel_Reservation.service.RoomCategoryService;
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
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class RoomCategoryController extends BaseController {

    private final RoomCategoryService roomCategoryService;
    private final UserService userService;

    public RoomCategoryController(RoomCategoryService roomCategoryService, UserService userService) {
        this.roomCategoryService = roomCategoryService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<RoomCategory>> getAllCategories() {
        return ResponseEntity.ok(roomCategoryService.getActiveCategories());
    }

    @GetMapping("/all")
    public ResponseEntity<List<RoomCategory>> getAllIncludingInactive() {
        return ResponseEntity.ok(roomCategoryService.getAll());
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody RoomCategory category, HttpServletRequest request) {
        String role = resolveCallerRole(request, userService);
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Standard Administrators have view-only access to room categories."));
        }
        return ResponseEntity.ok(roomCategoryService.save(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody RoomCategory category, HttpServletRequest request) {
        String role = resolveCallerRole(request, userService);
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Standard Administrators have view-only access to room categories."));
        }
        return ResponseEntity.ok(roomCategoryService.updateCategory(id, category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id, HttpServletRequest request) {
        String role = resolveCallerRole(request, userService);
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Standard Administrators have view-only access to room categories."));
        }
        roomCategoryService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Room category deleted successfully", "id", id));
    }
}
