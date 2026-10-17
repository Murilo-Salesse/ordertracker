package com.foodydeliverytest.ordertracker.dto.requests;

import com.foodydeliverytest.ordertracker.entity.OrderEntity;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateOrderRequestDTO(@NotBlank(message = "O nome do cliente é obrigatório")
                                    @Size(min = 2, max = 100, message = "O nome do cliente deve ter entre 2 e 100 caracteres")
                                    String customerName,

                                    @NotBlank(message = "O endereço de entrega é obrigatório")
                                    @Size(min = 5, max = 255, message = "O endereço de entrega deve ter entre 5 e 255 caracteres")
                                    String deliveryAddress,

                                    @NotEmpty(message = "O pedido deve conter pelo menos um item")
                                    List<@Valid OrderItemRequestDTO> items
) {

    public OrderEntity toEntity() {
        OrderEntity order = new OrderEntity(this.customerName, this.deliveryAddress);
        this.items.forEach(itemDto -> order.addItem(itemDto.toEntity()));
        return order;
    }

}
