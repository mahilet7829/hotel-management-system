-- ============================================
-- V6: CREATE SERVICE REQUESTS TABLE
-- ============================================

CREATE TABLE service_requests (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,
    requested_by BIGINT,
    guest_name VARCHAR(100),
    request_type VARCHAR(50) NOT NULL DEFAULT 'OTHER',
    description TEXT,
    priority VARCHAR(20) DEFAULT 'NORMAL',
    status VARCHAR(30) DEFAULT 'OPEN',
    assigned_to BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    notes TEXT,
    CONSTRAINT fk_service_requests_room_id FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_service_requests_requested_by FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_service_requests_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_request_type CHECK (request_type IN ('HOUSEKEEPING', 'MAINTENANCE', 'EXTRA_TOWELS', 'WAKE_UP_CALL', 'OTHER')),
    CONSTRAINT chk_priority CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    CONSTRAINT chk_service_status CHECK (status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'))
);

-- Create indexes
CREATE INDEX idx_service_requests_room_id ON service_requests(room_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_assigned_to ON service_requests(assigned_to);
CREATE INDEX idx_service_requests_priority ON service_requests(priority);