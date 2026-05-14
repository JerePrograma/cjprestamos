ALTER TABLE pago
    ADD COLUMN idempotency_key VARCHAR(120);

CREATE UNIQUE INDEX uq_pago_prestamo_idempotency_key
    ON pago (prestamo_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;
