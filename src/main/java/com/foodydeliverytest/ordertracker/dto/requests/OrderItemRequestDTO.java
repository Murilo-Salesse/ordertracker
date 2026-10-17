package com.foodydeliverytest.ordertracker.dto.requests;

import com.foodydeliverytest.ordertracker.entity.OrderItemEntity;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record OrderItemRequestDTO(@NotBlank(message = "O nome do item é obrigatório")
                                  @Size(max = 120, message = "O nome do item deve ter no máximo 120 caracteres")
                                  String name,

                                  @NotNull(message = "A quantidade é obrigatória")
                                  @Min(value = 1, message = "A quantidade deve ser de no mínimo 1")
                                  Integer quantity,

                                  @NotNull(message = "O preço unitário é obrigatório")
                                  @DecimalMin(value = "0.01", message = "O preço unitário deve ser maior que zero")
                                  BigDecimal unitPrice) {

    public OrderItemEntity toEntity() {
        return new OrderItemEntity(this.name, this.quantity, this.unitPrice);
    }
}
