package com.wd50.Hotel_Reservation.service;

import com.wd50.Hotel_Reservation.dto.BookingRequest;
import com.wd50.Hotel_Reservation.dto.GuestInfoDto;
import com.wd50.Hotel_Reservation.model.Booking;
import com.wd50.Hotel_Reservation.model.Room;
import com.wd50.Hotel_Reservation.model.User;
import com.wd50.Hotel_Reservation.repository.BookingRepository;
import com.wd50.Hotel_Reservation.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class BookingService extends BaseService<Booking> {

    private final BookingRepository bookingRepository;
    private final RoomService roomService;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository, RoomService roomService, UserRepository userRepository) {
        super(bookingRepository);
        this.bookingRepository = bookingRepository;
        this.roomService = roomService;
        this.userRepository = userRepository;
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

        Long resolvedUserId = req.getUserId();
        if (resolvedUserId != null && resolvedUserId > 0) {
            Optional<User> userOpt = userRepository.findById(resolvedUserId);
            if (userOpt.isEmpty()) {
                // If ID not found, check by guest email
                Optional<User> byEmail = (guest.getEmail() != null && !guest.getEmail().isBlank())
                        ? userRepository.findByEmail(guest.getEmail().trim().toLowerCase())
                        : Optional.empty();
                if (byEmail.isEmpty()) {
                    throw new IllegalArgumentException("Cannot place reservation: User account not found. Please log in with a valid registered account.");
                }
                userOpt = byEmail;
            }

            User user = userOpt.get();
            if ("suspended".equalsIgnoreCase(user.getStatus())) {
                throw new IllegalArgumentException("Cannot place reservation: Your user account has been suspended. Please contact hotel management or visit reception.");
            }
            resolvedUserId = user.getId();
        } else if (guest.getEmail() != null && !guest.getEmail().isBlank()) {
            Optional<User> byEmail = userRepository.findByEmail(guest.getEmail().trim().toLowerCase());
            if (byEmail.isPresent()) {
                User user = byEmail.get();
                if ("suspended".equalsIgnoreCase(user.getStatus())) {
                    throw new IllegalArgumentException("Cannot place reservation: An account with this email (" + guest.getEmail() + ") is suspended. Please contact hotel management.");
                }
                resolvedUserId = user.getId();
            } else {
                resolvedUserId = null;
            }
        } else {
            resolvedUserId = null;
        }

        Booking booking = new Booking();
        booking.setRoom(room);
        booking.setRoomNumber(assignedRoom);
        booking.setUserId(resolvedUserId);
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

    public Booking updateBookingDetails(Long id, BookingRequest req) {
        Booking booking = getById(id);
        if (req.getRoomId() != null && !req.getRoomId().isBlank()) {
            Room room = roomService.getRoomByIdOrSlug(req.getRoomId())
                    .orElseThrow(() -> new IllegalArgumentException("Room not found: " + req.getRoomId()));
            booking.setRoom(room);
        }
        if (req.getRoomNumber() != null && !req.getRoomNumber().isBlank()) {
            booking.setRoomNumber(req.getRoomNumber().trim().replace("#", ""));
        }
        if (req.getCheckIn() != null) booking.setCheckIn(req.getCheckIn());
        if (req.getCheckOut() != null) booking.setCheckOut(req.getCheckOut());
        if (req.getNights() != null) booking.setNights(req.getNights());
        if (req.getAdults() != null) booking.setAdults(req.getAdults());
        if (req.getChildren() != null) booking.setChildren(req.getChildren());
        booking.setTotalGuests((booking.getAdults() != null ? booking.getAdults() : 1) + (booking.getChildren() != null ? booking.getChildren() : 0));

        if (req.getGuestInfo() != null) {
            GuestInfoDto g = req.getGuestInfo();
            if (g.getFullName() != null && !g.getFullName().isBlank()) booking.setGuestFullName(g.getFullName().trim());
            if (g.getEmail() != null && !g.getEmail().isBlank()) booking.setGuestEmail(g.getEmail().trim());
            if (g.getPhone() != null && !g.getPhone().isBlank()) booking.setGuestPhone(g.getPhone().trim());
            if (g.getNicPassport() != null && !g.getNicPassport().isBlank()) booking.setGuestNicPassport(g.getNicPassport().trim().toUpperCase());
            if (g.getSpecialRequests() != null) booking.setSpecialRequests(g.getSpecialRequests());
        }

        if (req.getPaymentMethod() != null) booking.setPaymentMethod(req.getPaymentMethod());
        if (req.getStatus() != null && !req.getStatus().isBlank()) booking.setStatus(req.getStatus().trim());

        if (req.getUserId() != null) {
            if (req.getUserId() > 0 && userRepository.existsById(req.getUserId())) {
                booking.setUserId(req.getUserId());
            } else {
                booking.setUserId(null);
            }
        }

        if (req.getSubtotal() != null || req.getTotalAmount() != null) {
            booking.calculateFinancials(
                    req.getSubtotal() != null ? req.getSubtotal() : booking.getSubtotal(),
                    req.getServiceCharge() != null ? req.getServiceCharge() : booking.getServiceCharge(),
                    req.getTaxes() != null ? req.getTaxes() : booking.getTaxes(),
                    req.getDiscountAmount() != null ? req.getDiscountAmount() : booking.getDiscountAmount(),
                    req.getTotalAmount() != null ? req.getTotalAmount() : booking.getTotalAmount()
            );
        }

        Booking saved = save(booking);
        if (saved.getRoom() != null) {
            roomService.enrichSingleRoom(saved.getRoom());
        }
        return saved;
    }
}
