package com.foodydeliverytest.ordertracker.services;

import com.foodydeliverytest.ordertracker.dto.requests.CreateOrderRequestDTO;
import com.foodydeliverytest.ordertracker.dto.requests.OrderItemRequestDTO;
import com.foodydeliverytest.ordertracker.dto.requests.UpdateOrderStatusRequestDTO;
import com.foodydeliverytest.ordertracker.dto.responses.OrderResponseDTO;
import com.foodydeliverytest.ordertracker.entity.OrderEntity;
import com.foodydeliverytest.ordertracker.entity.enums.OrderStatus;
import com.foodydeliverytest.ordertracker.exception.BusinessException;
import com.foodydeliverytest.ordertracker.exception.ResourceNotFoundException;
import com.foodydeliverytest.ordertracker.repository.OrderRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    @DisplayName("Deve criar um pedido com status RECEBIDO e calcular o valor total corretamente")
    void shouldCreateOrderSuccessfully() {
        List<OrderItemRequestDTO> items = List.of(
                new OrderItemRequestDTO("Hambúrguer", 2, new BigDecimal("30.00")),
                new OrderItemRequestDTO("Refrigerante", 1, new BigDecimal("8.50"))
        );
        CreateOrderRequestDTO request = new CreateOrderRequestDTO(
                "João Silva",
                "Rua das Flores, 123",
                items
        );

        when(orderRepository.save(any(OrderEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponseDTO response = orderService.createOrder(request);

        assertNotNull(response);
        assertEquals("João Silva", response.customerName());
        assertEquals("Rua das Flores, 123", response.deliveryAddress());
        assertEquals(OrderStatus.RECEBIDO, response.status());
        assertEquals("Recebido", response.statusDescription());
        assertEquals(2, response.items().size());
        assertEquals(new BigDecimal("68.50"), response.totalAmount());
        verify(orderRepository, times(1)).save(any(OrderEntity.class));
    }

    @Test
    @DisplayName("Deve listar todos os pedidos ordenados por data de criação")
    void shouldListAllOrders() {
        OrderEntity order = new OrderEntity("Maria", "Av. Brasil, 500");
        when(orderRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(order));

        List<OrderResponseDTO> result = orderService.listAllOrders();

        assertEquals(1, result.size());
        assertEquals("Maria", result.get(0).customerName());
    }

    @Test
    @DisplayName("Deve buscar pedido por ID com sucesso")
    void shouldGetOrderByIdSuccessfully() {
        OrderEntity order = new OrderEntity("Carlos", "Rua A, 10");
        when(orderRepository.findWithItemsById(1)).thenReturn(Optional.of(order));

        OrderResponseDTO response = orderService.getOrderById(1);

        assertNotNull(response);
        assertEquals("Carlos", response.customerName());
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException quando pedido não existir")
    void shouldThrowResourceNotFoundWhenOrderDoesNotExist() {
        when(orderRepository.findWithItemsById(99)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.getOrderById(99));
    }

    @Test
    @DisplayName("Deve atualizar o status do pedido com sucesso")
    void shouldUpdateOrderStatusSuccessfully() {
        OrderEntity order = new OrderEntity("Ana", "Rua B, 20");
        UpdateOrderStatusRequestDTO request = new UpdateOrderStatusRequestDTO(OrderStatus.EM_PREPARO);

        when(orderRepository.findWithItemsById(1)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(OrderEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponseDTO response = orderService.updateOrderStatus(1, request);

        assertEquals(OrderStatus.EM_PREPARO, response.status());
        assertEquals("Em preparo", response.statusDescription());
    }

    @Test
    @DisplayName("Não deve permitir alterar status de pedido já ENTREGUE")
    void shouldNotUpdateStatusWhenOrderIsAlreadyDelivered() {
        OrderEntity order = new OrderEntity("Ana", "Rua B, 20");
        order.setStatus(OrderStatus.ENTREGUE);
        UpdateOrderStatusRequestDTO request = new UpdateOrderStatusRequestDTO(OrderStatus.CANCELADO);

        when(orderRepository.findWithItemsById(1)).thenReturn(Optional.of(order));

        BusinessException ex = assertThrows(BusinessException.class, () -> orderService.updateOrderStatus(1, request));

        assertTrue(ex.getMessage().contains("entregue"));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Não deve permitir alterar status de pedido já CANCELADO")
    void shouldNotUpdateStatusWhenOrderIsAlreadyCancelled() {
        OrderEntity order = new OrderEntity("Ana", "Rua B, 20");
        order.setStatus(OrderStatus.CANCELADO);
        UpdateOrderStatusRequestDTO request = new UpdateOrderStatusRequestDTO(OrderStatus.EM_PREPARO);

        when(orderRepository.findWithItemsById(1)).thenReturn(Optional.of(order));

        BusinessException ex = assertThrows(BusinessException.class, () -> orderService.updateOrderStatus(1, request));

        assertTrue(ex.getMessage().contains("cancelado"));
        verify(orderRepository, never()).save(any());
    }
}
