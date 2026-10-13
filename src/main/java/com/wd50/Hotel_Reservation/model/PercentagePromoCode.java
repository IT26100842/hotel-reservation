package com.wd50.Hotel_Reservation.model;

import java.math.BigDecimal;

public class PercentagePromoCode extends PromoCodeModel {

    public PercentagePromoCode(String code, double percentage) {
        super(code, percentage);

        if (percentage > 100) {
            throw new IllegalArgumentException(
                    "Percentage cannot exceed 100"
            );
        }
    }

    protected BigDecimal calculateAmount(BigDecimal billAmount) {
        return billAmount
                .multiply(BigDecimal.valueOf(getDiscountValue()))
                .divide(BigDecimal.valueOf(100));
    }

    public String getType() {
        return "percentage";
    }
}