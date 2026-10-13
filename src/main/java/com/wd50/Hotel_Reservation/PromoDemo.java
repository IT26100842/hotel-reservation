package com.wd50.Hotel_Reservation;

import com.wd50.Hotel_Reservation.model.PromoCodeModel;
import com.wd50.Hotel_Reservation.service.PromoCodeService;

public class PromoDemo {

    public static void main(String[] args) {

        PromoCodeService service = new PromoCodeService();

        // Different codes for each test run.
        String uniqueId = Long.toUnsignedString(System.nanoTime());
        String percentageCode = "TEST10_" + uniqueId;
        String fixedCode = "TEST500_" + uniqueId;

        // 1. CREATE
        service.createPromoCode(percentageCode, 10);
        service.createFixedPromoCode(fixedCode, 500);

        System.out.println("CREATE: Two promo codes saved.");

        // 2. READ
        PromoCodeModel promo = service.getPromoCode(percentageCode);

        System.out.println("READ: Discount value = "
                + promo.getDiscountValue());

        // 3. APPLY DIFFERENT DISCOUNTS
        double billAmount = 10000;

        double percentageDiscount =
                service.applyPromoCode(percentageCode, billAmount);

        double fixedDiscount =
                service.applyPromoCode(fixedCode, billAmount);

        System.out.println("10% discount = " + percentageDiscount);
        System.out.println("Fixed discount = " + fixedDiscount);

        // 4. UPDATE
        service.updateDiscount(percentageCode, 20);

        System.out.println("After updating to 20% = "
                + service.applyPromoCode(percentageCode, billAmount));

        // 5. READ SAVED DATA THROUGH A NEW SERVICE OBJECT
        PromoCodeService anotherService = new PromoCodeService();

        System.out.println("Discount value read from file = "
                + anotherService.getPromoCode(percentageCode)
                .getDiscountValue());

        // 6. DEACTIVATE
        service.deactivatePromoCode(percentageCode);

        System.out.println("Active after deactivation = "
                + service.getPromoCode(percentageCode).isActive());

        // 7. ACTIVATE
        service.activatePromoCode(percentageCode);

        System.out.println("Active after activation = "
                + service.getPromoCode(percentageCode).isActive());

        // 8. DELETE ONLY THE TWO PROMOS CREATED BY THIS TEST
        service.deletePromoCode(percentageCode);
        service.deletePromoCode(fixedCode);

        System.out.println("DELETE: Two test promo codes removed.");
    }
}