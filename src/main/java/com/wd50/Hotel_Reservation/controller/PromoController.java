package com.wd50.Hotel_Reservation.controller;

import com.wd50.Hotel_Reservation.dto.PromoValidateRequest;
import com.wd50.Hotel_Reservation.model.PromoCode;
import com.wd50.Hotel_Reservation.service.PromoCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promos")
public class PromoController extends BaseController {

    private final PromoCodeService promoCodeService;

    public PromoController(PromoCodeService promoCodeService) {
        this.promoCodeService = promoCodeService;
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validate(@RequestBody PromoValidateRequest request) {
        return ResponseEntity.ok(promoCodeService.validate(
                request != null ? request.getCode() : null,
                request != null ? request.getSubtotal() : null
        ));
    }

    @GetMapping
    public ResponseEntity<List<PromoCode>> getAllPromos() {
        return ResponseEntity.ok(promoCodeService.getAll());
    }

    @PostMapping
    public ResponseEntity<PromoCode> createPromo(@RequestBody PromoCode promoCode) {
        return ResponseEntity.ok(promoCodeService.save(promoCode));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletePromo(@PathVariable Long id) {
        promoCodeService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Promo deleted", "id", id));
    }
}
