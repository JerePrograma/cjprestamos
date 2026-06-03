ALTER TABLE prestamo
    ADD COLUMN eliminado BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_prestamo_eliminado ON prestamo (eliminado);
CREATE INDEX idx_prestamo_estado_eliminado ON prestamo (estado, eliminado);
