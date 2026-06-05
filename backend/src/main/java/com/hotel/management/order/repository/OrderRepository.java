package com.hotel.management.order.repository;

import com.hotel.management.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByWaiterId(Long waiterId, Pageable pageable);
    Page<Order> findByChefId(Long chefId, Pageable pageable);
    Page<Order> findByStatus(String status, Pageable pageable);
    List<Order> findByStatusIn(List<String> statuses);
    Optional<Order> findByOrderNumber(String orderNumber);
}