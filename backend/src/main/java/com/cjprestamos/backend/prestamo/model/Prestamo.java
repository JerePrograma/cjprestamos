package com.cjprestamos.backend.prestamo.model;

import com.cjprestamos.backend.common.model.EntidadAuditable;
import com.cjprestamos.backend.cuota.model.Cuota;
import com.cjprestamos.backend.evento.model.EventoPrestamo;
import com.cjprestamos.backend.pago.model.Pago;
import com.cjprestamos.backend.persona.model.Persona;
import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import com.cjprestamos.backend.prestamo.model.enums.FrecuenciaTipo;
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
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prestamo")
public class Prestamo extends EntidadAuditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "persona_id", nullable = false)
    private Persona persona;

    @Column(name = "monto_inicial", nullable = false, precision = 15, scale = 2)
    private BigDecimal montoInicial;

    @Column(name = "porcentaje_fijo_sugerido", precision = 7, scale = 4)
    private BigDecimal porcentajeFijoSugerido;

    @Column(name = "interes_manual_opcional", precision = 15, scale = 2)
    private BigDecimal interesManualOpcional;

    @Column(name = "cantidad_cuotas", nullable = false)
    private Integer cantidadCuotas;

    @Enumerated(EnumType.STRING)
    @Column(name = "frecuencia_tipo", nullable = false, length = 30)
    private FrecuenciaTipo frecuenciaTipo;

    @Column(name = "frecuencia_cada_dias")
    private Integer frecuenciaCadaDias;

    @Column(name = "fecha_base")
    private LocalDate fechaBase;

    @Column(name = "usar_fechas_manuales", nullable = false)
    private boolean usarFechasManuales;

    @Column(name = "referencia_codigo", length = 80)
    private String referenciaCodigo;

    @Column(name = "observaciones", length = 600)
    private String observaciones;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoPrestamo estado;

    @OneToMany(mappedBy = "prestamo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Cuota> cuotas = new ArrayList<>();

    @OneToMany(mappedBy = "prestamo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Pago> pagos = new ArrayList<>();

    @OneToMany(mappedBy = "prestamo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventoPrestamo> eventos = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public Persona getPersona() {
        return persona;
    }

    public void setPersona(Persona persona) {
        this.persona = persona;
    }

    public BigDecimal getMontoInicial() {
        return montoInicial;
    }

    public void setMontoInicial(BigDecimal montoInicial) {
        this.montoInicial = montoInicial;
    }

    public BigDecimal getPorcentajeFijoSugerido() {
        return porcentajeFijoSugerido;
    }

    public void setPorcentajeFijoSugerido(BigDecimal porcentajeFijoSugerido) {
        this.porcentajeFijoSugerido = porcentajeFijoSugerido;
    }

    public BigDecimal getInteresManualOpcional() {
        return interesManualOpcional;
    }

    public void setInteresManualOpcional(BigDecimal interesManualOpcional) {
        this.interesManualOpcional = interesManualOpcional;
    }

    public Integer getCantidadCuotas() {
        return cantidadCuotas;
    }

    public void setCantidadCuotas(Integer cantidadCuotas) {
        this.cantidadCuotas = cantidadCuotas;
    }

    public FrecuenciaTipo getFrecuenciaTipo() {
        return frecuenciaTipo;
    }

    public void setFrecuenciaTipo(FrecuenciaTipo frecuenciaTipo) {
        this.frecuenciaTipo = frecuenciaTipo;
    }

    public Integer getFrecuenciaCadaDias() {
        return frecuenciaCadaDias;
    }

    public void setFrecuenciaCadaDias(Integer frecuenciaCadaDias) {
        this.frecuenciaCadaDias = frecuenciaCadaDias;
    }

    public LocalDate getFechaBase() {
        return fechaBase;
    }

    public void setFechaBase(LocalDate fechaBase) {
        this.fechaBase = fechaBase;
    }

    public boolean isUsarFechasManuales() {
        return usarFechasManuales;
    }

    public void setUsarFechasManuales(boolean usarFechasManuales) {
        this.usarFechasManuales = usarFechasManuales;
    }

    public String getReferenciaCodigo() {
        return referenciaCodigo;
    }

    public void setReferenciaCodigo(String referenciaCodigo) {
        this.referenciaCodigo = referenciaCodigo;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public EstadoPrestamo getEstado() {
        return estado;
    }

    public void setEstado(EstadoPrestamo estado) {
        this.estado = estado;
    }

    public List<Cuota> getCuotas() {
        return cuotas;
    }

    public List<Pago> getPagos() {
        return pagos;
    }

    public List<EventoPrestamo> getEventos() {
        return eventos;
    }
}
