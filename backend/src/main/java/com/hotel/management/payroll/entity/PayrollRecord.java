package com.hotel.management.payroll.entity;

import com.hotel.management.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;
    
    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;
    
    @Column(name = "base_salary", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseSalary;
    
    @Column(name = "bonus_amount", precision = 10, scale = 2)
    private BigDecimal bonusAmount;
    
    @Column(name = "deductions", precision = 10, scale = 2)
    private BigDecimal deductions;
    
    @Column(name = "net_pay", nullable = false, precision = 10, scale = 2)
    private BigDecimal netPay;
    
    @Column(name = "tasks_completed")
    private Integer tasksCompleted;
    
    @Column(name = "performance_score", precision = 5, scale = 2)
    private BigDecimal performanceScore;
    
    @Column(name = "status", length = 20)
    private String status;
    
    @Column(name = "generated_at")
    private LocalDateTime generatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }
}