package com.cjprestamos.backend.pago.model;

import com.cjprestamos.backend.common.model.EntidadAuditable;
import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pago")
public class Pago extends EntidadAuditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prestamo_id", nullable = false)
    private Prestamo prestamo;

    @Column(name = "fecha_pago", nullable = false)
    private LocalDate fechaPago;

    @Column(name = "fecha_efectiva_cobro")
    private LocalDate fechaEfectivaCobro;

    @Column(name = "fecha_contable")
    private LocalDate fechaContable;

    @Column(name = "registrado_en")
    private LocalDateTime registradoEn;

    @Column(name = "anulado_en")
    private LocalDateTime anuladoEn;

    @Column(name = "motivo_anulacion", length = 600)
    private String motivoAnulacion;

    @Column(name = "monto", nullable = false, precision = 15, scale = 2)
    private BigDecimal monto;

    @Column(name = "referencia_manual", length = 120)
    private String referenciaManual;

    @Column(name = "observaciones", length = 600)
    private String observaciones;

    @Column(name = "idempotency_key", length = 120)
    private String idempotencyKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoPago estado;

    @OneToMany(mappedBy = "pago", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImputacionPago> imputaciones = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public Prestamo getPrestamo() {
        return prestamo;
    }

    public void setPrestamo(Prestamo prestamo) {
        this.prestamo = prestamo;
    }

    public LocalDate getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(LocalDate fechaPago) {
        this.fechaPago = fechaPago;
    }

    public LocalDate getFechaEfectivaCobro() {
        return fechaEfectivaCobro;
    }

    public void setFechaEfectivaCobro(LocalDate fechaEfectivaCobro) {
        this.fechaEfectivaCobro = fechaEfectivaCobro;
    }

    public LocalDate getFechaContable() {
        return fechaContable;
    }

    public void setFechaContable(LocalDate fechaContable) {
        this.fechaContable = fechaContable;
    }

    public LocalDateTime getRegistradoEn() {
        return registradoEn;
    }

    public void setRegistradoEn(LocalDateTime registradoEn) {
        this.registradoEn = registradoEn;
    }

    public LocalDateTime getAnuladoEn() {
        return anuladoEn;
    }

    public void setAnuladoEn(LocalDateTime anuladoEn) {
        this.anuladoEn = anuladoEn;
    }

    public String getMotivoAnulacion() {
        return motivoAnulacion;
    }

    public void setMotivoAnulacion(String motivoAnulacion) {
        this.motivoAnulacion = motivoAnulacion;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public String getReferenciaManual() {
        return referenciaManual;
    }

    public void setReferenciaManual(String referenciaManual) {
        this.referenciaManual = referenciaManual;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public EstadoPago getEstado() {
        return estado;
    }

    public void setEstado(EstadoPago estado) {
        this.estado = estado;
    }

    public List<ImputacionPago> getImputaciones() {
        return imputaciones;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }
}
