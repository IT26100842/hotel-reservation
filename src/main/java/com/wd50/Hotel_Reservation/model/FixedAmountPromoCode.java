package com.wd50.Hotel_Reservation.model;

import java.math.BigDecimal;

public class FixedAmountPromoCode extends PromoCodeModel {

    public FixedAmountPromoCode(String code, double amount) {
        super(code, amount);
    }

    protected BigDecimal calculateAmount(BigDecimal billAmount) {
        return BigDecimal.valueOf(getDiscountValue());
    }

    public String getType() {
        return "fixed_amount";
    }
}