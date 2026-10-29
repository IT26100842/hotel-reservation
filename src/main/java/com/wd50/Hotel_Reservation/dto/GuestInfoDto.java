package com.wd50.Hotel_Reservation.dto;

public class GuestInfoDto {

    private String fullName;
    private String email;
    private String phone;
    private String nicPassport;
    private String specialRequests;

    public GuestInfoDto() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getNicPassport() { return nicPassport; }
    public void setNicPassport(String nicPassport) { this.nicPassport = nicPassport; }

    public String getSpecialRequests() { return specialRequests; }
    public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }
}
