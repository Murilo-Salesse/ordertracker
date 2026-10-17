package com.foodydeliverytest.ordertracker.services;

import com.foodydeliverytest.ordertracker.dto.requests.CreateOrderRequestDTO;
import com.foodydeliverytest.ordertracker.dto.requests.UpdateOrderStatusRequestDTO;
import com.foodydeliverytest.ordertracker.dto.responses.OrderResponseDTO;
import com.foodydeliverytest.ordertracker.entity.OrderEntity;
import com.foodydeliverytest.ordertracker.entity.UserEntity;
import com.foodydeliverytest.ordertracker.entity.enums.OrderStatus;
import com.foodydeliverytest.ordertracker.exception.BusinessException;
import com.foodydeliverytest.ordertracker.exception.ResourceNotFoundException;
import com.foodydeliverytest.ordertracker.repository.OrderRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional
    public OrderResponseDTO createOrder(CreateOrderRequestDTO request) {
        UserEntity currentUser = getAuthenticatedUser();
        OrderEntity order = request.toEntity();
        order.setUser(currentUser);
        OrderEntity savedOrder = orderRepository.save(order);

        return OrderResponseDTO.toResponse(savedOrder);
    }

    @Transactional
    public List<OrderResponseDTO> listAllOrders() {
        UserEntity currentUser = getAuthenticatedUser();
        return orderRepository.findAllByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(OrderResponseDTO::toResponse)
                .toList();
    }

    @Transactional
    public OrderResponseDTO getOrderById(Integer id) {
        OrderEntity order = findOrderOrThrow(id);

        return OrderResponseDTO.toResponse(order);
    }

    @Transactional
    public OrderResponseDTO updateOrderStatus(Integer id, UpdateOrderStatusRequestDTO request) {
        OrderEntity order = findOrderOrThrow(id);

        if (order.getStatus() == OrderStatus.ENTREGUE || order.getStatus() == OrderStatus.CANCELADO) {
            throw new BusinessException("Não é possível alterar o status de um pedido que já foi " + order.getStatus().getDescription().toLowerCase() + ".");
        }

        order.setStatus(request.status());
        OrderEntity updatedOrder = orderRepository.save(order);

        return OrderResponseDTO.toResponse(updatedOrder);
    }

    private OrderEntity findOrderOrThrow(Integer id) {
        UserEntity currentUser = getAuthenticatedUser();
        return orderRepository.findWithItemsByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado com o ID: " + id));
    }

    private UserEntity getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserEntity user) {
            return user;
        }
        throw new BusinessException("Usuário não autenticado.", HttpStatus.UNAUTHORIZED);
    }

}
