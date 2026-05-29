-- ============================================
-- V2: CREATE ROOMS TABLE
-- ============================================

CREATE TABLE rooms (
    id BIGSERIAL PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    floor INTEGER,
    room_type VARCHAR(50) NOT NULL DEFAULT 'SINGLE',
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    qr_code_path VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_room_type CHECK (room_type IN ('SINGLE', 'DOUBLE', 'SUITE', 'DELUXE')),
    CONSTRAINT chk_room_status CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'OUT_OF_ORDER'))
);

-- Create indexes
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_room_number ON rooms(room_number);
CREATE INDEX idx_rooms_floor ON rooms(floor);