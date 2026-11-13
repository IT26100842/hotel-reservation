package com.wd50.Hotel_Reservation.controller;

import com.wd50.Hotel_Reservation.dto.PromoValidateRequest;
import com.wd50.Hotel_Reservation.model.PromoCode;
import com.wd50.Hotel_Reservation.service.PromoCodeService;
import com.wd50.Hotel_Reservation.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promos")
public class PromoController extends BaseController {

    private final PromoCodeService promoCodeService;
    private final UserService userService;

    public PromoController(PromoCodeService promoCodeService, UserService userService) {
        this.promoCodeService = promoCodeService;
        this.userService = userService;
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
    public ResponseEntity<?> createPromo(@RequestBody PromoCode promoCode, HttpServletRequest request) {
        String role = resolveCallerRole(request, userService);
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Standard Administrators have view-only access to promotional codes."));
        }
        return ResponseEntity.ok(promoCodeService.save(promoCode));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePromo(@PathVariable Long id, @RequestBody PromoCode promoCode, HttpServletRequest request) {
        String role = resolveCallerRole(request, userService);
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Standard Administrators have view-only access to promotional codes."));
        }
        return ResponseEntity.ok(promoCodeService.update(id, promoCode));
    }

    @DeleteMapping("/{idOrCode}")
    public ResponseEntity<?> deletePromo(@PathVariable String idOrCode, HttpServletRequest request) {
        String role = resolveCallerRole(request, userService);
        if ("admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied: Standard Administrators have view-only access to promotional codes."));
        }
        promoCodeService.deleteByIdOrCode(idOrCode);
        return ResponseEntity.ok(Map.of("message", "Promo deleted", "id", idOrCode));
    }
}
