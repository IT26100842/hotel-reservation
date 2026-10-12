package com.wd50.Hotel_Reservation;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    // '/api' නොවන සහ file extension එකක් (.js, .css, .ico වැනි) නැති සියලුම routes 'index.html' වෙත forward කරයි
    @GetMapping(value = {
        "/",
        "/{path:[^\\.]*}",
        "/**/{path:[^\\.]*}"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}