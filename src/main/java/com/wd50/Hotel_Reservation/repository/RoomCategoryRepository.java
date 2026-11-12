package com.wd50.Hotel_Reservation.repository;

import com.wd50.Hotel_Reservation.model.RoomCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomCategoryRepository extends JpaRepository<RoomCategory, Long> {
    Optional<RoomCategory> findBySlugIgnoreCase(String slug);
    Optional<RoomCategory> findByNameIgnoreCase(String name);
    List<RoomCategory> findAllByOrderBySortOrderAsc();
    List<RoomCategory> findByIsActiveTrueOrderBySortOrderAsc();
}