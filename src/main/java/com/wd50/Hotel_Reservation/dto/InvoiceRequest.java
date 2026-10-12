package com.wd50.Hotel_Reservation.dto;

public class InvoiceRequest {

    private String bookingId;
    private Double roomCharges;
    private Double extraCharges;
    private Double serviceCharge;
    private Double taxes;
    private String promoCode;

    public InvoiceRequest() {
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public Double getRoomCharges() {
        return roomCharges;
    }

    public void setRoomCharges(Double roomCharges) {
        this.roomCharges = roomCharges;
    }

    public Double getExtraCharges() {
        return extraCharges;
    }

    public void setExtraCharges(Double extraCharges) {
        this.extraCharges = extraCharges;
    }

    public Double getServiceCharge() {
        return serviceCharge;
    }

    public void setServiceCharge(Double serviceCharge) {
        this.serviceCharge = serviceCharge;
    }

    public Double getTaxes() {
        return taxes;
    }

    public void setTaxes(Double taxes) {
        this.taxes = taxes;
    }

    public String getPromoCode() {
        return promoCode;
    }

    public void setPromoCode(String promoCode) {
        this.promoCode = promoCode;
    }
}