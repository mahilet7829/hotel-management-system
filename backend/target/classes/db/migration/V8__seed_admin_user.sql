INSERT INTO users (first_name, last_name, email, password, phone, is_active, created_at, updated_at)
VALUES (
    'System',
    'Admin',
    'admin@hotel.com',
    '$2a$10$eiMjKpHUSNJ/.cmLBP8X1Oxuu50fjDDrcklb2qL.WKUqIwJJcWBeG',
    '+251000000000',
    true,
    NOW(),
    NOW()
);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.email = 'admin@hotel.com' AND r.name = 'ROLE_ADMIN';