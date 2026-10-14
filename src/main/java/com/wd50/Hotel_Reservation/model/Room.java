package com.wd50.Hotel_Reservation.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms")
public class Room extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 191)
    private String slug;

    @Column(name = "room_type", nullable = false, length = 50)
    private String type;

    @Column(name = "price_per_night", nullable = false)
    private Double pricePerNight;

    @Column(length = 10)
    private String currency = "LKR";

    private Double rating = 5.0;

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(length = 200)
    private String location = "Bentota Beach, Sri Lanka";

    @Column(name = "max_guests")
    private Integer maxGuests = 2;

    @Column(length = 100)
    private String beds = "1 King Bed";

    private Integer baths = 1;

    @Column(name = "size_sq_ft")
    private Integer sizeSqFt = 450;

    @Column(length = 50)
    private String tag;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "detailed_description", columnDefinition = "LONGTEXT")
    private String detailedDescription;

    @Column(name = "cancellation_policy", columnDefinition = "TEXT")
    private String cancellationPolicy = "Free cancellation up to 48 hours before check-in";

    @Column(name = "bed_type", length = 100)
    private String bedType = "King Bed";

    @Column(name = "view_type", length = 100)
    private String view = "Oceanfront View";

    private Boolean featured = false;

    private Boolean popular = false;

    @Column(length = 30)
    private String status = "available";

    @Column(name = "total_rooms")
    private Integer totalRooms = 5;

    @Column(name = "base_room_number")
    private Integer baseRoomNumber = 101;

    @Transient
    private Integer occupiedRooms = 0;

    @Transient
    private Integer availableRooms = 5;

    @Transient
    private List<String> roomNumbers = new ArrayList<>();

    @Transient
    private List<String> occupiedRoomNumbers = new ArrayList<>();

    @Transient
    private List<String> availableRoomNumbers = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "room_amenity_names", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "amenity")
    private List<String> amenities = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "room_image_urls", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "image_url", length = 500)
    private List<String> images = new ArrayList<>();

    public Room() {}

    public Room(String name, String slug, String type, Double pricePerNight, Double rating, Integer reviewCount,
                Integer maxGuests, String beds, Integer baths, Integer sizeSqFt, String tag,
                String description, String detailedDescription, String bedType, String view,
                Boolean featured, Boolean popular, List<String> amenities, List<String> images) {
        this.name = name;
        this.slug = slug;
        this.type = type;
        this.pricePerNight = pricePerNight;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.maxGuests = maxGuests;
        this.beds = beds;
        this.baths = baths;
        this.sizeSqFt = sizeSqFt;
        this.tag = tag;
        this.description = description;
        this.detailedDescription = detailedDescription;
        this.bedType = bedType;
        this.view = view;
        this.featured = featured;
        this.popular = popular;
        this.amenities = amenities;
        this.images = images;
    }

    @Override
    public void validate() {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Room name is required.");
        }
        if (pricePerNight == null || pricePerNight <= 0) {
            throw new IllegalArgumentException("Room price must be greater than zero.");
        }
    }

    public void updateFrom(Room updated) {
        if (updated.name != null) this.name = updated.name;
        if (updated.slug != null) this.slug = updated.slug;
        if (updated.type != null) this.type = updated.type;
        if (updated.pricePerNight != null) this.pricePerNight = updated.pricePerNight;
        if (updated.currency != null) this.currency = updated.currency;
        if (updated.rating != null) this.rating = updated.rating;
        if (updated.reviewCount != null) this.reviewCount = updated.reviewCount;
        if (updated.location != null) this.location = updated.location;
        if (updated.maxGuests != null) this.maxGuests = updated.maxGuests;
        if (updated.beds != null) this.beds = updated.beds;
        if (updated.baths != null) this.baths = updated.baths;
        if (updated.sizeSqFt != null) this.sizeSqFt = updated.sizeSqFt;
        if (updated.tag != null) this.tag = updated.tag;
        if (updated.description != null) this.description = updated.description;
        if (updated.detailedDescription != null) this.detailedDescription = updated.detailedDescription;
        if (updated.cancellationPolicy != null) this.cancellationPolicy = updated.cancellationPolicy;
        if (updated.bedType != null) this.bedType = updated.bedType;
        if (updated.view != null) this.view = updated.view;
        if (updated.featured != null) this.featured = updated.featured;
        if (updated.popular != null) this.popular = updated.popular;
        if (updated.status != null) this.status = updated.status;
        if (updated.totalRooms != null && updated.totalRooms > 0) this.totalRooms = updated.totalRooms;
        if (updated.baseRoomNumber != null && updated.baseRoomNumber > 0) this.baseRoomNumber = updated.baseRoomNumber;
        if (updated.amenities != null && !updated.amenities.isEmpty()) this.amenities = updated.amenities;
        if (updated.images != null && !updated.images.isEmpty()) this.images = updated.images;
    }

    public void updateAvailability(List<Booking> roomBookings) {
        int total = getTotalRooms();
        int base = getBaseRoomNumber();

        List<String> allNumbers = new ArrayList<>();
        for (int i = 0; i < total; i++) {
            allNumbers.add(String.valueOf(base + i));
        }
        this.roomNumbers = allNumbers;

        List<String> occupied = new ArrayList<>();
        if (roomBookings != null) {
            for (Booking booking : roomBookings) {
                if (booking.hasActiveOccupation()) {
                    String num = booking.getRoomNumber() != null ? booking.getRoomNumber().trim() : "";
                    if (!num.isEmpty() && allNumbers.contains(num) && !occupied.contains(num)) {
                        occupied.add(num);
                    } else {
                        for (String candidate : allNumbers) {
                            if (!occupied.contains(candidate)) {
                                occupied.add(candidate);
                                break;
                            }
                        }
                    }
                }
            }
        }

        List<String> available = new ArrayList<>();
        for (String num : allNumbers) {
            if (!occupied.contains(num)) {
                available.add(num);
            }
        }

        this.occupiedRoomNumbers = occupied;
        this.occupiedRooms = occupied.size();

        if ("maintenance".equalsIgnoreCase(this.status)) {
            this.availableRooms = 0;
            this.availableRoomNumbers = new ArrayList<>();
        } else {
            this.availableRooms = available.size();
            this.availableRoomNumbers = available;
        }
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Double getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(Double pricePerNight) { this.pricePerNight = pricePerNight; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getMaxGuests() { return maxGuests; }
    public void setMaxGuests(Integer maxGuests) { this.maxGuests = maxGuests; }

    public String getBeds() { return beds; }
    public void setBeds(String beds) { this.beds = beds; }

    public Integer getBaths() { return baths; }
    public void setBaths(Integer baths) { this.baths = baths; }

    public Integer getSizeSqFt() { return sizeSqFt; }
    public void setSizeSqFt(Integer sizeSqFt) { this.sizeSqFt = sizeSqFt; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDetailedDescription() { return detailedDescription; }
    public void setDetailedDescription(String detailedDescription) { this.detailedDescription = detailedDescription; }

    public String getCancellationPolicy() { return cancellationPolicy; }
    public void setCancellationPolicy(String cancellationPolicy) { this.cancellationPolicy = cancellationPolicy; }

    public String getBedType() { return bedType; }
    public void setBedType(String bedType) { this.bedType = bedType; }

    public String getView() { return view; }
    public void setView(String view) { this.view = view; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public Boolean getPopular() { return popular; }
    public void setPopular(Boolean popular) { this.popular = popular; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getTotalRooms() {
        return totalRooms != null && totalRooms > 0 ? totalRooms : 5;
    }
    public void setTotalRooms(Integer totalRooms) {
        this.totalRooms = totalRooms != null && totalRooms > 0 ? totalRooms : 1;
    }

    public Integer getBaseRoomNumber() {
        return baseRoomNumber != null && baseRoomNumber > 0
                ? baseRoomNumber
                : (getId() != null ? getId().intValue() * 100 + 1 : 101);
    }
    public void setBaseRoomNumber(Integer baseRoomNumber) {
        this.baseRoomNumber = baseRoomNumber != null && baseRoomNumber > 0 ? baseRoomNumber : 101;
    }

    public Integer getOccupiedRooms() { return occupiedRooms; }
    public void setOccupiedRooms(Integer occupiedRooms) { this.occupiedRooms = occupiedRooms; }

    public Integer getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(Integer availableRooms) { this.availableRooms = availableRooms; }

    public List<String> getRoomNumbers() { return roomNumbers; }
    public void setRoomNumbers(List<String> roomNumbers) { this.roomNumbers = roomNumbers; }

    public List<String> getOccupiedRoomNumbers() { return occupiedRoomNumbers; }
    public void setOccupiedRoomNumbers(List<String> occupiedRoomNumbers) { this.occupiedRoomNumbers = occupiedRoomNumbers; }

    public List<String> getAvailableRoomNumbers() { return availableRoomNumbers; }
    public void setAvailableRoomNumbers(List<String> availableRoomNumbers) { this.availableRoomNumbers = availableRoomNumbers; }

    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}
