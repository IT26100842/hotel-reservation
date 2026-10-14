package com.wd50.Hotel_Reservation.repository;

import com.wd50.Hotel_Reservation.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findBySlug(String slug);
    List<Room> findByType(String type);
    List<Room> findByFeaturedTrue();

    @Query("SELECT r FROM Room r WHERE " +
            "(:type IS NULL OR :type = 'all' OR LOWER(r.type) = LOWER(:type)) AND " +
            "(:minPrice IS NULL OR r.pricePerNight >= :minPrice) AND " +
            "(:maxPrice IS NULL OR r.pricePerNight <= :maxPrice) AND " +
            "(:guests IS NULL OR r.maxGuests >= :guests)")
    List<Room> searchRooms(
            @Param("type") String type,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("guests") Integer guests
    );
}
