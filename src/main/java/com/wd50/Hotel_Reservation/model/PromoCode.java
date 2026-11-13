package com.wd50.Hotel_Reservation.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;
import java.time.LocalDateTime;

@Entity
@Table(name = "promo_codes")
public class PromoCode extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    private String description;

    @Column(name = "discount_type", length = 30)
    private String discountType = "percentage";

    @Column(name = "discount_value", nullable = false)
    private Double discountValue;

    @Column(name = "min_spend")
    private Double minSpend = 0.0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // The current admin form omits dates. Preserve its open-ended behavior while
    // satisfying the existing MySQL DATETIME NOT NULL columns.
    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;

    @Column(name = "valid_until", nullable = false)
    private LocalDateTime validUntil;

    @PrePersist
    public void initializeValidity() {
        if (validFrom == null) {
            validFrom = LocalDateTime.now().withNano(0);
        }
        if (validUntil == null) {
            validUntil = LocalDateTime.of(9999, 12, 31, 23, 59, 59);
        }
        validateValidity();
    }

    private void validateValidity() {
        if (validFrom != null && validUntil != null && !validUntil.isAfter(validFrom)) {
            throw new IllegalArgumentException("Promo end date must be after its start date.");
        }
    }

    public boolean isValidAt(LocalDateTime time) {
        return (validFrom == null || !time.isBefore(validFrom))
                && (validUntil == null || !time.isAfter(validUntil));
    }

    public LocalDateTime getValidFrom() { return validFrom; }
    public void setValidFrom(LocalDateTime validFrom) { this.validFrom = validFrom; }

    public LocalDateTime getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDateTime validUntil) { this.validUntil = validUntil; }

    public PromoCode() {}

    public PromoCode(String code, String description, String discountType, Double discountValue, Double minSpend) {
        this.code = code;
        this.description = description;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.minSpend = minSpend;
        this.isActive = true;
    }

    @Override
    public void validate() {
        initializeValidity();
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Promo code is required.");
        }
        if (discountValue == null || discountValue <= 0) {
            throw new IllegalArgumentException("Discount value must be greater than zero.");
        }
    }

    public double calculateDiscount(Double subtotal) {
        if (subtotal == null || (minSpend != null && subtotal < minSpend)) {
            return 0.0;
        }
        if ("fixed".equalsIgnoreCase(discountType)) {
            return Math.min(subtotal, discountValue);
        }
        return Math.round(subtotal * (discountValue / 100.0));
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }

    public Double getMinSpend() { return minSpend; }
    public void setMinSpend(Double minSpend) { this.minSpend = minSpend; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
