package com.wd32.Hotel_Reservation.dto;

public class RateBookingRequest {
    private Integer rating;
    private String comment;

    public RateBookingRequest() {}

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
