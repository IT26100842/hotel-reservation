package com.wd50.Hotel_Reservation.service;

import com.wd50.Hotel_Reservation.model.BaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public abstract class BaseService<T extends BaseEntity> {

    protected final JpaRepository<T, Long> repository;

    protected BaseService(JpaRepository<T, Long> repository) {
        this.repository = repository;
    }

    public List<T> getAll() {
        return repository.findAll();
    }

    public Optional<T> findById(Long id) {
        return repository.findById(id);
    }

    public T getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Record not found with ID: " + id));
    }

    public T save(T entity) {
        entity.validate();
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
