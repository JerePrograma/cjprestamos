package com.cjprestamos.backend.legajo.model;

import com.cjprestamos.backend.common.model.EntidadAuditable;
import com.cjprestamos.backend.persona.model.Persona;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "legajo_persona")
public class LegajoPersona extends EntidadAuditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "persona_id", nullable = false, unique = true)
    private Persona persona;

    @Column(name = "direccion", length = 300)
    private String direccion;

    @Column(name = "ocupacion", length = 120)
    private String ocupacion;

    @Column(name = "fuente_ingreso", length = 200)
    private String fuenteIngreso;

    @Column(name = "contacto_alternativo", length = 200)
    private String contactoAlternativo;

    @Column(name = "documentacion_pendiente", length = 600)
    private String documentacionPendiente;

    @Column(name = "notas_internas", length = 1200)
    private String notasInternas;

    @Column(name = "observaciones_generales", length = 1200)
    private String observacionesGenerales;

    public Long getId() {
        return id;
    }

    public Persona getPersona() {
        return persona;
    }

    public void setPersona(Persona persona) {
        this.persona = persona;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getOcupacion() {
        return ocupacion;
    }

    public void setOcupacion(String ocupacion) {
        this.ocupacion = ocupacion;
    }

    public String getFuenteIngreso() {
        return fuenteIngreso;
    }

    public void setFuenteIngreso(String fuenteIngreso) {
        this.fuenteIngreso = fuenteIngreso;
    }

    public String getContactoAlternativo() {
        return contactoAlternativo;
    }

    public void setContactoAlternativo(String contactoAlternativo) {
        this.contactoAlternativo = contactoAlternativo;
    }

    public String getDocumentacionPendiente() {
        return documentacionPendiente;
    }

    public void setDocumentacionPendiente(String documentacionPendiente) {
        this.documentacionPendiente = documentacionPendiente;
    }

    public String getNotasInternas() {
        return notasInternas;
    }

    public void setNotasInternas(String notasInternas) {
        this.notasInternas = notasInternas;
    }

    public String getObservacionesGenerales() {
        return observacionesGenerales;
    }

    public void setObservacionesGenerales(String observacionesGenerales) {
        this.observacionesGenerales = observacionesGenerales;
    }
}
