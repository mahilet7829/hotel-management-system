package com.hotel.management.order.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateOrderStatusRequest {
    
    @NotBlank(message = "Status is required")
    private String status;
    
    private Long chefId;

    public UpdateOrderStatusRequest() {
    }

    public UpdateOrderStatusRequest(String status, Long chefId) {
        this.status = status;
        this.chefId = chefId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getChefId() {
        return chefId;
    }

    public void setChefId(Long chefId) {
        this.chefId = chefId;
    }
}