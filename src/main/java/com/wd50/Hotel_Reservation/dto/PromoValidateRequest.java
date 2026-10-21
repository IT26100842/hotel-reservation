package com.wd32.Hotel_Reservation.dto;

public class PromoValidateRequest {
    private String code;
    private Double subtotal;

    public PromoValidateRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
}
