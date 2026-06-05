package com.hotel.management.room.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateRoomStatusRequest {
    @NotBlank(message = "Status is required")
    private String status;
    private String notes;

    public UpdateRoomStatusRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}