package com.wd32.Hotel_Reservation.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "reviews")
public class Review extends BaseEntity {

    @Column(name = "guest_name", nullable = false, length = 150)
    private String guestName;

    @Column(name = "guest_location", length = 100)
    private String location;

    @Column(name = "avatar_url", length = 500)
    private String avatar;

    private Double rating = 5.0;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String comment;

    @Column(name = "review_date", length = 50)
    private String date = "Just now";

    @Column(name = "room_booked_name", length = 100)
    private String roomBooked = "Deluxe Oceanfront";

    @Column(name = "likes_count")
    private Integer likes = 0;

    @Column(name = "hearts_count")
    private Integer hearts = 0;

    @Column(length = 20)
    private String status = "approved";

    @Column(name = "is_featured")
    private Boolean isFeatured = true;

    public Review() {}

    public Review(String guestName, String location, String avatar, Double rating, String comment, String date, String roomBooked, Integer likes, Integer hearts) {
        this.guestName = guestName;
        this.location = location != null ? location : "";
        this.avatar = avatar != null ? avatar : "";
        this.rating = rating != null ? rating : 5.0;
        this.comment = comment;
        this.date = date != null ? date : "Just now";
        this.roomBooked = (roomBooked != null && !roomBooked.isBlank()) ? roomBooked : "Deluxe Oceanfront";
        this.likes = likes != null ? likes : 0;
        this.hearts = hearts != null ? hearts : 0;
        this.status = "approved";
        this.isFeatured = true;
    }

    @Override
    public void validate() {
        if (guestName == null || guestName.isBlank()) {
            throw new IllegalArgumentException("Guest name is required.");
        }
        if (guestName.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Guest name cannot contain numbers.");
        }
        if (comment == null || comment.isBlank()) {
            throw new IllegalArgumentException("Review comment is required.");
        }
    }

    public void adjustLikes(boolean increment) {
        int current = likes != null ? likes : 0;
        this.likes = increment ? current + 1 : Math.max(0, current - 1);
    }

    public void adjustHearts(boolean increment) {
        int current = hearts != null ? hearts : 0;
        this.hearts = increment ? current + 1 : Math.max(0, current - 1);
    }

    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getRoomBooked() { return roomBooked; }
    public void setRoomBooked(String roomBooked) { this.roomBooked = roomBooked; }

    public Integer getLikes() { return likes; }
    public void setLikes(Integer likes) { this.likes = likes; }

    public Integer getHearts() { return hearts; }
    public void setHearts(Integer hearts) { this.hearts = hearts; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
}
