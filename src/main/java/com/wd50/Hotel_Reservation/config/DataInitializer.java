package com.wd50.Hotel_Reservation.config;

import com.wd50.Hotel_Reservation.model.Booking;
import com.wd50.Hotel_Reservation.model.PromoCode;
import com.wd50.Hotel_Reservation.model.Review;
import com.wd50.Hotel_Reservation.model.Room;
import com.wd50.Hotel_Reservation.model.User;
import com.wd50.Hotel_Reservation.repository.BookingRepository;
import com.wd50.Hotel_Reservation.repository.PromoCodeRepository;
import com.wd50.Hotel_Reservation.repository.ReviewRepository;
import com.wd50.Hotel_Reservation.repository.RoomRepository;
import com.wd50.Hotel_Reservation.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final BookingRepository bookingRepository;

    public DataInitializer(
            RoomRepository roomRepository,
            UserRepository userRepository,
            ReviewRepository reviewRepository,
            PromoCodeRepository promoCodeRepository,
            BookingRepository bookingRepository
    ) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.promoCodeRepository = promoCodeRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public void run(String... args) {
        seedRooms();
        seedPromoCodes();
        User defaultUser = seedUsers();
        seedReviews();
        seedBookings(defaultUser);
        ensureRoomInventoryAndBookingNumbers();
    }

    private void ensureRoomInventoryAndBookingNumbers() {
        List<Room> rooms = roomRepository.findAll();
        int idx = 1;
        for (Room room : rooms) {
            if (room.getTotalRooms() == null || room.getTotalRooms() <= 0) {
                room.setTotalRooms(5);
            }
            if (idx > 1 && room.getBaseRoomNumber() != null && room.getBaseRoomNumber() == 101) {
                room.setBaseRoomNumber(idx * 100 + 1);
            }
            roomRepository.save(room);
            idx++;
        }

        Map<Long, Integer> roomOffsetMap = new HashMap<>();
        for (Booking b : bookingRepository.findAll()) {
            if (b.getRoomNumber() == null || b.getRoomNumber().isBlank()) {
                Room r = b.getRoom();
                int base = r != null ? r.getBaseRoomNumber() : 101;
                int total = r != null ? r.getTotalRooms() : 5;
                long rId = (r != null && r.getId() != null) ? r.getId() : 1L;
                int offset = roomOffsetMap.getOrDefault(rId, 0);
                b.setRoomNumber(String.valueOf(base + (offset % total)));
                roomOffsetMap.put(rId, offset + 1);
                bookingRepository.save(b);
            }
        }
    }

    private void seedRooms() {
        if (roomRepository.count() > 0) return;

        roomRepository.save(new Room(
                "Standard Room", "standard-room", "standard", 12500.0, 4.8, 64, 2,
                "1 King Bed or 2 Twins", 1, 380, "Most Affordable",
                "Bright and minimalist tropical retreat with artisanal teak accents and garden breeze.",
                "Step into a serene private haven crafted from native teak timber and handwoven rattan.",
                "1 King or 2 Single Beds", "Lush Garden & Coconut Palm View", true, true,
                Arrays.asList("High-Speed Wi-Fi", "Air Conditioning", "Rain Shower", "Private Balcony", "Smart TV 55\""),
                Arrays.asList(
                        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"
                )
        ));

        roomRepository.save(new Room(
                "Deluxe Oceanfront", "deluxe-oceanfront", "deluxe", 18000.0, 4.95, 98, 3,
                "1 Handcrafted Four-Poster King Bed", 1, 540, "Guest Favorite",
                "Bespoke four-poster canopy bed overlooking azure waves with private sunset terrace.",
                "Perched directly above the shoreline, our Deluxe Oceanfront sanctuary blends tropical architecture with contemporary luxury.",
                "Handcrafted Four-Poster King Bed", "Unobstructed Indian Ocean View", true, true,
                Arrays.asList("Panoramic Ocean View", "Four-Poster Canopy Bed", "Free High-Speed Wi-Fi", "Deep Soaking Terrazzo Tub"),
                Arrays.asList(
                        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?auto=format&fit=crop&w=1200&q=80"
                )
        ));

        roomRepository.save(new Room(
                "Presidential Ocean Suite", "presidential-ocean-suite", "suite", 28000.0, 4.98, 52, 4,
                "1 King Master + 1 Queen Daybed", 2, 860, "Pure Luxury",
                "Expansive open-concept suite with bespoke teak lounge, dual vanity, and ocean panorama.",
                "An ultra-exclusive coastal residence crafted for travelers who value space, privacy, and architectural elegance.",
                "1 King Bed & 1 Queen Daybed", "180° Panoramic Ocean & Coastal Reef", true, true,
                Arrays.asList("Full Oceanfront Living Room", "Dedicated Butler On-Call", "Double Marble Vanity", "In-Suite Breakfast Service"),
                Arrays.asList(
                        "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                )
        ));

        roomRepository.save(new Room(
                "Royal Coconut Grove Villa", "royal-coconut-grove-villa", "villa", 45000.0, 5.0, 37, 5,
                "2 King Beds + 1 Daybed", 2, 1250, "Exclusive Sanctuary",
                "Private standalone villa with private plunge pool, secluded tropical garden, and chef kitchen.",
                "Tucked into a private grove of towering king coconut palms, this standalone sanctuary delivers total seclusion.",
                "2 King Master Beds", "Private Pool & Secluded Botanical Garden", false, true,
                Arrays.asList("Private Plunge Pool", "Secluded Tropical Garden", "Open-Air Rain Shower", "Dedicated Villa Host"),
                Arrays.asList(
                        "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
                )
        ));

        roomRepository.save(new Room(
                "Garden Pavilion Room", "garden-pavilion-room", "standard", 14000.0, 4.75, 43, 2,
                "1 Queen Bed", 1, 420, null,
                "Peaceful garden suite nestled amidst frangipani blossoms and shaded stone walkways.",
                "A haven of peace scented by jasmine and frangipani flowers, ideal for nature lovers seeking quietude.",
                "1 Queen Bed", "Fragrant Frangipani Garden", false, false,
                Arrays.asList("Garden View Verandah", "Organic Herbal Tea Bar", "Air Conditioning & Fan", "High-Speed Wi-Fi"),
                Arrays.asList(
                        "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80"
                )
        ));

        roomRepository.save(new Room(
                "Horizon Penthouse Suite", "horizon-penthouse-suite", "suite", 35000.0, 4.92, 31, 3,
                "1 Super King Bed", 2, 920, null,
                "Top-floor penthouse with vaulted ceilings, wrap-around timber balcony, and sunset jacuzzi.",
                "Occupying the uppermost tier of the main pavilion, this penthouse offers 270-degree vistas across the Bentota coastline.",
                "1 Super King Bed", "270° Panoramic Sea & Horizon", false, true,
                Arrays.asList("Private Balcony Whirlpool Jacuzzi", "270° Panoramic Ocean Horizon", "Super King Featherbed"),
                Arrays.asList(
                        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
                )
        ));
    }

    private void seedPromoCodes() {
        if (promoCodeRepository.count() > 0) return;
        promoCodeRepository.save(new PromoCode("SERENE10", "10% Discount on any coastal room booking", "percentage", 10.0, 10000.0));
        promoCodeRepository.save(new PromoCode("WELCOME15", "15% Special Welcome Discount", "percentage", 15.0, 15000.0));
        promoCodeRepository.save(new PromoCode("CEYLON20", "20% Exclusive Villa & Suite Discount", "percentage", 20.0, 25000.0));
    }

    private User seedUsers() {
        if (!userRepository.existsByEmail("admin@serenestay.com")) {
            User admin = new User("Serene Stay Head Admin", "admin@serenestay.com", "admin123", "+94 77 999 8888", "Bentota", "Sri Lanka", "");
            admin.setRole("super_admin");
            userRepository.save(admin);
        }

        return userRepository.findByEmail("thilinakavishan42@gmail.com").orElseGet(() -> {
            User user = new User("Thilina Kavishan", "thilinakavishan42@gmail.com", "password123", "+94 77 123 4567", "Colombo", "Sri Lanka", "");
            user.setSavedRoomIds(Arrays.asList("room-2", "room-3"));
            return userRepository.save(user);
        });
    }

    private void seedReviews() {
        if (reviewRepository.count() > 0) return;
        reviewRepository.save(new Review("Nisansala P.", "Colombo, Sri Lanka", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80", 5.0, "“A peaceful and beautiful place. The rooms were spotless and the staff were wonderful!”", "2 weeks ago", "Standard Room", 18, 24));
        reviewRepository.save(new Review("Dulaj M.", "Kandy, Sri Lanka", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", 5.0, "“Stunning views, great location and an unforgettable stay. Highly recommended!”", "1 month ago", "Deluxe Oceanfront", 29, 35));
        reviewRepository.save(new Review("Amaya S.", "Galle, Sri Lanka", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80", 5.0, "“The perfect mix of comfort and nature. We can’t wait to come back!”", "3 weeks ago", "Presidential Ocean Suite", 14, 21));
        reviewRepository.save(new Review("David & Sarah K.", "Melbourne, Australia", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80", 5.0, "“The four-poster bed looking out into the Indian Ocean was pure magic. PayHere checkout was seamless.”", "Just now", "Royal Coconut Grove Villa", 8, 12));
    }

    private void seedBookings(User user) {
        if (bookingRepository.count() > 0) return;
        List<Room> allRooms = roomRepository.findAll();
        if (allRooms.isEmpty()) return;

        Room r2 = allRooms.size() > 1 ? allRooms.get(1) : allRooms.get(0);
        Booking b1 = new Booking();
        b1.setBookingReference("SS-LK-94821");
        b1.setRoom(r2);
        b1.setUserId(user.getId());
        b1.setCheckIn("2026-10-18");
        b1.setCheckOut("2026-10-21");
        b1.setNights(3);
        b1.setAdults(2);
        b1.setChildren(0);
        b1.setTotalGuests(2);
        b1.setGuestFullName("Thilina Kavishan");
        b1.setGuestEmail("thilinakavishan42@gmail.com");
        b1.setGuestPhone("+94 77 123 4567");
        b1.setGuestNicPassport("200021394812");
        b1.setSpecialRequests("Upper floor room with sunset view preferred.");
        b1.setPaymentMethod("payhere");
        b1.calculateFinancials(54000.0, 5400.0, 1350.0, 5400.0, 55350.0);
        b1.setPromoCodeApplied("SERENE10");
        b1.setStatus("confirmed");
        b1.setBookedAt("2026-10-02");
        bookingRepository.save(b1);
    }
}
