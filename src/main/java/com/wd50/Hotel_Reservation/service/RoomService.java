package com.wd50.Hotel_Reservation.service;

import com.wd50.Hotel_Reservation.model.Booking;
import com.wd50.Hotel_Reservation.model.Room;
import com.wd50.Hotel_Reservation.repository.BookingRepository;
import com.wd50.Hotel_Reservation.repository.RoomRepository;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class RoomService extends BaseService<Room> {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public RoomService(RoomRepository roomRepository, BookingRepository bookingRepository) {
        super(roomRepository);
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
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
        if (room.getBaseRoomNumber() == null || room.getBaseRoomNumber() < 1) {
            room.setBaseRoomNumber((int) ((roomRepository.count() + 1) * 100 + 1));
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