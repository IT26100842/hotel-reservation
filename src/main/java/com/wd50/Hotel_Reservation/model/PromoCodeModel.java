package com.wd50.Hotel_Reservation.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;

public abstract class PromoCodeModel {

    private final String code;
    private final double discountValue;
    private boolean active;

    public PromoCodeModel(String code, double discountValue) {

        if (code == null
                || !code.trim().matches("[A-Za-z0-9_-]{1,50}")) {
            throw new IllegalArgumentException(
                    "Promo code must contain only letters, numbers, _ or -"
            );
        }

        if (!Double.isFinite(discountValue) || discountValue <= 0) {
            throw new IllegalArgumentException(
                    "Discount value must be greater than zero"
            );
        }

        this.code = code.trim().toUpperCase(Locale.ROOT);
        this.discountValue = discountValue;
        this.active = true;
    }

    public String getCode() {
        return code;
    }

    public double getDiscountValue() {
        return discountValue;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public final double calculateDiscount(double billAmount) {

        if (!Double.isFinite(billAmount) || billAmount < 0) {
            throw new IllegalArgumentException(
                    "Bill amount must be zero or greater"
            );
        }

        if (!active) {
            throw new IllegalArgumentException(
                    "This promo code is inactive"
            );
        }

        BigDecimal bill = BigDecimal.valueOf(billAmount)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal discount = calculateAmount(bill);

        return discount.min(bill)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    protected abstract BigDecimal calculateAmount(
            BigDecimal billAmount
    );

    public abstract String getType();
}