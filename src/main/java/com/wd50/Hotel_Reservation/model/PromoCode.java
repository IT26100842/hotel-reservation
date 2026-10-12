package com.wd50.Hotel_Reservation.model;

public class PromoCode {

    private String code;
    private double discountPercentage;
    private boolean active;

    public PromoCode(String code, double discountPercentage) {
        if (discountPercentage < 0 || discountPercentage > 100) {
            throw new IllegalArgumentException(
                    "Discount must be between 0 and 100"
            );
        }

        this.code = code;
        this.discountPercentage = discountPercentage;
        this.active = true;
    }

    public String getCode() {
        return code;
    }

    public double getDiscountPercentage() {
        return discountPercentage;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public double calculateDiscount(double billAmount) {
        if (billAmount < 0) {
            throw new IllegalArgumentException(
                    "Bill amount cannot be negative"
            );
        }

        if (!active) {
            return 0;
        }

        return billAmount * discountPercentage / 100;
    }
}