package com.wd50.Hotel_Reservation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HotelReservationApplication {

    public static void main(String[] args) {
        try {
            SpringApplication.run(HotelReservationApplication.class, args);
        } catch (Exception e) {
            if (e.getClass().getName().contains("SilentExitException")) {
                throw e;
            }
            handleStartupFailure(e);
        }
    }

    private static void handleStartupFailure(Exception rootException) {
        Throwable current = rootException;
        boolean isDbError = false;

        while (current != null) {
            String msg = current.getMessage() != null ? current.getMessage().toLowerCase() : "";
            String className = current.getClass().getName().toLowerCase();

            if (className.contains("sql") || className.contains("hikari") || 
                className.contains("mysql") || className.contains("hibernate") || 
                msg.contains("communications link failure") || msg.contains("connection refused") || 
                msg.contains("access denied") || msg.contains("dialect")) {
                isDbError = true;
                break;
            }
            current = current.getCause();
        }

        if (isDbError) {
            String red    = "\u001B[31m";
            String yellow = "\u001B[33m";
            String cyan   = "\u001B[36m";
            String bold   = "\u001B[1m";
            String reset  = "\u001B[0m";

            System.out.println("\n" + red + bold + "================================================================================");
            System.out.println("  [X] DATABASE CONNECTION FAILED!");
            System.out.println("================================================================================" + reset);
            System.out.println(red + "Reason: " + (current != null ? current.getMessage() : rootException.getMessage()) + reset + "\n");
            
            System.out.println(yellow + bold + "Please verify the following troubleshooting steps:" + reset);
            System.out.println("  1. " + cyan + "Check Configuration:" + reset + " Open 'src/main/resources/application.properties'");
            System.out.println("     Ensure 'spring.datasource.url', 'username', and 'password' are correct.\n");
            System.out.println("  2. " + cyan + "Cloud MySQL Status:" + reset + " If using a cloud database:");
            System.out.println("     - Check whether your cloud instance is online/active.");
            System.out.println("     - Verify if your current public IP is whitelisted.\n");
            System.out.println("  3. " + cyan + "Local Fallback:" + reset + " Switch to your local MySQL database:");
            System.out.println("     spring.datasource.url=jdbc:mysql://localhost:3306/hotel_db");
            System.out.println("     spring.datasource.username=root");
            System.out.println("     spring.datasource.password=your_password\n");
            System.out.println(red + bold + "================================================================================\n" + reset);
            
            System.exit(1);
        } else {
            rootException.printStackTrace();
            System.exit(1);
        }
    }
}