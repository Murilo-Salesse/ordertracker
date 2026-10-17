package com.foodydeliverytest.ordertracker.dto.requests;

import com.foodydeliverytest.ordertracker.entity.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequestDTO(@NotNull(message = "O novo status do pedido é obrigatório")
                                          OrderStatus status) {}
