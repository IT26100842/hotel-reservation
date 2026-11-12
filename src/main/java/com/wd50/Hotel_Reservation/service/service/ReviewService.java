package com.wd50.Hotel_Reservation.service;

import com.wd50.Hotel_Reservation.dto.ReviewRequest;
import com.wd50.Hotel_Reservation.model.Review;
import com.wd50.Hotel_Reservation.model.Room;
import com.wd50.Hotel_Reservation.repository.ReviewRepository;
import com.wd50.Hotel_Reservation.repository.RoomRepository;
import com.wd50.Hotel_Reservation.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReviewService extends BaseService<Review> {

    private final ReviewRepository reviewRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, RoomRepository roomRepository, UserRepository userRepository) {
        super(reviewRepository);
        this.reviewRepository = reviewRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    public List<Review> getAllApprovedReviews() {
        return reviewRepository.findByStatusOrderByCreatedAtDesc("approved");
    }

    public Review createReview(ReviewRequest req) {
        Long targetRoomId = req.getRoomId();
        if (targetRoomId == null && req.getRoomBooked() != null && !req.getRoomBooked().isBlank()) {
            List<Room> allRooms = roomRepository.findAll();
            for (Room r : allRooms) {
                if (r.getName() != null && r.getName().equalsIgnoreCase(req.getRoomBooked().trim())) {
                    targetRoomId = r.getId();
                    break;
                }
            }
            if (targetRoomId == null && !allRooms.isEmpty()) {
                targetRoomId = allRooms.get(0).getId();
            }
        }
        if (targetRoomId == null) {
            targetRoomId = 1L;
        }

        Review review = new Review(
                targetRoomId,
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
        if (req.getUserId() != null && req.getUserId() > 0 && userRepository.existsById(req.getUserId())) {
            review.setUserId(req.getUserId());
        } else {
            review.setUserId(null);
        }
        return save(review);
    }

    public Review updateReview(Long id, ReviewRequest req) {
        Review review = getById(id);
        if (req.getGuestName() != null && !req.getGuestName().isBlank()) {
            review.setGuestName(req.getGuestName().trim());
        }
        if (req.getLocation() != null) {
            review.setLocation(req.getLocation().trim());
        }
        if (req.getAvatar() != null) {
            review.setAvatar(req.getAvatar().trim());
        }
        if (req.getRating() != null) {
            review.setRating(req.getRating());
        }
        if (req.getComment() != null && !req.getComment().isBlank()) {
            review.setComment(req.getComment().trim());
        }
        if (req.getRoomBooked() != null && !req.getRoomBooked().isBlank()) {
            review.setRoomBooked(req.getRoomBooked().trim());
            for (Room r : roomRepository.findAll()) {
                if (r.getName() != null && r.getName().equalsIgnoreCase(req.getRoomBooked().trim())) {
                    review.setRoomId(r.getId());
                    break;
                }
            }
        }
        if (req.getRoomId() != null) {
            review.setRoomId(req.getRoomId());
        }
        if (req.getUserId() != null) {
            if (req.getUserId() > 0 && userRepository.existsById(req.getUserId())) {
                review.setUserId(req.getUserId());
            } else {
                review.setUserId(null);
            }
        }
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
