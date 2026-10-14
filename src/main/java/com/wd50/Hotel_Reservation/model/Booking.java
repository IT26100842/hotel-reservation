package com.wd32.Hotel_Reservation.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "bookings")
public class Booking extends BaseEntity {

    @Column(name = "booking_reference", nullable = false, unique = true, length = 32)
    private String bookingReference;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "room_number", length = 30)
    private String roomNumber;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "check_in_date", nullable = false, length = 20)
    private String checkIn;

    @Column(name = "check_out_date", nullable = false, length = 20)
    private String checkOut;

    private Integer nights = 1;
    private Integer adults = 1;
    private Integer children = 0;

    @Column(name = "total_guests")
    private Integer totalGuests = 1;

    @Column(name = "guest_full_name", nullable = false, length = 150)
    private String guestFullName;

    @Column(name = "guest_email", nullable = false, length = 191)
    private String guestEmail;

    @Column(name = "guest_phone", nullable = false, length = 30)
    private String guestPhone;

    @Column(name = "guest_nic_passport", length = 50)
    private String guestNicPassport;

    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod = "pay_at_hotel";

    private Double subtotal = 0.0;

    @Column(name = "service_charge")
    private Double serviceCharge = 0.0;

    private Double taxes = 0.0;

    @Column(name = "discount_amount")
    private Double discountAmount = 0.0;

    @Column(name = "promo_code_applied", length = 50)
    private String promoCodeApplied;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount = 0.0;

    @Column(length = 10)
    private String currency = "LKR";

    @Column(nullable = false, length = 20)
    private String status = "confirmed";

    @Column(name = "booked_at", length = 30)
    private String bookedAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "user_rating")
    private Integer userRating;

    @Column(name = "user_review_comment", columnDefinition = "TEXT")
    private String userReviewComment;

    public Booking() {}

    @Override
    public void validate() {
        if (room == null) {
            throw new IllegalArgumentException("Room is required for booking.");
        }
        if (guestFullName == null || guestFullName.isBlank()) {
            throw new IllegalArgumentException("Primary guest full name is required.");
        }
        if (guestFullName.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Guest full name cannot contain numbers.");
        }
        if (guestEmail == null || !guestEmail.contains("@") || !guestEmail.contains(".")) {
            throw new IllegalArgumentException("A valid guest email address is required.");
        }
        if (guestPhone == null || guestPhone.isBlank() || guestPhone.replaceAll("\\D", "").length() < 9) {
            throw new IllegalArgumentException("A valid contact phone number is required.");
        }
        if (guestNicPassport == null || guestNicPassport.trim().length() < 6) {
            throw new IllegalArgumentException("A valid NIC or Passport number is required.");
        }
    }

    public boolean hasActiveOccupation() {
        return "confirmed".equalsIgnoreCase(status) || "checked_in".equalsIgnoreCase(status);
    }

    public void calculateFinancials(Double reqSubtotal, Double reqServiceCharge, Double reqTaxes, Double reqDiscount, Double reqTotal) {
        double base = room != null && room.getPricePerNight() != null ? room.getPricePerNight() : 0.0;
        int stayNights = nights != null && nights > 0 ? nights : 1;
        this.subtotal = reqSubtotal != null ? reqSubtotal : (base * stayNights);
        this.serviceCharge = reqServiceCharge != null ? reqServiceCharge : Math.round(this.subtotal * 0.10);
        this.taxes = reqTaxes != null ? reqTaxes : Math.round(this.subtotal * 0.025);
        this.discountAmount = reqDiscount != null ? reqDiscount : 0.0;
        this.totalAmount = reqTotal != null ? reqTotal : Math.max(0, this.subtotal + this.serviceCharge + this.taxes - this.discountAmount);
    }

    public void cancel(String reason) {
        this.status = "cancelled";
        this.cancellationReason = (reason != null && !reason.isBlank()) ? reason : "Cancelled by guest";
    }

    public void applyRating(Integer rating, String comment) {
        this.userRating = rating != null ? rating : 5;
        this.userReviewComment = comment;
    }

    @Transient
    @JsonProperty("roomId")
    public String getRoomId() {
        return room != null ? String.valueOf(room.getId()) : null;
    }

    @Transient
    @JsonProperty("guestInfo")
    public Map<String, String> getGuestInfo() {
        Map<String, String> info = new HashMap<>();
        info.put("fullName", guestFullName);
        info.put("email", guestEmail);
        info.put("phone", guestPhone);
        if (specialRequests != null) info.put("specialRequests", specialRequests);
        if (guestNicPassport != null) info.put("nicPassport", guestNicPassport);
        return info;
    }

    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCheckIn() { return checkIn; }
    public void setCheckIn(String checkIn) { this.checkIn = checkIn; }

    public String getCheckOut() { return checkOut; }
    public void setCheckOut(String checkOut) { this.checkOut = checkOut; }

    public Integer getNights() { return nights; }
    public void setNights(Integer nights) { this.nights = nights; }

    public Integer getAdults() { return adults; }
    public void setAdults(Integer adults) { this.adults = adults; }

    public Integer getChildren() { return children; }
    public void setChildren(Integer children) { this.children = children; }

    public Integer getTotalGuests() { return totalGuests; }
    public void setTotalGuests(Integer totalGuests) { this.totalGuests = totalGuests; }

    public String getGuestFullName() { return guestFullName; }
    public void setGuestFullName(String guestFullName) { this.guestFullName = guestFullName; }

    public String getGuestEmail() { return guestEmail; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }

    public String getGuestPhone() { return guestPhone; }
    public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }

    public String getGuestNicPassport() { return guestNicPassport; }
    public void setGuestNicPassport(String guestNicPassport) { this.guestNicPassport = guestNicPassport; }

    public String getSpecialRequests() { return specialRequests; }
    public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getServiceCharge() { return serviceCharge; }
    public void setServiceCharge(Double serviceCharge) { this.serviceCharge = serviceCharge; }

    public Double getTaxes() { return taxes; }
    public void setTaxes(Double taxes) { this.taxes = taxes; }

    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }

    public String getPromoCodeApplied() { return promoCodeApplied; }
    public void setPromoCodeApplied(String promoCodeApplied) { this.promoCodeApplied = promoCodeApplied; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBookedAt() { return bookedAt; }
    public void setBookedAt(String bookedAt) { this.bookedAt = bookedAt; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public Integer getUserRating() { return userRating; }
    public void setUserRating(Integer userRating) { this.userRating = userRating; }

    public String getUserReviewComment() { return userReviewComment; }
    public void setUserReviewComment(String userReviewComment) { this.userReviewComment = userReviewComment; }
}
