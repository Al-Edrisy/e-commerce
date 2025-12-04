package com.ecommerce.order.infrastructure.persistence.jpa;

import com.ecommerce.order.infrastructure.persistence.entity.OrderJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA repository for Order persistence.
 * This is a Spring Data JPA interface.
 */
@Repository
public interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, Long> {

    List<OrderJpaEntity> findByUserUid(String userUid);

    List<OrderJpaEntity> findByStatus(OrderJpaEntity.OrderStatus status);
}
