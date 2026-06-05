package com.hotel.management.auth.service;

import com.hotel.management.auth.dto.AuthResponse;
import com.hotel.management.auth.dto.ChangePasswordRequest;
import com.hotel.management.auth.dto.LoginRequest;
import com.hotel.management.auth.dto.RegisterRequest;
import com.hotel.management.auth.security.JwtUtils;
import com.hotel.management.common.exception.ResourceNotFoundException;
import com.hotel.management.common.exception.ValidationException;
import com.hotel.management.user.entity.Role;
import com.hotel.management.user.entity.User;
import com.hotel.management.user.repository.RoleRepository;
import com.hotel.management.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private Role testRole;
    private LoginRequest loginRequest;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        testRole = new Role();
        testRole.setId(1L);
        testRole.setName("ROLE_ADMIN");

        testUser = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john@hotel.com")
                .password("encodedPassword")
                .isActive(true)
                .build();
        testUser.setRoles(Set.of(testRole));

        loginRequest = LoginRequest.builder()
                .email("john@hotel.com")
                .password("password123")
                .build();

        registerRequest = RegisterRequest.builder()
                .firstName("Jane")
                .lastName("Smith")
                .email("jane@hotel.com")
                .password("Password1")
                .phone("1234567890")
                .build();
    }

    @Test
    void test_login_success() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(testUser);
        when(jwtUtils.generateToken(authentication)).thenReturn("mock-token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mock-token", response.getToken());
        assertEquals("john@hotel.com", response.getEmail());
        assertEquals("John", response.getFirstName());
        assertEquals("Doe", response.getLastName());
        assertTrue(response.getRoles().contains("ROLE_ADMIN"));
        assertEquals(86400000L, response.getExpiresIn());

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils).generateToken(authentication);
    }

    @Test
    void test_login_inactive_account() {
        testUser.setIsActive(false);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(testUser);

        ValidationException exception = assertThrows(ValidationException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("Account is deactivated. Contact admin.", exception.getMessage());
    }

    @Test
    void test_register_duplicate_email() {
        when(userRepository.existsByEmail("jane@hotel.com")).thenReturn(true);

        ValidationException exception = assertThrows(ValidationException.class, () -> {
            authService.register(registerRequest);
        });

        assertTrue(exception.getMessage().contains("Email already in use"));
        verify(userRepository).existsByEmail("jane@hotel.com");
    }

    @Test
    void test_register_invalid_role() {
        registerRequest.setRoles(Set.of("ROLE_NONEXISTENT"));

        when(userRepository.existsByEmail("jane@hotel.com")).thenReturn(false);
        when(roleRepository.findByName("ROLE_NONEXISTENT")).thenReturn(Optional.empty());

        ValidationException exception = assertThrows(ValidationException.class, () -> {
            authService.register(registerRequest);
        });

        assertTrue(exception.getMessage().contains("Role not found"));
    }

    @Test
    void test_register_success_with_default_role() {
        when(userRepository.existsByEmail("jane@hotel.com")).thenReturn(false);
        when(roleRepository.findByName("ROLE_WAITER")).thenReturn(Optional.of(testRole));
        when(passwordEncoder.encode("Password1")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        var result = authService.register(registerRequest);

        assertNotNull(result);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void test_changePassword_wrong_current() {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("wrongPassword")
                .newPassword("NewPass1")
                .confirmPassword("NewPass1")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        ValidationException exception = assertThrows(ValidationException.class, () -> {
            authService.changePassword(1L, request);
        });

        assertEquals("Current password is incorrect", exception.getMessage());
    }

    @Test
    void test_changePassword_success() {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("oldPassword")
                .newPassword("NewPass1")
                .confirmPassword("NewPass1")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("oldPassword", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("NewPass1")).thenReturn("new-encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        authService.changePassword(1L, request);

        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode("NewPass1");
    }
}