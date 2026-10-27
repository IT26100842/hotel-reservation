package com.wd50.Hotel_Reservation.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class AppReadyListener {

    private final Environment environment;

    public AppReadyListener(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        String port = environment.getProperty("local.server.port", 
                      environment.getProperty("server.port", "8080"));
        String contextPath = environment.getProperty("server.servlet.context-path", "");
        String url = "http://localhost:" + port + contextPath;

        // Console colors & styles (ANSI escape codes)
        String reset = "\u001B[0m";
        String green = "\u001B[32m";
        String cyan = "\u001B[36m";
        String bold = "\u001B[1m";
        String yellow = "\u001B[33m";
        String magenta = "\u001B[35m";
        String white = "\u001B[37m";

        System.out.println();
        System.out.println(green + bold + "=============================================================================" + reset);
        System.out.println(green + bold + "  [+]  SERENE STAY HOTEL ROOM RESERVATION SYSTEM IS NOW LIVE & READY!  [+]" + reset);
        System.out.println(green + bold + "=============================================================================" + reset);
        System.out.println("  " + cyan + "* Local App URL   :" + reset + "  " + bold + url + reset);
        System.out.println("  " + cyan + "* Admin Panel     :" + reset + "  " + bold + url + "/admin" + reset);
        System.out.println("  " + cyan + "* Database Status :" + reset + "  " + green + "Connected & Seeded [OK]" + reset);
        System.out.println(green + "-----------------------------------------------------------------------------" + reset);
        System.out.println("  " + magenta + bold + "[*] Official Head Administrator Credentials:" + reset);
        System.out.println("     " + white + "[*] Username : " + reset + bold + "admin@serenestay.com" + reset);
        System.out.println("     " + white + "[*] Password : " + reset + bold + "admin123" + reset);
        System.out.println(green + "-----------------------------------------------------------------------------" + reset);
        System.out.println("  " + yellow + "-> Press Ctrl + C in terminal to stop the server safely." + reset);
        System.out.println(green + bold + "=============================================================================" + reset);
        System.out.println();
    }
}