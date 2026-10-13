package com.wd50.Hotel_Reservation.model;

public class CashPayment extends PaymentModel {

    public CashPayment(
            String paymentId,
            String bookingId,
            double amount) {

        super(paymentId, bookingId, amount);
    }

    public CashPayment(
            String paymentId,
            String bookingId,
            double amount,
            String recordedAt) {

        super(paymentId, bookingId, amount, recordedAt);
    }

    public String getPaymentMethod() {
        return "CASH";
    }
}