package com.hotel.management.notification.service;

import com.hotel.management.common.exception.ResourceNotFoundException;
import com.hotel.management.common.exception.ValidationException;
import com.hotel.management.notification.dto.NotificationDTO;
import com.hotel.management.notification.entity.Notification;
import com.hotel.management.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    public NotificationDTO createNotification(Long recipientId, String title, String message, 
                                               String type, String relatedEntityType, Long relatedEntityId) {
        Notification notification = Notification.builder()
            .recipientId(recipientId)
            .title(title)
            .message(message)
            .type(type)
            .isRead(false)
            .relatedEntityType(relatedEntityType)
            .relatedEntityId(relatedEntityId)
            .build();
        
        Notification saved = notificationRepository.save(notification);
        NotificationDTO dto = mapToDTO(saved);
        
        messagingTemplate.convertAndSendToUser(
            recipientId.toString(),
            "/queue/notifications",
            dto
        );
        
        log.info("Notification created and sent: recipient={}, type={}", recipientId, type);
        return dto;
    }
    
    public Page<NotificationDTO> getMyNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> notifications = notificationRepository.findByRecipientId(userId, pageable);
        return notifications.map(this::mapToDTO);
    }
    
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsRead(userId, false);
    }
    
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        
        if (!notification.getRecipientId().equals(userId)) {
            throw new ValidationException("You can only mark your own notifications as read");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
    
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }
    
    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
            .id(notification.getId())
            .recipientId(notification.getRecipientId())
            .title(notification.getTitle())
            .message(notification.getMessage())
            .type(notification.getType())
            .isRead(notification.getIsRead())
            .createdAt(notification.getCreatedAt())
            .relatedEntityType(notification.getRelatedEntityType())
            .relatedEntityId(notification.getRelatedEntityId())
            .build();
    }
}
