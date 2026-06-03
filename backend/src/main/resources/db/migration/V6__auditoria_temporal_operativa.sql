ALTER TABLE pago
    ADD COLUMN registrado_en TIMESTAMP,
    ADD COLUMN anulado_en TIMESTAMP,
    ADD COLUMN motivo_anulacion VARCHAR(600),
    ADD COLUMN fecha_efectiva_cobro DATE,
    ADD COLUMN fecha_contable DATE;

UPDATE pago
SET registrado_en = created_at
WHERE registrado_en IS NULL;

UPDATE pago
SET fecha_efectiva_cobro = fecha_pago
WHERE fecha_efectiva_cobro IS NULL;

UPDATE pago
SET fecha_contable = fecha_pago
WHERE fecha_contable IS NULL;

CREATE INDEX idx_pago_registrado_en ON pago(registrado_en);
CREATE INDEX idx_pago_fecha_efectiva_cobro ON pago(fecha_efectiva_cobro);
CREATE INDEX idx_pago_fecha_contable ON pago(fecha_contable);
CREATE INDEX idx_pago_anulado_en ON pago(anulado_en) WHERE anulado_en IS NOT NULL;

ALTER TABLE imputacion_pago
    ADD COLUMN registrado_en TIMESTAMP;

UPDATE imputacion_pago
SET registrado_en = created_at
WHERE registrado_en IS NULL;

CREATE INDEX idx_imputacion_pago_registrado_en ON imputacion_pago(registrado_en);

ALTER TABLE evento_prestamo
    ADD COLUMN ocurrido_en TIMESTAMP,
    ADD COLUMN registrado_en TIMESTAMP;

UPDATE evento_prestamo
SET ocurrido_en = fecha_evento
WHERE ocurrido_en IS NULL;

UPDATE evento_prestamo
SET registrado_en = created_at
WHERE registrado_en IS NULL;

CREATE INDEX idx_evento_prestamo_ocurrido_en ON evento_prestamo(ocurrido_en);
CREATE INDEX idx_evento_prestamo_registrado_en ON evento_prestamo(registrado_en);
