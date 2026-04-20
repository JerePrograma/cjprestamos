CREATE TABLE legajo_adjunto (
    id BIGSERIAL PRIMARY KEY,
    legajo_id BIGINT NOT NULL,
    nombre_original VARCHAR(180) NOT NULL,
    nombre_archivo_storage VARCHAR(200) NOT NULL,
    tipo_contenido VARCHAR(120) NOT NULL,
    tamano_bytes BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_legajo_adjunto_legajo FOREIGN KEY (legajo_id) REFERENCES legajo_persona (id) ON DELETE CASCADE
);

CREATE INDEX idx_legajo_adjunto_legajo_id ON legajo_adjunto (legajo_id);
