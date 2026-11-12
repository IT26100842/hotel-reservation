package com.wd50.Hotel_Reservation.service;

import com.wd50.Hotel_Reservation.model.RoomCategory;
import com.wd50.Hotel_Reservation.repository.RoomCategoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RoomCategoryService extends BaseService<RoomCategory> {

    private final RoomCategoryRepository roomCategoryRepository;

    public RoomCategoryService(RoomCategoryRepository roomCategoryRepository) {
        super(roomCategoryRepository);
        this.roomCategoryRepository = roomCategoryRepository;
    }

    public List<RoomCategory> getActiveCategories() {
        List<RoomCategory> active = roomCategoryRepository.findByIsActiveTrueOrderBySortOrderAsc();
        if (active.isEmpty()) {
            return roomCategoryRepository.findAllByOrderBySortOrderAsc();
        }
        return active;
    }

    public Optional<RoomCategory> findBySlugOrName(String slugOrName) {
        if (slugOrName == null || slugOrName.isBlank()) return Optional.empty();
        Optional<RoomCategory> bySlug = roomCategoryRepository.findBySlugIgnoreCase(slugOrName.trim());
        if (bySlug.isPresent()) return bySlug;
        return roomCategoryRepository.findByNameIgnoreCase(slugOrName.trim());
    }

    public RoomCategory updateCategory(Long id, RoomCategory updated) {
        RoomCategory existing = getById(id);
        if (updated.getName() != null && !updated.getName().isBlank()) {
            existing.setName(updated.getName().trim());
        }
        if (updated.getSlug() != null && !updated.getSlug().isBlank()) {
            String newSlug = updated.getSlug().trim().toLowerCase().replaceAll("[^a-z0-9_-]+", "-");
            Optional<RoomCategory> conflict = roomCategoryRepository.findBySlugIgnoreCase(newSlug);
            if (conflict.isPresent() && !conflict.get().getId().equals(existing.getId())) {
                throw new IllegalArgumentException("A category with slug '" + newSlug + "' already exists.");
            }
            existing.setSlug(newSlug);
        }
        if (updated.getShortDescription() != null) {
            existing.setShortDescription(updated.getShortDescription().trim());
        }
        if (updated.getBasePrice() != null) {
            existing.setBasePrice(updated.getBasePrice());
        }
        if (updated.getSortOrder() != null) {
            existing.setSortOrder(updated.getSortOrder());
        }
        if (updated.getIsActive() != null) {
            existing.setIsActive(updated.getIsActive());
        }
        return save(existing);
    }
}