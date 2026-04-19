CREATE TABLE legajo_persona (
    id BIGSERIAL PRIMARY KEY,
    persona_id BIGINT NOT NULL,
    direccion VARCHAR(300),
    ocupacion VARCHAR(120),
    fuente_ingreso VARCHAR(200),
    contacto_alternativo VARCHAR(200),
    documentacion_pendiente VARCHAR(600),
    notas_internas VARCHAR(1200),
    observaciones_generales VARCHAR(1200),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_legajo_persona_persona FOREIGN KEY (persona_id) REFERENCES persona (id),
    CONSTRAINT uk_legajo_persona_persona UNIQUE (persona_id)
);

CREATE INDEX idx_legajo_persona_persona_id ON legajo_persona (persona_id);
