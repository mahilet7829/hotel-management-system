-- ============================================
-- V4: CREATE CLEANING LOGS TABLE
-- ============================================

CREATE TABLE cleaning_logs (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,
    cleaner_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ASSIGNED',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    assigned_at TIMESTAMP DEFAULT NOW(),
    duration_minutes INTEGER,
    notes TEXT,
    supervisor_id BIGINT,
    CONSTRAINT fk_cleaning_logs_room_id FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_cleaning_logs_cleaner_id FOREIGN KEY (cleaner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_cleaning_logs_supervisor_id FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_cleaning_status CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'))
);

-- Create indexes
CREATE INDEX idx_cleaning_logs_room_id ON cleaning_logs(room_id);
CREATE INDEX idx_cleaning_logs_cleaner_id ON cleaning_logs(cleaner_id);
CREATE INDEX idx_cleaning_logs_status ON cleaning_logs(status);
CREATE INDEX idx_cleaning_logs_assigned_at ON cleaning_logs(assigned_at);