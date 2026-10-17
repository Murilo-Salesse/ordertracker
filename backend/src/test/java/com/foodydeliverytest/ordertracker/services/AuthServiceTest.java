package com.foodydeliverytest.ordertracker.services;

import com.foodydeliverytest.ordertracker.dto.requests.LoginRequestDTO;
import com.foodydeliverytest.ordertracker.dto.requests.RegisterRequestDTO;
import com.foodydeliverytest.ordertracker.dto.responses.AuthResponseDTO;
import com.foodydeliverytest.ordertracker.entity.UserEntity;
import com.foodydeliverytest.ordertracker.exception.BusinessException;
import com.foodydeliverytest.ordertracker.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private TokenService tokenService;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("Deve cadastrar um novo usuário com sucesso e retornar token JWT")
    void shouldRegisterUserSuccessfully() {
        RegisterRequestDTO request = new RegisterRequestDTO("Murilo", "murilo@email.com", "123456");
        UserEntity savedUser = new UserEntity("Murilo", "murilo@email.com", "hashedPassword", "USER");

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("hashedPassword");
        when(userRepository.save(any(UserEntity.class))).thenReturn(savedUser);
        when(tokenService.generateToken(savedUser)).thenReturn("jwt-token-gerado");

        AuthResponseDTO response = authService.register(request);

        assertNotNull(response);
        assertEquals("jwt-token-gerado", response.token());
        assertEquals("Murilo", response.name());
        assertEquals("murilo@email.com", response.email());
        verify(userRepository, times(1)).save(any(UserEntity.class));
    }

    @Test
    @DisplayName("Deve lançar BusinessException (409) ao tentar cadastrar e-mail já existente")
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        RegisterRequestDTO request = new RegisterRequestDTO("Murilo", "duplicado@email.com", "123456");
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> authService.register(request));

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertEquals("Já existe um usuário cadastrado com este e-mail.", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve realizar login com sucesso quando credenciais forem válidas")
    void shouldLoginSuccessfully() {
        LoginRequestDTO request = new LoginRequestDTO("murilo@email.com", "123456");
        UserEntity user = new UserEntity("Murilo", "murilo@email.com", "hashedPassword", "USER");

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.password(), user.getPassword())).thenReturn(true);
        when(tokenService.generateToken(user)).thenReturn("jwt-token-valido");

        AuthResponseDTO response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token-valido", response.token());
        assertEquals("Murilo", response.name());
    }

    @Test
    @DisplayName("Deve lançar BusinessException (401) no login quando e-mail não existir")
    void shouldThrowExceptionWhenLoginEmailNotFound() {
        LoginRequestDTO request = new LoginRequestDTO("inexistente@email.com", "123456");
        when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () -> authService.login(request));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
        assertEquals("E-mail ou senha inválidos.", exception.getMessage());
    }

    @Test
    @DisplayName("Deve lançar BusinessException (401) no login quando senha estiver incorreta")
    void shouldThrowExceptionWhenLoginPasswordIsInvalid() {
        LoginRequestDTO request = new LoginRequestDTO("murilo@email.com", "senhaErrada");
        UserEntity user = new UserEntity("Murilo", "murilo@email.com", "hashedPassword", "USER");

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.password(), user.getPassword())).thenReturn(false);

        BusinessException exception = assertThrows(BusinessException.class, () -> authService.login(request));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
        verify(tokenService, never()).generateToken(any());
    }
}
