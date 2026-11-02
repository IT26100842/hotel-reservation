package com.wd50.Hotel_Reservation.service;

import com.wd50.Hotel_Reservation.dto.ReviewRequest;
import com.wd50.Hotel_Reservation.model.Review;
import com.wd50.Hotel_Reservation.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReviewService extends BaseService<Review> {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        super(reviewRepository);
        this.reviewRepository = reviewRepository;
    }

    public List<Review> getAllApprovedReviews() {
        return reviewRepository.findByStatusOrderByCreatedAtDesc("approved");
    }

    public Review createReview(ReviewRequest req) {
        Review review = new Review(
                req.getGuestName() != null ? req.getGuestName().trim() : null,
                req.getLocation() != null ? req.getLocation().trim() : "",
                req.getAvatar() != null ? req.getAvatar().trim() : "",
                req.getRating() != null ? req.getRating() : 5.0,
                req.getComment() != null ? req.getComment().trim() : null,
                "Just now",
                req.getRoomBooked() != null ? req.getRoomBooked().trim() : "Deluxe Oceanfront",
                0,
                0
        );
        return save(review);
    }

    public Review toggleLike(Long reviewId) {
        return toggleLike(reviewId, true);
    }

    public Review toggleLike(Long reviewId, boolean increment) {
        Review review = getById(reviewId);
        review.adjustLikes(increment);
        return save(review);
    }

    public Review toggleHeart(Long reviewId) {
        return toggleHeart(reviewId, true);
    }

    public Review toggleHeart(Long reviewId, boolean increment) {
        Review review = getById(reviewId);
        review.adjustHearts(increment);
        return save(review);
    }
}