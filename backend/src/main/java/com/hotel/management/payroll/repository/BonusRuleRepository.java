package com.hotel.management.payroll.repository;

import com.hotel.management.payroll.entity.BonusRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BonusRuleRepository extends JpaRepository<BonusRule, Long> {
    List<BonusRule> findByRoleIdAndIsActiveTrue(Long roleId);
    List<BonusRule> findByMetric(String metric);
}