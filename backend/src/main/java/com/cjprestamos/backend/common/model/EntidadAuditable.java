package com.cjprestamos.backend.common.model;

import com.cjprestamos.backend.common.audit.AuditoriaProvider;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.LocalDateTime;

@MappedSuperclass
public abstract class EntidadAuditable {

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void prePersist() {
        LocalDateTime ahora = AuditoriaProvider.ahora();
        this.createdAt = ahora;
        this.updatedAt = ahora;
    }

    @PreUpdate
    protected void preUpdate() {
        this.updatedAt = AuditoriaProvider.ahora();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
