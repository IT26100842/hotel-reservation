package com.wd32.Hotel_Reservation.dto;

public class ReviewRequest {
    private String guestName;
    private String location;
    private String avatar;
    private Double rating;
    private String comment;
    private String roomBooked;

    public ReviewRequest() {}

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

    public String getRoomBooked() { return roomBooked; }
    public void setRoomBooked(String roomBooked) { this.roomBooked = roomBooked; }
}
