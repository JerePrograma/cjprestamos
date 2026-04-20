package com.cjprestamos.backend.legajo.model;

import com.cjprestamos.backend.common.model.EntidadAuditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "legajo_adjunto")
public class LegajoAdjunto extends EntidadAuditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "legajo_id", nullable = false)
    private LegajoPersona legajoPersona;

    @Column(name = "nombre_original", nullable = false, length = 180)
    private String nombreOriginal;

    @Column(name = "nombre_archivo_storage", nullable = false, length = 200)
    private String nombreArchivoStorage;

    @Column(name = "tipo_contenido", nullable = false, length = 120)
    private String tipoContenido;

    @Column(name = "tamano_bytes", nullable = false)
    private long tamanoBytes;

    public Long getId() {
        return id;
    }

    public LegajoPersona getLegajoPersona() {
        return legajoPersona;
    }

    public void setLegajoPersona(LegajoPersona legajoPersona) {
        this.legajoPersona = legajoPersona;
    }

    public String getNombreOriginal() {
        return nombreOriginal;
    }

    public void setNombreOriginal(String nombreOriginal) {
        this.nombreOriginal = nombreOriginal;
    }

    public String getNombreArchivoStorage() {
        return nombreArchivoStorage;
    }

    public void setNombreArchivoStorage(String nombreArchivoStorage) {
        this.nombreArchivoStorage = nombreArchivoStorage;
    }

    public String getTipoContenido() {
        return tipoContenido;
    }

    public void setTipoContenido(String tipoContenido) {
        this.tipoContenido = tipoContenido;
    }

    public long getTamanoBytes() {
        return tamanoBytes;
    }

    public void setTamanoBytes(long tamanoBytes) {
        this.tamanoBytes = tamanoBytes;
    }
}
