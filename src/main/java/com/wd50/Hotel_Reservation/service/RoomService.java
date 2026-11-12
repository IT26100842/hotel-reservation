package com.wd50.Hotel_Reservation.service;

import com.wd50.Hotel_Reservation.model.Booking;
import com.wd50.Hotel_Reservation.model.Room;
import com.wd50.Hotel_Reservation.model.RoomCategory;
import com.wd50.Hotel_Reservation.repository.BookingRepository;
import com.wd50.Hotel_Reservation.repository.RoomCategoryRepository;
import com.wd50.Hotel_Reservation.repository.RoomRepository;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RoomService extends BaseService<Room> {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final RoomCategoryRepository roomCategoryRepository;

    public RoomService(RoomRepository roomRepository, BookingRepository bookingRepository, RoomCategoryRepository roomCategoryRepository) {
        super(roomRepository);
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.roomCategoryRepository = roomCategoryRepository;
    }

    @Override
    public List<Room> getAll() {
        return enrichRooms(super.getAll());
    }

    public List<Room> searchRooms(String type, Double minPrice, Double maxPrice, Integer guests) {
        if (type == null && minPrice == null && maxPrice == null && guests == null) {
            return getAll();
        }
        return enrichRooms(roomRepository.searchRooms(type, minPrice, maxPrice, guests));
    }

    public Optional<Room> getRoomByIdOrSlug(String idOrSlug) {
        if (idOrSlug == null || idOrSlug.isBlank()) {
            return Optional.empty();
        }
        String clean = idOrSlug.trim().replace("room-", "");
        try {
            Optional<Room> byId = roomRepository.findById(Long.parseLong(clean));
            if (byId.isPresent()) {
                return Optional.of(enrichSingleRoom(byId.get()));
            }
        } catch (NumberFormatException ignored) {}

        return roomRepository.findBySlug(idOrSlug.trim()).map(this::enrichSingleRoom);
    }

    @Override
    public Room save(Room room) {
        if (room.getTotalRooms() == null || room.getTotalRooms() < 1) {
            room.setTotalRooms(5);
        }

        // Fetch all other rooms to prevent duplicate room_number and base_room_number
        List<Room> allRooms = roomRepository.findAll();
        Set<String> existingRoomNumbers = allRooms.stream()
                .filter(r -> room.getId() == null || !r.getId().equals(room.getId()))
                .map(Room::getRoomNumber)
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(String::toUpperCase)
                .collect(Collectors.toSet());

        Set<Integer> existingBaseNumbers = allRooms.stream()
                .filter(r -> room.getId() == null || !r.getId().equals(room.getId()))
                .map(Room::getBaseRoomNumber)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        String requestedNum = room.getRoomNumber() != null ? room.getRoomNumber().trim() : null;
        boolean roomNumDuplicateOrEmpty = (requestedNum == null || requestedNum.isBlank() || existingRoomNumbers.contains(requestedNum.toUpperCase()));

        // If creating a new room or base room number is already taken by another room
        if (room.getBaseRoomNumber() == null || (room.getId() == null && existingBaseNumbers.contains(room.getBaseRoomNumber()))) {
            int candidateBase = 101;
            while (existingBaseNumbers.contains(candidateBase) || existingRoomNumbers.contains(String.valueOf(candidateBase))) {
                candidateBase += 100;
            }
            room.setBaseRoomNumber(candidateBase);
            if (roomNumDuplicateOrEmpty) {
                room.setRoomNumber(String.valueOf(candidateBase));
                roomNumDuplicateOrEmpty = false;
            }
        }

        // If room_number is still duplicate or empty, assign a unique one based on available base
        if (roomNumDuplicateOrEmpty) {
            int candidate = room.getBaseRoomNumber() != null ? room.getBaseRoomNumber() : 101;
            while (existingRoomNumbers.contains(String.valueOf(candidate))) {
                candidate += 100;
            }
            room.setRoomNumber(String.valueOf(candidate));
            room.setBaseRoomNumber(candidate);
        }

        if (room.getCategoryId() == null && room.getType() != null && !room.getType().isBlank()) {
            Optional<RoomCategory> cat = roomCategoryRepository.findBySlugIgnoreCase(room.getType().trim());
            if (cat.isEmpty()) {
                cat = roomCategoryRepository.findByNameIgnoreCase(room.getType().trim());
            }
            cat.ifPresent(c -> room.setCategoryId(c.getId()));
        }
        if (room.getCategoryId() == null) {
            List<RoomCategory> all = roomCategoryRepository.findAll();
            if (!all.isEmpty()) {
                room.setCategoryId(all.get(0).getId());
            } else {
                room.setCategoryId(1L);
            }
        }
        return enrichSingleRoom(super.save(room));
    }

    public Room updateRoom(Long id, Room updated) {
        Room existing = getById(id);
        existing.updateFrom(updated);
        return save(existing);
    }

    public Room enrichSingleRoom(Room room) {
        if (room != null && room.getId() != null) {
            room.updateAvailability(bookingRepository.findByRoomId(room.getId()));
        }
        return room;
    }

    public List<Room> enrichRooms(List<Room> rooms) {
        if (rooms == null || rooms.isEmpty()) {
            return rooms;
        }
        Map<Long, List<Booking>> byRoom = new HashMap<>();
        for (Booking booking : bookingRepository.findAll()) {
            if (booking.getRoom() != null && booking.getRoom().getId() != null) {
                byRoom.computeIfAbsent(booking.getRoom().getId(), k -> new ArrayList<>()).add(booking);
            }
        }
        for (Room room : rooms) {
            room.updateAvailability(byRoom.get(room.getId()));
        }
        return rooms;
    }
}
