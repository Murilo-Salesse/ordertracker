package com.foodydeliverytest.ordertracker.dto.responses;

import com.foodydeliverytest.ordertracker.entity.OrderEntity;
import com.foodydeliverytest.ordertracker.entity.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponseDTO(Integer id,
                               String customerName,
                               String deliveryAddress,
                               OrderStatus status,
                               String statusDescription,
                               List<OrderItemResponseDTO> items,
                               BigDecimal totalAmount,
                               LocalDateTime createdAt,
                               LocalDateTime updatedAt) {

    public static OrderResponseDTO toResponse(OrderEntity order) {
        List<OrderItemResponseDTO> itemResponses = order.getItems().stream()
                .map(OrderItemResponseDTO::toResponse)
                .toList();

        BigDecimal totalAmount = itemResponses.stream()
                .map(OrderItemResponseDTO::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OrderResponseDTO(
                order.getId(),
                order.getCustomerName(),
                order.getDeliveryAddress(),
                order.getStatus(),
                order.getStatus().getDescription(),
                itemResponses,
                totalAmount,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
