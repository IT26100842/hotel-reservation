package com.wd50.Hotel_Reservation.dto;

public class PromoValidationRequest {

    private String code;
    private Double subtotal;

    public PromoValidationRequest() {
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }
}