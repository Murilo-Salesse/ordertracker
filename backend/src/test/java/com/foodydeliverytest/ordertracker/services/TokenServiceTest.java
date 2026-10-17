package com.foodydeliverytest.ordertracker.services;

import com.foodydeliverytest.ordertracker.entity.UserEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class TokenServiceTest {

    private TokenService tokenService;

    @BeforeEach
    void setUp() {
        tokenService = new TokenService();
        ReflectionTestUtils.setField(tokenService, "secret", "test-secret-key-with-at-least-32-characters-length");
        ReflectionTestUtils.setField(tokenService, "expiration", 3600000L);
    }

    @Test
    @DisplayName("Deve gerar um token JWT válido e extrair o e-mail (subject) corretamente")
    void shouldGenerateAndValidateToken() {
        UserEntity user = new UserEntity("Murilo", "murilo@foody.com", "senha123", "USER");

        String token = tokenService.generateToken(user);
        String subject = tokenService.validateTokenAndGetSubject(token);

        assertNotNull(token);
        assertEquals("murilo@foody.com", subject);
    }

    @Test
    @DisplayName("Deve retornar null ao validar um token inválido ou adulterado")
    void shouldReturnNullForInvalidToken() {
        String subject = tokenService.validateTokenAndGetSubject("token.invalido.adulterado");
        assertNull(subject);
    }
}
