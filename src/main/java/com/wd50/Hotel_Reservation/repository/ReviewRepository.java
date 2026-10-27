package com.wd32.Hotel_Reservation.repository;

import com.wd32.Hotel_Reservation.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByStatusOrderByCreatedAtDesc(String status);
    List<Review> findAllByOrderByCreatedAtDesc();
}
