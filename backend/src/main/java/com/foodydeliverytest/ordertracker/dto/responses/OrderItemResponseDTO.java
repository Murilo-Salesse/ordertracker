package com.foodydeliverytest.ordertracker.dto.responses;

import com.foodydeliverytest.ordertracker.entity.OrderItemEntity;

import java.math.BigDecimal;

public record OrderItemResponseDTO(Integer id,
                                   String name,
                                   Integer quantity,
                                   BigDecimal unitPrice,
                                   BigDecimal subtotal) {

    public static OrderItemResponseDTO toResponse(OrderItemEntity item) {
        BigDecimal subtotal = item.getUnitPrice()
                .multiply(BigDecimal.valueOf(item.getQuantity()));

        return new OrderItemResponseDTO(
                item.getId(),
                item.getName(),
                item.getQuantity(),
                item.getUnitPrice(),
                subtotal
        );
    }
}
