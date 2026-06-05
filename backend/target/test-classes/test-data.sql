-- Clean up before each test
DELETE FROM user_roles;
DELETE FROM users WHERE email != 'admin@hotel.com';

-- Make sure admin user exists with correct password (Admin@1234 encoded with BCrypt)
INSERT INTO users (id, first_name, last_name, email, password, phone, is_active, created_at, updated_at)
VALUES (
  1, 'System', 'Admin', 'admin@hotel.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  '+251000000000', true, NOW(), NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Ensure ROLE_ADMIN exists and is assigned
INSERT INTO roles (id, name) VALUES (1, 'ROLE_ADMIN') ON CONFLICT DO NOTHING;
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'admin@hotel.com' AND r.name = 'ROLE_ADMIN'
ON CONFLICT DO NOTHING;