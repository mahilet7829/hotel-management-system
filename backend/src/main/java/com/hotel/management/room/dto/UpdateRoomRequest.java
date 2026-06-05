package com.hotel.management.room.dto;

public class UpdateRoomRequest {
    private Integer floor;
    private String roomType;
    private String notes;

    public UpdateRoomRequest() {}

    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}