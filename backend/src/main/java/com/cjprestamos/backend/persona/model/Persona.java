package com.cjprestamos.backend.persona.model;

import com.cjprestamos.backend.common.model.EntidadAuditable;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "persona")
public class Persona extends EntidadAuditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, length = 120)
    private String nombre;

    @Column(name = "alias", length = 80)
    private String alias;

    @Column(name = "telefono", length = 40)
    private String telefono;

    @Column(name = "observacion_rapida", length = 300)
    private String observacionRapida;

    @Column(name = "color_referencia", length = 30)
    private String colorReferencia;

    @Column(name = "cobra_en_fecha")
    private Integer cobraEnFecha;

    @Column(name = "tiene_ingreso_extra", nullable = false)
    private boolean tieneIngresoExtra;

    @Column(name = "activo", nullable = false)
    private boolean activo = true;

    @OneToMany(mappedBy = "persona", fetch = FetchType.LAZY)
    private List<Prestamo> prestamos = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getObservacionRapida() {
        return observacionRapida;
    }

    public void setObservacionRapida(String observacionRapida) {
        this.observacionRapida = observacionRapida;
    }

    public String getColorReferencia() {
        return colorReferencia;
    }

    public void setColorReferencia(String colorReferencia) {
        this.colorReferencia = colorReferencia;
    }

    public Integer getCobraEnFecha() {
        return cobraEnFecha;
    }

    public void setCobraEnFecha(Integer cobraEnFecha) {
        this.cobraEnFecha = cobraEnFecha;
    }

    public boolean isTieneIngresoExtra() {
        return tieneIngresoExtra;
    }

    public void setTieneIngresoExtra(boolean tieneIngresoExtra) {
        this.tieneIngresoExtra = tieneIngresoExtra;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public List<Prestamo> getPrestamos() {
        return prestamos;
    }
}
