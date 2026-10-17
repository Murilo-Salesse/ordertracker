package com.foodydeliverytest.ordertracker.controller;

import com.foodydeliverytest.ordertracker.dto.requests.LoginRequestDTO;
import com.foodydeliverytest.ordertracker.dto.requests.RegisterRequestDTO;
import com.foodydeliverytest.ordertracker.dto.responses.AuthResponseDTO;
import com.foodydeliverytest.ordertracker.exception.BusinessException;
import com.foodydeliverytest.ordertracker.exception.GlobalExceptionHandler;
import com.foodydeliverytest.ordertracker.services.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/auth/register - Deve retornar 201 Created ao cadastrar usuário válido")
    void shouldRegisterUserAndReturn201() throws Exception {
        AuthResponseDTO responseDTO = new AuthResponseDTO("jwt-token", "Murilo", "murilo@email.com");
        when(authService.register(any(RegisterRequestDTO.class))).thenReturn(responseDTO);

        String payload = """
                {
                  "name": "Murilo",
                  "email": "murilo@email.com",
                  "password": "123456"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Usuário cadastrado com sucesso!"))
                .andExpect(jsonPath("$.data.token").value("jwt-token"))
                .andExpect(jsonPath("$.data.name").value("Murilo"));
    }

    @Test
    @DisplayName("POST /api/auth/register - Deve retornar 400 Bad Request quando dados forem inválidos")
    void shouldReturn400WhenRegisterRequestIsInvalid() throws Exception {
        String invalidPayload = """
                {
                  "name": "",
                  "email": "email-invalido",
                  "password": "123"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Erro de Validação de Dados"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Deve retornar 200 OK ao autenticar com sucesso")
    void shouldLoginAndReturn200() throws Exception {
        AuthResponseDTO responseDTO = new AuthResponseDTO("jwt-token", "Murilo", "murilo@email.com");
        when(authService.login(any(LoginRequestDTO.class))).thenReturn(responseDTO);

        String payload = """
                {
                  "email": "murilo@email.com",
                  "password": "123456"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login realizado com sucesso!"))
                .andExpect(jsonPath("$.data.token").value("jwt-token"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Deve retornar 401 Unauthorized quando credenciais forem inválidas")
    void shouldReturn401WhenCredentialsAreInvalid() throws Exception {
        when(authService.login(any(LoginRequestDTO.class)))
                .thenThrow(new BusinessException("E-mail ou senha inválidos.", HttpStatus.UNAUTHORIZED));

        String payload = """
                {
                  "email": "murilo@email.com",
                  "password": "errada"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("Violação de Regra de Negócio"))
                .andExpect(jsonPath("$.detail").value("E-mail ou senha inválidos."));
    }
}
