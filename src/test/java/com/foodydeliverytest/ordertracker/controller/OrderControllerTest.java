package com.foodydeliverytest.ordertracker.controller;

import com.foodydeliverytest.ordertracker.dto.requests.CreateOrderRequestDTO;
import com.foodydeliverytest.ordertracker.dto.requests.UpdateOrderStatusRequestDTO;
import com.foodydeliverytest.ordertracker.dto.responses.OrderItemResponseDTO;
import com.foodydeliverytest.ordertracker.dto.responses.OrderResponseDTO;
import com.foodydeliverytest.ordertracker.entity.enums.OrderStatus;
import com.foodydeliverytest.ordertracker.exception.GlobalExceptionHandler;
import com.foodydeliverytest.ordertracker.exception.ResourceNotFoundException;
import com.foodydeliverytest.ordertracker.services.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    private MockMvc mockMvc;

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderController orderController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(orderController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private OrderResponseDTO sampleOrderResponse(OrderStatus status) {
        return new OrderResponseDTO(
                1,
                "João Silva",
                "Av. Paulista, 1000",
                status,
                status.getDescription(),
                List.of(new OrderItemResponseDTO(1, "Pizza", 1, new BigDecimal("50.00"), new BigDecimal("50.00"))),
                new BigDecimal("50.00"),
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("POST /api/orders - Deve retornar 201 Created ao criar pedido válido")
    void shouldCreateOrderAndReturn201() throws Exception {
        when(orderService.createOrder(any(CreateOrderRequestDTO.class)))
                .thenReturn(sampleOrderResponse(OrderStatus.RECEBIDO));

        String payload = """
                {
                  "customerName": "João Silva",
                  "deliveryAddress": "Av. Paulista, 1000",
                  "items": [
                    {
                      "name": "Pizza",
                      "quantity": 1,
                      "unitPrice": 50.00
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Pedido criado com sucesso!"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.status").value("RECEBIDO"));
    }

    @Test
    @DisplayName("GET /api/orders - Deve retornar 200 OK com a lista de pedidos")
    void shouldListAllOrdersAndReturn200() throws Exception {
        when(orderService.listAllOrders()).thenReturn(List.of(sampleOrderResponse(OrderStatus.RECEBIDO)));

        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].customerName").value("João Silva"));
    }

    @Test
    @DisplayName("GET /api/orders/{id} - Deve retornar 200 OK quando pedido existir")
    void shouldGetOrderByIdAndReturn200() throws Exception {
        when(orderService.getOrderById(1)).thenReturn(sampleOrderResponse(OrderStatus.RECEBIDO));

        mockMvc.perform(get("/api/orders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @DisplayName("GET /api/orders/{id} - Deve retornar 404 Not Found quando pedido não existir")
    void shouldReturn404WhenOrderDoesNotExist() throws Exception {
        when(orderService.getOrderById(99)).thenThrow(new ResourceNotFoundException("Pedido não encontrado com o ID: 99"));

        mockMvc.perform(get("/api/orders/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Recurso Não Encontrado"));
    }

    @Test
    @DisplayName("PATCH /api/orders/{id}/status - Deve atualizar status e retornar 200 OK")
    void shouldUpdateOrderStatusAndReturn200() throws Exception {
        when(orderService.updateOrderStatus(eq(1), any(UpdateOrderStatusRequestDTO.class)))
                .thenReturn(sampleOrderResponse(OrderStatus.EM_PREPARO));

        String payload = """
                {
                  "status": "EM_PREPARO"
                }
                """;

        mockMvc.perform(patch("/api/orders/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("EM_PREPARO"))
                .andExpect(jsonPath("$.data.statusDescription").value("Em preparo"));
    }

    @Test
    @DisplayName("PATCH /api/orders/{id}/status - Deve retornar 400 Bad Request para status inválido no JSON")
    void shouldReturn400WhenStatusEnumIsInvalid() throws Exception {
        String invalidEnumPayload = """
                {
                  "status": "STATUS_INEXISTENTE"
                }
                """;

        mockMvc.perform(patch("/api/orders/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidEnumPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Erro de Leitura da Requisição"));
    }

    @Test
    @DisplayName("GET /api/orders/{id} - Deve retornar 400 Bad Request quando ID na URL não for numérico")
    void shouldReturn400WhenPathVariableIdIsNotNumeric() throws Exception {
        mockMvc.perform(get("/api/orders/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Parâmetro de URL Inválido"));
    }

    @Test
    @DisplayName("PUT /api/orders/{id}/status - Deve retornar 405 Method Not Allowed para verbo HTTP incorreto")
    void shouldReturn405WhenHttpMethodIsNotSupported() throws Exception {
        mockMvc.perform(put("/api/orders/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"EM_PREPARO\"}"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.title").value("Método Não Permitido"));
    }
}
