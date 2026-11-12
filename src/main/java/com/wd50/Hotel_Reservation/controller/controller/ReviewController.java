package com.wd50.Hotel_Reservation.controller;

import com.wd50.Hotel_Reservation.dto.ReviewRequest;
import com.wd50.Hotel_Reservation.model.Review;
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
@RequestMapping("/api/reviews")
public class ReviewController extends BaseController {

    private final ReviewService reviewService;
    private final UserService userService;

    public ReviewController(ReviewService reviewService, UserService userService) {
        this.reviewService = reviewService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Review>> getReviews() {
        return ResponseEntity.ok(reviewService.getAllApprovedReviews());
    }

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createReview(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @RequestBody ReviewRequest request, HttpServletRequest servletRequest) {
        String role = resolveCallerRole(servletRequest, userService);
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Standard Administrators have view-only access to reviews."));
        }
        return ResponseEntity.ok(reviewService.updateReview(id, request));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Review> toggleLike(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean increment
    ) {
        return ResponseEntity.ok(reviewService.toggleLike(id, increment == null || increment));
    }

    @PostMapping("/{id}/heart")
    public ResponseEntity<Review> toggleHeart(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean increment
    ) {
        return ResponseEntity.ok(reviewService.toggleHeart(id, increment == null || increment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id, HttpServletRequest servletRequest) {
        String role = resolveCallerRole(servletRequest, userService);
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Standard Administrators have view-only access to reviews."));
        }
        reviewService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Review deleted successfully", "id", id));
    }
}
