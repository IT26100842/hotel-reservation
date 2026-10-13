package com.wd50.Hotel_Reservation.repository;

import com.wd50.Hotel_Reservation.model.PromoCodeModel;
import com.wd50.Hotel_Reservation.model.PercentagePromoCode;
import com.wd50.Hotel_Reservation.model.FixedAmountPromoCode;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.ArrayList;

public class PromoCodeRepository {

    private final Path filePath =
            Path.of("data", "promo-codes.txt");

    public synchronized ArrayList<PromoCodeModel> findAll() {
        ArrayList<PromoCodeModel> promos = new ArrayList<>();

        try {
            if (Files.notExists(filePath)) {
                return promos;
            }

            for (String line :
                    Files.readAllLines(filePath, StandardCharsets.UTF_8)) {

                if (line.isBlank()) {
                    continue;
                }

                String[] parts = line.split("\\|", -1);

                if (parts.length != 4) {
                    throw new IllegalArgumentException(
                            "Invalid promo record"
                    );
                }

                String code = parts[0];
                String type = parts[1];
                double value = Double.parseDouble(parts[2]);

                PromoCodeModel promo;

                if (type.equals("percentage")) {
                    promo = new PercentagePromoCode(code, value);
                } else if (type.equals("fixed_amount")) {
                    promo = new FixedAmountPromoCode(code, value);
                } else {
                    throw new IllegalArgumentException(
                            "Unknown promo type"
                    );
                }

                if (!parts[3].equals("true")
                        && !parts[3].equals("false")) {
                    throw new IllegalArgumentException(
                            "Invalid active status"
                    );
                }

                promo.setActive(Boolean.parseBoolean(parts[3]));
                promos.add(promo);
            }

            return promos;

        } catch (IOException | IllegalArgumentException e) {
            throw new IllegalStateException(
                    "Could not read promo codes", e
            );
        }
    }

    public synchronized PromoCodeModel findByCode(String code) {
        for (PromoCodeModel promo : findAll()) {
            if (promo.getCode().equalsIgnoreCase(code)) {
                return promo;
            }
        }

        return null;
    }

    public synchronized void save(PromoCodeModel promo) {
        ArrayList<PromoCodeModel> promos = findAll();

        for (PromoCodeModel existing : promos) {
            if (existing.getCode().equalsIgnoreCase(promo.getCode())) {
                throw new IllegalArgumentException(
                        "Promo code already exists"
                );
            }
        }

        promos.add(promo);
        writeAll(promos);
    }

    public synchronized void update(PromoCodeModel updatedPromo) {
        ArrayList<PromoCodeModel> promos = findAll();

        for (int i = 0; i < promos.size(); i++) {
            if (promos.get(i).getCode()
                    .equalsIgnoreCase(updatedPromo.getCode())) {

                promos.set(i, updatedPromo);
                writeAll(promos);
                return;
            }
        }

        throw new IllegalArgumentException(
                "Promo code not found"
        );
    }

    public synchronized void delete(String code) {
        ArrayList<PromoCodeModel> promos = findAll();

        for (int i = 0; i < promos.size(); i++) {
            if (promos.get(i).getCode().equalsIgnoreCase(code)) {
                promos.remove(i);
                writeAll(promos);
                return;
            }
        }

        throw new IllegalArgumentException(
                "Promo code not found"
        );
    }

    private void writeAll(ArrayList<PromoCodeModel> promos) {
        ArrayList<String> lines = new ArrayList<>();

        for (PromoCodeModel promo : promos) {
            String line = promo.getCode() + "|"
                    + promo.getType() + "|"
                    + promo.getDiscountValue() + "|"
                    + promo.isActive();

            lines.add(line);
        }

        Path temporaryFile = null;

        try {
            Files.createDirectories(filePath.getParent());

            temporaryFile = Files.createTempFile(
                    filePath.getParent(), "promos-", ".tmp"
            );

            Files.write(
                    temporaryFile, lines, StandardCharsets.UTF_8
            );

            try {
                Files.move(
                        temporaryFile,
                        filePath,
                        StandardCopyOption.REPLACE_EXISTING,
                        StandardCopyOption.ATOMIC_MOVE
                );
            } catch (AtomicMoveNotSupportedException e) {
                Files.move(
                        temporaryFile,
                        filePath,
                        StandardCopyOption.REPLACE_EXISTING
                );
            }

        } catch (IOException e) {
            throw new IllegalStateException(
                    "Could not save promo codes", e
            );
        } finally {
            if (temporaryFile != null) {
                try {
                    Files.deleteIfExists(temporaryFile);
                } catch (IOException ignored) {
                    // Temporary file cleanup failed.
                }
            }
        }
    }
}