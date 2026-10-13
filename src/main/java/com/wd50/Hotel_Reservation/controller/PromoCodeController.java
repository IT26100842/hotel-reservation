package com.wd50.Hotel_Reservation.controller;

import com.wd50.Hotel_Reservation.dto.PromoCodeRequest;
import com.wd50.Hotel_Reservation.dto.PromoValidationRequest;
import com.wd50.Hotel_Reservation.model.PromoCodeModel;
import com.wd50.Hotel_Reservation.service.PromoCodeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/api/promos")
public class PromoCodeController {

    private final PromoCodeService service = new PromoCodeService();

    // READ: Get all promo codes.
    @GetMapping
    public ArrayList<Map<String, Object>> getAllPromos() {
        ArrayList<Map<String, Object>> result = new ArrayList<>();

        for (PromoCodeModel promo : service.getAllPromoCodes()) {
            result.add(toResponse(promo));
        }

        return result;
    }

    // READ: Find one promo code.
    @GetMapping("/{code}")
    public Map<String, Object> getPromo(
            @PathVariable("code") String code) {

        return toResponse(service.getPromoCode(code));
    }

    // CREATE: Add a percentage or fixed amount promo.
    @PostMapping
    public ResponseEntity<Map<String, Object>> createPromo(
            @RequestBody PromoCodeRequest request) {

        if (request.getDiscountValue() == null) {
            throw new IllegalArgumentException(
                    "Discount value is required"
            );
        }

        String type = request.getDiscountType();

        if ("percentage".equalsIgnoreCase(type)) {
            service.createPromoCode(
                    request.getCode(),
                    request.getDiscountValue()
            );
        } else if ("fixed_amount".equalsIgnoreCase(type)
                || "fixed".equalsIgnoreCase(type)) {
            service.createFixedPromoCode(
                    request.getCode(),
                    request.getDiscountValue()
            );
        } else {
            throw new IllegalArgumentException(
                    "Discount type must be percentage or fixed_amount"
            );
        }

        PromoCodeModel savedPromo =
                service.getPromoCode(request.getCode());

        return ResponseEntity.status(201)
                .body(toResponse(savedPromo));
    }

    // APPLY: Validate the promo and calculate a preview discount.
    @PostMapping("/validate")
    public Map<String, Object> validatePromo(
            @RequestBody PromoValidationRequest request) {

        try {
            if (request.getSubtotal() == null) {
                throw new IllegalArgumentException(
                        "Subtotal is required"
                );
            }

            double subtotal = request.getSubtotal();

            double discount = service.applyPromoCode(
                    request.getCode(), subtotal
            );

            double rate = 0;

            if (subtotal > 0) {
                rate = discount / subtotal;
            }

            return Map.of(
                    "valid", true,
                    "discountAmount", discount,
                    "discountRate", rate,
                    "message", "Promo code applied"
            );

        } catch (IllegalArgumentException e) {
            return Map.of(
                    "valid", false,
                    "discountAmount", 0,
                    "discountRate", 0,
                    "message", e.getMessage()
            );
        }
    }

    // UPDATE: Change the discount value.
    @PutMapping("/{code}/discount")
    public Map<String, Object> updateDiscount(
            @PathVariable("code") String code,
            @RequestBody PromoCodeRequest request) {

        if (request.getDiscountValue() == null) {
            throw new IllegalArgumentException(
                    "Discount value is required"
            );
        }

        service.updateDiscount(code, request.getDiscountValue());

        return toResponse(service.getPromoCode(code));
    }

    // UPDATE: Activate or deactivate a promo.
    @PutMapping("/{code}/active")
    public Map<String, Object> changeActiveStatus(
            @PathVariable("code") String code,
            @RequestParam("active") boolean active) {

        if (active) {
            service.activatePromoCode(code);
        } else {
            service.deactivatePromoCode(code);
        }

        return toResponse(service.getPromoCode(code));
    }

    // DELETE: Remove a promo code.
    @DeleteMapping("/{code}")
    public Map<String, String> deletePromo(
            @PathVariable("code") String code) {

        service.deletePromoCode(code);

        return Map.of("message", "Promo code deleted");
    }

    // Convert the model into frontend response fields.
    private Map<String, Object> toResponse(PromoCodeModel promo) {
        return Map.of(
                "id", promo.getCode(),
                "code", promo.getCode(),
                "discountType", promo.getType(),
                "discountValue", promo.getDiscountValue(),
                "isActive", promo.isActive()
        );
    }

    // Invalid input returns HTTP 400.
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleInvalidInput(
            IllegalArgumentException e) {

        return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
    }

    // File storage failures return HTTP 500.
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleStorageError(
            IllegalStateException e) {

        return ResponseEntity.internalServerError()
                .body(Map.of(
                        "error",
                        "Could not read or save promo codes"
                ));
    }
}