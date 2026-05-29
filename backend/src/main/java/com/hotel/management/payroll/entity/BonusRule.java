package com.hotel.management.payroll.entity;

import com.hotel.management.user.entity.Role;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "bonus_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BonusRule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
    
    @Column(name = "rule_name", nullable = false, length = 100)
    private String ruleName;
    
    @Column(name = "metric", nullable = false, length = 50)
    private String metric;
    
    @Column(name = "threshold", nullable = false, precision = 10, scale = 2)
    private BigDecimal threshold;
    
    @Column(name = "bonus_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal bonusAmount;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
}