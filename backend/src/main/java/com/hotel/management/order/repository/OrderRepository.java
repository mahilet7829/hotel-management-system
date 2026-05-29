package com.hotel.management.order.repository;

import com.hotel.management.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByStatus(String status);
    List<Order> findByWaiterId(Long waiterId);
    List<Order> findByChefId(Long chefId);
    List<Order> findByRoomId(Long roomId);
    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    Long countByStatus(String status);
    Long countByWaiterIdAndStatus(Long waiterId, String status);
    Long countByChefIdAndStatus(Long chefId, String status);
}