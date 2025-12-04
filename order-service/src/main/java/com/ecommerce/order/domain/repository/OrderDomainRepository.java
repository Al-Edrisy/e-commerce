package com.ecommerce.order.domain.repository;

import com.ecommerce.order.domain.entity.OrderEntity;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Order domain entity.
 * This is a port in Clean Architecture - defines what the domain needs.
 */
public interface OrderDomainRepository {

    /**
     * Saves an order entity.
     * 
     * @param order the order to save
     * @return the saved order with generated ID
     */
    OrderEntity save(OrderEntity order);

    /**
     * Finds an order by its ID.
     * 
     * @param id the order ID
     * @return Optional containing the order if found
     */
    Optional<OrderEntity> findById(Long id);

    /**
     * Finds all orders for a specific user.
     * 
     * @param userUid the user unique identifier
     * @return list of orders belonging to the user
     */
    List<OrderEntity> findByUserUid(String userUid);

    /**
     * Finds all orders with a specific status.
     * 
     * @param status the order status
     * @return list of orders with the given status
     */
    List<OrderEntity> findByStatus(OrderEntity.OrderStatus status);

    /**
     * Retrieves all orders.
     * 
     * @return list of all orders
     */
    List<OrderEntity> findAll();

    /**
     * Deletes an order by its ID.
     * 
     * @param id the order ID to delete
     */
    void deleteById(Long id);

    /**
     * Checks if an order exists by ID.
     * 
     * @param id the order ID
     * @return true if order exists, false otherwise
     */
    boolean existsById(Long id);
}
