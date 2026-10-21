package com.wd50.Hotel_Reservation.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false, unique = true, length = 191)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password_hash", nullable = false)
    private String password;

    @Column(length = 30)
    private String phone;

    @Column(name = "nic_passport", length = 50)
    private String nicPassport;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String country = "Sri Lanka";

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl = "";

    @Column(name = "preferred_currency", length = 10)
    private String preferredCurrency = "LKR";

    @Column(length = 20)
    private String role = "guest";

    @Column(length = 20)
    private String status = "active";

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_saved_rooms", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "room_id")
    private List<String> savedRoomIds = new ArrayList<>();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public User() {}

    public User(String fullName, String email, String password, String phone, String city, String country, String avatarUrl) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.city = city != null ? city : "";
        this.country = (country != null && !country.isBlank()) ? country : "Sri Lanka";
        this.avatarUrl = avatarUrl != null ? avatarUrl : "";
        this.preferredCurrency = "LKR";
        this.role = "guest";
        this.status = "active";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public void validate() {
        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException("Full name is required.");
        }
        if (fullName.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Full name cannot contain numbers.");
        }
        if (email == null || !email.contains("@") || !email.contains(".")) {
            throw new IllegalArgumentException("Please enter a valid email address.");
        }
    }

    public boolean hasAdminRole() {
        return role != null && (role.equalsIgnoreCase("admin")
                || role.equalsIgnoreCase("super_admin")
                || role.equalsIgnoreCase("manager"));
    }

    public void toggleSavedRoom(String roomId) {
        if (savedRoomIds.contains(roomId)) {
            savedRoomIds.remove(roomId);
        } else {
            savedRoomIds.add(roomId);
        }
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getNicPassport() { return nicPassport; }
    public void setNicPassport(String nicPassport) { this.nicPassport = nicPassport; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getPreferredCurrency() { return preferredCurrency; }
    public void setPreferredCurrency(String preferredCurrency) { this.preferredCurrency = preferredCurrency; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getSavedRoomIds() { return savedRoomIds; }
    public void setSavedRoomIds(List<String> savedRoomIds) { this.savedRoomIds = savedRoomIds; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
