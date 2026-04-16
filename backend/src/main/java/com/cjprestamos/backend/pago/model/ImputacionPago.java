package com.cjprestamos.backend.pago.model;

import com.cjprestamos.backend.common.model.EntidadAuditable;
import com.cjprestamos.backend.cuota.model.Cuota;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "imputacion_pago")
public class ImputacionPago extends EntidadAuditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pago_id", nullable = false)
    private Pago pago;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cuota_id", nullable = false)
    private Cuota cuota;

    @Column(name = "monto_imputado", nullable = false, precision = 15, scale = 2)
    private BigDecimal montoImputado;

    @Column(name = "fecha_imputacion", nullable = false)
    private LocalDate fechaImputacion;

    public Long getId() {
        return id;
    }

    public Pago getPago() {
        return pago;
    }

    public void setPago(Pago pago) {
        this.pago = pago;
    }

    public Cuota getCuota() {
        return cuota;
    }

    public void setCuota(Cuota cuota) {
        this.cuota = cuota;
    }

    public BigDecimal getMontoImputado() {
        return montoImputado;
    }

    public void setMontoImputado(BigDecimal montoImputado) {
        this.montoImputado = montoImputado;
    }

    public LocalDate getFechaImputacion() {
        return fechaImputacion;
    }

    public void setFechaImputacion(LocalDate fechaImputacion) {
        this.fechaImputacion = fechaImputacion;
    }
}
