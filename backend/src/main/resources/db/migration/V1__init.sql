CREATE TABLE persona (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    alias VARCHAR(80),
    telefono VARCHAR(40),
    observacion_rapida VARCHAR(300),
    color_referencia VARCHAR(30),
    cobra_en_fecha INTEGER,
    tiene_ingreso_extra BOOLEAN NOT NULL,
    activo BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE prestamo (
    id BIGSERIAL PRIMARY KEY,
    persona_id BIGINT NOT NULL,
    monto_inicial NUMERIC(15,2) NOT NULL,
    porcentaje_fijo_sugerido NUMERIC(7,4),
    interes_manual_opcional NUMERIC(15,2),
    cantidad_cuotas INTEGER NOT NULL,
    frecuencia_tipo VARCHAR(30) NOT NULL,
    frecuencia_cada_dias INTEGER,
    fecha_base DATE,
    usar_fechas_manuales BOOLEAN NOT NULL,
    referencia_codigo VARCHAR(80),
    observaciones VARCHAR(600),
    estado VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_prestamo_persona FOREIGN KEY (persona_id) REFERENCES persona (id)
);

CREATE TABLE cuota (
    id BIGSERIAL PRIMARY KEY,
    prestamo_id BIGINT NOT NULL,
    numero_cuota INTEGER NOT NULL,
    fecha_vencimiento DATE,
    monto_programado NUMERIC(15,2) NOT NULL,
    monto_pagado NUMERIC(15,2) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_cuota_prestamo FOREIGN KEY (prestamo_id) REFERENCES prestamo (id),
    CONSTRAINT uk_cuota_prestamo_numero UNIQUE (prestamo_id, numero_cuota)
);

CREATE TABLE pago (
    id BIGSERIAL PRIMARY KEY,
    prestamo_id BIGINT NOT NULL,
    fecha_pago DATE NOT NULL,
    monto NUMERIC(15,2) NOT NULL,
    referencia_manual VARCHAR(120),
    observaciones VARCHAR(600),
    estado VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_pago_prestamo FOREIGN KEY (prestamo_id) REFERENCES prestamo (id)
);

CREATE TABLE imputacion_pago (
    id BIGSERIAL PRIMARY KEY,
    pago_id BIGINT NOT NULL,
    cuota_id BIGINT NOT NULL,
    monto_imputado NUMERIC(15,2) NOT NULL,
    fecha_imputacion DATE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_imputacion_pago_pago FOREIGN KEY (pago_id) REFERENCES pago (id),
    CONSTRAINT fk_imputacion_pago_cuota FOREIGN KEY (cuota_id) REFERENCES cuota (id)
);

CREATE TABLE evento_prestamo (
    id BIGSERIAL PRIMARY KEY,
    prestamo_id BIGINT NOT NULL,
    tipo_evento VARCHAR(40) NOT NULL,
    descripcion VARCHAR(600) NOT NULL,
    fecha_evento TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_evento_prestamo_prestamo FOREIGN KEY (prestamo_id) REFERENCES prestamo (id)
);

CREATE INDEX idx_prestamo_persona_id ON prestamo (persona_id);
CREATE INDEX idx_prestamo_estado ON prestamo (estado);
CREATE INDEX idx_cuota_prestamo_id ON cuota (prestamo_id);
CREATE INDEX idx_cuota_estado ON cuota (estado);
CREATE INDEX idx_pago_prestamo_id ON pago (prestamo_id);
CREATE INDEX idx_pago_fecha_pago ON pago (fecha_pago);
CREATE INDEX idx_imputacion_pago_pago_id ON imputacion_pago (pago_id);
CREATE INDEX idx_imputacion_pago_cuota_id ON imputacion_pago (cuota_id);
CREATE INDEX idx_evento_prestamo_prestamo_id ON evento_prestamo (prestamo_id);
CREATE INDEX idx_persona_activo ON persona (activo);
