package com.hotel.management.room.repository;

import com.hotel.management.room.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Page<Room> findByStatus(String status, Pageable pageable);
    Page<Room> findByFloor(Integer floor, Pageable pageable);
    Page<Room> findByStatusAndFloor(String status, Integer floor, Pageable pageable);
    List<Room> findByStatus(String status);
    List<Room> findByFloor(Integer floor);
    Optional<Room> findByRoomNumber(String roomNumber);
    boolean existsByRoomNumber(String roomNumber);
    long countByStatus(String status);
}