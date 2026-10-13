package com.wd50.Hotel_Reservation;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping(value = {
        "/rooms",
        "/rooms/**",
        "/room/**",
        "/search",
        "/explore",
        "/all-rooms",
        "/checkout",
        "/book",
        "/booking",
        "/payment",
        "/dashboard",
        "/bookings",
        "/my-bookings",
        "/reservations",
        "/profile",
        "/account",
        "/admin",
        "/admin/**"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}