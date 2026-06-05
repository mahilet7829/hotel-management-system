package com.hotel.management.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public class CreateOrderRequest {
    private Long roomId;
    
    @Size(max = 20)
    private String tableNumber;
    
    private String notes;
    
    @NotEmpty(message = "At least one order item is required")
    @Valid
    private List<CreateOrderItemRequest> items;
    
    @AssertTrue(message = "Either roomId or tableNumber must be provided")
    public boolean isLocationProvided() {
        return roomId != null || (tableNumber != null && !tableNumber.isBlank());
    }

    public CreateOrderRequest() {}

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public String getTableNumber() { return tableNumber; }
    public void setTableNumber(String tableNumber) { this.tableNumber = tableNumber; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<CreateOrderItemRequest> getItems() { return items; }
    public void setItems(List<CreateOrderItemRequest> items) { this.items = items; }
}