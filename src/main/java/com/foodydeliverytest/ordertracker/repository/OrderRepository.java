package com.foodydeliverytest.ordertracker.repository;

import com.foodydeliverytest.ordertracker.entity.OrderEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Integer> {

    @EntityGraph(attributePaths = "items")
    List<OrderEntity> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = "items")
    Optional<OrderEntity> findWithItemsById(Integer id);
}
