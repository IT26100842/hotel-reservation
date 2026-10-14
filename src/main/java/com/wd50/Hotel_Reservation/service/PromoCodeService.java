package com.wd50.Hotel_Reservation.service;

import com.wd50.Hotel_Reservation.model.PromoCode;
import com.wd50.Hotel_Reservation.repository.PromoCodeRepository;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class PromoCodeService extends BaseService<PromoCode> {

    private final PromoCodeRepository promoCodeRepository;

    public PromoCodeService(PromoCodeRepository promoCodeRepository) {
        super(promoCodeRepository);
        this.promoCodeRepository = promoCodeRepository;
    }

    public Map<String, Object> validate(String code, Double subtotal) {
        Map<String, Object> result = new HashMap<>();
        if (code == null || code.isBlank()) {
            result.put("valid", false);
            result.put("message", "Promo code cannot be empty");
            return result;
        }

        Optional<PromoCode> promoOpt = promoCodeRepository.findByCodeIgnoreCaseAndIsActiveTrue(code.trim());
        if (promoOpt.isEmpty()) {
            result.put("valid", false);
            result.put("message", "Invalid promo code. Try 'SERENE10' for 10% off.");
            return result;
        }

        PromoCode promo = promoOpt.get();
        if (subtotal != null && promo.getMinSpend() != null && subtotal < promo.getMinSpend()) {
            result.put("valid", false);
            result.put("message", "Minimum spend of LKR " + promo.getMinSpend() + " required for this code.");
            return result;
        }

        double discountRate = promo.getDiscountValue() / 100.0;
        double discountAmount = promo.calculateDiscount(subtotal);

        result.put("valid", true);
        result.put("code", promo.getCode());
        result.put("discountRate", discountRate);
        result.put("discountAmount", discountAmount);
        result.put("description", promo.getDescription());
        return result;
    }
}
