package com.foodydeliverytest.ordertracker.controller;

import com.foodydeliverytest.ordertracker.dto.requests.LoginRequestDTO;
import com.foodydeliverytest.ordertracker.dto.requests.RegisterRequestDTO;
import com.foodydeliverytest.ordertracker.dto.responses.ApiResponse;
import com.foodydeliverytest.ordertracker.dto.responses.AuthResponseDTO;
import com.foodydeliverytest.ordertracker.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /* fix commit */

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(@Valid @RequestBody RegisterRequestDTO request) {
        AuthResponseDTO response = authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Usuário cadastrado com sucesso!", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@Valid @RequestBody LoginRequestDTO request) {
        AuthResponseDTO response = authService.login(request);

        return ResponseEntity.ok(ApiResponse.success("Login realizado com sucesso!", response));
    }
}