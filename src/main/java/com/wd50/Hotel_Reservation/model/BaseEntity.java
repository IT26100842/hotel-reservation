package com.wd50.Hotel_Reservation.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import java.time.LocalDateTime;

@MappedSuperclass
@JsonIgnoreProperties(ignoreUnknown = true)
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public abstract void validate();

    @JsonProperty("id")
    public Long getId() {
        return id;
    }

    /**
     * Jackson deserialization uses this setter. We safely ignore non-numeric values
     * (e.g. frontend "room-4" strings) to prevent type mismatch errors.
     * The real id is always set by the database via @GeneratedValue.
     */
    @JsonIgnore
    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}