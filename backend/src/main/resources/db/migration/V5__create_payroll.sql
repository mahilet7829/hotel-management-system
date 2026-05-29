-- ============================================
-- V5: CREATE PAYROLL TABLES
-- ============================================

-- Salary configurations
CREATE TABLE salary_configs (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL,
    base_salary DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ETB',
    pay_period VARCHAR(20) DEFAULT 'MONTHLY',
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_salary_configs_role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT chk_pay_period CHECK (pay_period IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY'))
);

-- Bonus rules
CREATE TABLE bonus_rules (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    metric VARCHAR(50) NOT NULL,
    threshold DECIMAL(10,2) NOT NULL,
    bonus_amount DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT fk_bonus_rules_role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT chk_bonus_metric CHECK (metric IN ('ROOMS_CLEANED', 'ORDERS_SERVED', 'AVG_SPEED', 'ORDERS_COUNT'))
);

-- Payroll records
CREATE TABLE payroll_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    base_salary DECIMAL(10,2) NOT NULL,
    bonus_amount DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    net_pay DECIMAL(10,2) NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    performance_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'DRAFT',
    generated_at TIMESTAMP DEFAULT NOW(),
    approved_by BIGINT,
    notes TEXT,
    CONSTRAINT fk_payroll_records_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_payroll_records_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_payroll_status CHECK (status IN ('DRAFT', 'APPROVED', 'PAID'))
);

-- Create indexes
CREATE INDEX idx_salary_configs_role_id ON salary_configs(role_id);
CREATE INDEX idx_bonus_rules_role_id ON bonus_rules(role_id);
CREATE INDEX idx_payroll_records_user_id ON payroll_records(user_id);
CREATE INDEX idx_payroll_records_status ON payroll_records(status);
CREATE INDEX idx_payroll_records_period ON payroll_records(period_start, period_end);