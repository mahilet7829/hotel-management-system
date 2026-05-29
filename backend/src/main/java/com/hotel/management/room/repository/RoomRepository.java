package com.hotel.management.room.repository;

import com.hotel.management.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomNumber(String roomNumber);
    List<Room> findByStatus(String status);
    List<Room> findByFloor(Integer floor);
    List<Room> findByRoomType(String roomType);
    Long countByStatus(String status);
}