package com.wd50.Hotel_Reservation.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_categories")
public class RoomCategory extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "short_description", length = 255)
    private String shortDescription;

    @Column(name = "base_price")
    private Double basePrice = 0.0;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public RoomCategory() {}

    public RoomCategory(String name, String slug, String shortDescription, Double basePrice, Integer sortOrder) {
        this.name = name;
        this.slug = slug != null && !slug.isBlank() ? slug.trim().toLowerCase() : generateSlug(name);
        this.shortDescription = shortDescription;
        this.basePrice = basePrice != null ? basePrice : 0.0;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
        this.isActive = true;
    }

    private String generateSlug(String val) {
        if (val == null || val.isBlank()) {
            return "cat-" + System.currentTimeMillis();
        }
        return val.trim().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }

    @PrePersist
    @PreUpdate
    public void prepareDefaults() {
        if (slug == null || slug.isBlank()) {
            slug = generateSlug(name);
        } else {
            slug = slug.trim().toLowerCase().replaceAll("[^a-z0-9_-]+", "-");
        }
        if (basePrice == null) basePrice = 0.0;
        if (sortOrder == null) sortOrder = 0;
        if (isActive == null) isActive = true;
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public void validate() {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Category name is required.");
        }
        prepareDefaults();
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }

    public Double getBasePrice() { return basePrice; }
    public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
