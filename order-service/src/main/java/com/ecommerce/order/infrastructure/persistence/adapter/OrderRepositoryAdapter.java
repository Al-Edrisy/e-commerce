package com.ecommerce.order.infrastructure.persistence.adapter;

import com.ecommerce.order.domain.entity.OrderEntity;
import com.ecommerce.order.domain.repository.OrderDomainRepository;
import com.ecommerce.order.infrastructure.persistence.jpa.OrderJpaRepository;
import com.ecommerce.order.infrastructure.persistence.mapper.OrderMapper;
import com.ecommerce.order.infrastructure.persistence.entity.OrderJpaEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Adapter that implements OrderDomainRepository using JPA.
 * This is the infrastructure layer implementation of the domain repository
 * port.
 */
@Component
public class OrderRepositoryAdapter implements OrderDomainRepository {

    private final OrderJpaRepository jpaRepository;
    private final OrderMapper orderMapper;

    public OrderRepositoryAdapter(OrderJpaRepository jpaRepository, OrderMapper orderMapper) {
        this.jpaRepository = jpaRepository;
        this.orderMapper = orderMapper;
    }

    @Override
    public OrderEntity save(OrderEntity orderEntity) {
        OrderJpaEntity jpaOrder = orderMapper.toJpaEntity(orderEntity);
        OrderJpaEntity savedOrder = jpaRepository.save(jpaOrder);
        return orderMapper.toDomainEntity(savedOrder);
    }

    @Override
    public Optional<OrderEntity> findById(Long id) {
        return jpaRepository.findById(id)
                .map(orderMapper::toDomainEntity);
    }

    @Override
    public List<OrderEntity> findByUserUid(String userUid) {
        return jpaRepository.findByUserUid(userUid).stream()
                .map(orderMapper::toDomainEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderEntity> findByStatus(OrderEntity.OrderStatus status) {
        OrderJpaEntity.OrderStatus jpaStatus = OrderJpaEntity.OrderStatus.valueOf(status.name());
        return jpaRepository.findByStatus(jpaStatus).stream()
                .map(orderMapper::toDomainEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderEntity> findAll() {
        return jpaRepository.findAll().stream()
                .map(orderMapper::toDomainEntity)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return jpaRepository.existsById(id);
    }
}
