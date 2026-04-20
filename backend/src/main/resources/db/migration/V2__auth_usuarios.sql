CREATE TABLE usuario_sistema (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    password VARCHAR(160) NOT NULL,
    rol VARCHAR(30) NOT NULL,
    activo BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

INSERT INTO usuario_sistema (username, password, rol, activo, created_at, updated_at)
VALUES
    ('operadora', '{noop}operadora123', 'OPERADORA', TRUE, NOW(), NOW()),
    ('operadora-test', '{noop}operadora-test-123', 'OPERADORA', TRUE, NOW(), NOW())
ON CONFLICT (username) DO NOTHING;
