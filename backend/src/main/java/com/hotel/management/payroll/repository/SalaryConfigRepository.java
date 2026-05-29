package com.hotel.management.payroll.repository;

import com.hotel.management.payroll.entity.SalaryConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SalaryConfigRepository extends JpaRepository<SalaryConfig, Long> {
    Optional<SalaryConfig> findByRoleId(Long roleId);
}