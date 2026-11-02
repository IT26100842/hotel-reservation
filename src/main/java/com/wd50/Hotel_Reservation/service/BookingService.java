package com.wd50.Hotel_Reservation.service;

import com.wd50.Hotel_Reservation.dto.BookingRequest;
import com.wd50.Hotel_Reservation.dto.GuestInfoDto;
import com.wd50.Hotel_Reservation.model.Booking;
import com.wd50.Hotel_Reservation.model.Room;
import com.wd50.Hotel_Reservation.repository.BookingRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class BookingService extends BaseService<Booking> {

    private final BookingRepository bookingRepository;
    private final RoomService roomService;

    public BookingService(BookingRepository bookingRepository, RoomService roomService) {
        super(bookingRepository);
        this.bookingRepository = bookingRepository;
        this.roomService = roomService;
    }

    public Booking createBooking(BookingRequest req) {
        Room room = roomService.getRoomByIdOrSlug(req.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + req.getRoomId()));

        if ("maintenance".equalsIgnoreCase(room.getStatus())) {
            throw new IllegalArgumentException("This room category is currently under maintenance.");
        }

        List<String> availableNumbers = room.getAvailableRoomNumbers();
        if (availableNumbers == null || availableNumbers.isEmpty()) {
            throw new IllegalArgumentException("No vacant rooms available in " + room.getName());
        }

        String assignedRoom = availableNumbers.get(0);
        if (req.getRoomNumber() != null && !req.getRoomNumber().isBlank()) {
            String requested = req.getRoomNumber().trim().replace("#", "");
            if (!availableNumbers.contains(requested)) {
                throw new IllegalArgumentException("Room #" + requested + " is already occupied.");
            }
            assignedRoom = requested;
        }

        GuestInfoDto guest = req.getGuestInfo();
        if (guest == null) {
            throw new IllegalArgumentException("Primary guest information is required.");
        }

        Booking booking = new Booking();
        booking.setRoom(room);
        booking.setRoomNumber(assignedRoom);
        booking.setUserId(req.getUserId());
        booking.setCheckIn(req.getCheckIn() != null ? req.getCheckIn() : LocalDate.now().toString());
        booking.setCheckOut(req.getCheckOut() != null ? req.getCheckOut() : LocalDate.now().plusDays(1).toString());
        booking.setNights(req.getNights() != null ? req.getNights() : 1);
        booking.setAdults(req.getAdults() != null ? req.getAdults() : 1);
        booking.setChildren(req.getChildren() != null ? req.getChildren() : 0);
        booking.setTotalGuests(booking.getAdults() + booking.getChildren());

        booking.setGuestFullName(guest.getFullName() != null ? guest.getFullName().trim() : "");
        booking.setGuestEmail(guest.getEmail() != null ? guest.getEmail().trim() : "");
        booking.setGuestPhone(guest.getPhone() != null ? guest.getPhone().trim() : "");
        booking.setGuestNicPassport(guest.getNicPassport() != null ? guest.getNicPassport().trim().toUpperCase() : "");
        booking.setSpecialRequests(guest.getSpecialRequests());

        booking.calculateFinancials(
                req.getSubtotal(),
                req.getServiceCharge(),
                req.getTaxes(),
                req.getDiscountAmount(),
                req.getTotalAmount()
        );
        booking.setPromoCodeApplied(req.getPromoCodeApplied());
        booking.setCurrency(req.getCurrency() != null ? req.getCurrency() : "LKR");
        booking.setPaymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : "pay_at_hotel");
        booking.setStatus("confirmed");
        booking.setBookedAt(LocalDate.now().toString());
        booking.setBookingReference("SS-LK-" + (10000 + new Random().nextInt(90000)));

        Booking saved = save(booking);
        roomService.enrichSingleRoom(saved.getRoom());
        return saved;
    }

    public List<Booking> getBookingsByGuest(String email, Long userId) {
        if (email != null && !email.isBlank()) {
            return bookingRepository.findByGuestEmailOrderByCreatedAtDesc(email.trim());
        }
        if (userId != null) {
            return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Booking> getBookingByReference(String reference) {
        return bookingRepository.findByBookingReference(reference);
    }

    public Booking cancelBooking(Long id, String reason) {
        Booking booking = getById(id);
        booking.cancel(reason);
        return save(booking);
    }

    public Booking rateBooking(Long id, Integer rating, String comment) {
        Booking booking = getById(id);
        booking.applyRating(rating, comment);
        return save(booking);
    }

    public Booking updateStatus(Long id, String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status is required.");
        }
        Booking booking = getById(id);
        booking.setStatus(status.trim());
        return save(booking);
    }
}
