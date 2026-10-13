package com.wd50.Hotel_Reservation.model;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class InvoiceModel {

    private final String invoiceId;
    private final String bookingId;

    private final BigDecimal roomCharges;
    private final BigDecimal extraCharges;
    private final BigDecimal serviceCharge;
    private final BigDecimal taxes;
    private final BigDecimal discountAmount;

    public InvoiceModel(
            String invoiceId,
            String bookingId,
            double roomCharges,
            double extraCharges,
            double serviceCharge,
            double taxes,
            double discountAmount) {

        if (invoiceId == null || invoiceId.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Invoice ID cannot be empty"
            );
        }

        if (bookingId == null || bookingId.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Booking ID cannot be empty"
            );
        }

        this.invoiceId = invoiceId.trim();
        this.bookingId = bookingId.trim();

        this.roomCharges = validateMoney(roomCharges);
        this.extraCharges = validateMoney(extraCharges);
        this.serviceCharge = validateMoney(serviceCharge);
        this.taxes = validateMoney(taxes);
        this.discountAmount = validateMoney(discountAmount);

        if (this.discountAmount.compareTo(this.roomCharges) > 0) {
            throw new IllegalArgumentException(
                    "Promo discount cannot exceed room charges"
            );
        }
    }

    public String getInvoiceId() {
        return invoiceId;
    }

    public String getBookingId() {
        return bookingId;
    }

    public double getRoomCharges() {
        return roomCharges.doubleValue();
    }

    public double getExtraCharges() {
        return extraCharges.doubleValue();
    }

    public double getServiceCharge() {
        return serviceCharge.doubleValue();
    }

    public double getTaxes() {
        return taxes.doubleValue();
    }

    public double getDiscountAmount() {
        return discountAmount.doubleValue();
    }

    public double getTotalAmount() {

        BigDecimal total = roomCharges
                .add(extraCharges)
                .add(serviceCharge)
                .add(taxes)
                .subtract(discountAmount);

        return total.doubleValue();
    }

    private BigDecimal validateMoney(double amount) {

        if (!Double.isFinite(amount) || amount < 0) {
            throw new IllegalArgumentException(
                    "Money amount must be zero or greater"
            );
        }

        return BigDecimal.valueOf(amount)
                .setScale(2, RoundingMode.HALF_UP);
    }
}