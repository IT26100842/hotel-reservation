package com.wd50.Hotel_Reservation.service;

import com.wd50.Hotel_Reservation.model.PromoCodeModel;
import com.wd50.Hotel_Reservation.model.PercentagePromoCode;
import com.wd50.Hotel_Reservation.model.FixedAmountPromoCode;
import com.wd50.Hotel_Reservation.repository.PromoCodeRepository;

import java.util.ArrayList;

public class PromoCodeService {

    private final PromoCodeRepository repository;

    public PromoCodeService() {
        repository = new PromoCodeRepository();
    }

    public void createPromoCode(String code, double percentage) {
        PromoCodeModel promo = new PercentagePromoCode(
                cleanCode(code), percentage
        );

        repository.save(promo);
    }

    public void createFixedPromoCode(String code, double amount) {
        PromoCodeModel promo = new FixedAmountPromoCode(
                cleanCode(code), amount
        );

        repository.save(promo);
    }

    public PromoCodeModel getPromoCode(String code) {
        PromoCodeModel promo =
                repository.findByCode(cleanCode(code));

        if (promo == null) {
            throw new IllegalArgumentException(
                    "Promo code not found"
            );
        }

        return promo;
    }

    public ArrayList<PromoCodeModel> getAllPromoCodes() {
        return repository.findAll();
    }

    public double applyPromoCode(String code, double billAmount) {
        PromoCodeModel promo = getPromoCode(code);

        return promo.calculateDiscount(billAmount);
    }

    public void updateDiscount(String code, double newValue) {
        PromoCodeModel oldPromo = getPromoCode(code);
        PromoCodeModel updatedPromo;

        if (oldPromo.getType().equals("percentage")) {
            updatedPromo = new PercentagePromoCode(
                    oldPromo.getCode(), newValue
            );
        } else if (oldPromo.getType().equals("fixed_amount")) {
            updatedPromo = new FixedAmountPromoCode(
                    oldPromo.getCode(), newValue
            );
        } else {
            throw new IllegalArgumentException(
                    "Unknown promo type"
            );
        }

        updatedPromo.setActive(oldPromo.isActive());
        repository.update(updatedPromo);
    }

    public void deactivatePromoCode(String code) {
        PromoCodeModel promo = getPromoCode(code);

        promo.setActive(false);
        repository.update(promo);
    }

    public void activatePromoCode(String code) {
        PromoCodeModel promo = getPromoCode(code);

        promo.setActive(true);
        repository.update(promo);
    }

    public void deletePromoCode(String code) {
        repository.delete(cleanCode(code));
    }

    private String cleanCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Promo code cannot be empty"
            );
        }

        return code.trim();
    }
}