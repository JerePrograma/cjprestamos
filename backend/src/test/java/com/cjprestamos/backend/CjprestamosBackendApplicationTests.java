package com.cjprestamos.backend;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import org.junit.jupiter.api.Test;

class CjprestamosBackendApplicationTests {

    @Test
    void contextLoads() {
        assertDoesNotThrow(() -> new CjprestamosBackendApplication());
    }
}
