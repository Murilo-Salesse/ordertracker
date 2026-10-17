package com.foodydeliverytest.ordertracker.controller;

import com.foodydeliverytest.ordertracker.dto.requests.CreateOrderRequestDTO;
import com.foodydeliverytest.ordertracker.dto.requests.UpdateOrderStatusRequestDTO;
import com.foodydeliverytest.ordertracker.dto.responses.ApiResponse;
import com.foodydeliverytest.ordertracker.dto.responses.OrderResponseDTO;
import com.foodydeliverytest.ordertracker.services.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponseDTO>> createOrder(@Valid @RequestBody CreateOrderRequestDTO request) {
        OrderResponseDTO response = orderService.createOrder(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Pedido criado com sucesso!", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> listAllOrders() {
        List<OrderResponseDTO> orders = orderService.listAllOrders();

        return ResponseEntity.ok(ApiResponse.success("Pedidos listados com sucesso!", orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrderById(@PathVariable Integer id) {
        OrderResponseDTO order = orderService.getOrderById(id);

        return ResponseEntity.ok(ApiResponse.success("Pedido encontrado com sucesso!", order));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> updateOrderStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateOrderStatusRequestDTO request) {

        OrderResponseDTO updatedOrder = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Status do pedido atualizado com sucesso!", updatedOrder));
    }
}
