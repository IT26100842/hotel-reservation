package com.wd50.Hotel_Reservation.dto;

public class BookingRequest {

    private String roomId;
    private String roomNumber;
    private Long userId;
    private String checkIn;
    private String checkOut;
    private Integer nights;
    private Integer adults;
    private Integer children;
    private GuestInfoDto guestInfo;
    private String paymentMethod;
    private Double subtotal;
    private Double serviceCharge;
    private Double taxes;
    private Double discountAmount;
    private String promoCodeApplied;
    private Double totalAmount;
    private String currency;

    public BookingRequest() {}

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

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

    public GuestInfoDto getGuestInfo() { return guestInfo; }
    public void setGuestInfo(GuestInfoDto guestInfo) { this.guestInfo = guestInfo; }

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
}


