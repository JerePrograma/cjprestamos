package com.cjprestamos.backend.auth.controller;

import com.cjprestamos.backend.auth.dto.AuthMeResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public AuthMeResponse me(Authentication authentication) {
        String rol = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .findFirst()
            .orElse("ROLE_OPERADORA")
            .replace("ROLE_", "");

        return new AuthMeResponse(authentication.getName(), rol);
    }
}
