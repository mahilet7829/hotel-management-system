package com.hotel.management.auth.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Transactional
@Sql(scripts = "/test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void test_login_success() throws Exception {
        String loginJson = """
            {
                "email": "admin@hotel.com",
                "password": "Admin@1234"
            }
            """;

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        JsonNode json = objectMapper.readTree(responseBody);

        assertTrue(json.get("success").asBoolean());
        assertNotNull(json.get("data").get("token").asText());
        assertNotNull(json.get("data").get("roles"));
        boolean hasAdmin = false;
        for (JsonNode role : json.get("data").get("roles")) {
            if (role.asText().equals("ROLE_ADMIN")) {
                hasAdmin = true;
                break;
            }
        }
        assertTrue(hasAdmin);
    }

    @Test
    void test_login_wrong_password() throws Exception {
        String loginJson = """
            {
                "email": "admin@hotel.com",
                "password": "WrongPassword"
            }
            """;

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isUnauthorized())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        JsonNode json = objectMapper.readTree(responseBody);

        assertFalse(json.get("success").asBoolean());
    }

    @Test
    void test_login_nonexistent_user() throws Exception {
        String loginJson = """
            {
                "email": "nobody@hotel.com",
                "password": "Test@1234"
            }
            """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void test_getMe_without_token() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void test_getMe_with_valid_token() throws Exception {
        String loginJson = """
            {
                "email": "admin@hotel.com",
                "password": "Admin@1234"
            }
            """;

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();

        String loginBody = loginResult.getResponse().getContentAsString();
        JsonNode loginJsonNode = objectMapper.readTree(loginBody);
        String token = loginJsonNode.get("data").get("token").asText();

        MvcResult result = mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        JsonNode json = objectMapper.readTree(responseBody);

        assertTrue(json.get("success").asBoolean());
        assertEquals("admin@hotel.com", json.get("data").get("email").asText());
    }

    @Test
    void test_getMe_with_invalid_token() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer invalid.jwt.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void test_register_without_admin_role() throws Exception {
        String registerJson = """
            {
                "firstName": "Test",
                "lastName": "User",
                "email": "test@hotel.com",
                "password": "TestPass1",
                "roles": ["ROLE_WAITER"]
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void test_register_as_admin() throws Exception {
        // First login as admin
        String loginJson = """
            {
                "email": "admin@hotel.com",
                "password": "Admin@1234"
            }
            """;

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();

        String loginBody = loginResult.getResponse().getContentAsString();
        JsonNode loginJsonNode = objectMapper.readTree(loginBody);
        String token = loginJsonNode.get("data").get("token").asText();

        // Register new user
        String registerJson = """
            {
                "firstName": "New",
                "lastName": "Staff",
                "email": "newstaff@hotel.com",
                "password": "StrongPass1",
                "roles": ["ROLE_WAITER"]
            }
            """;

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        JsonNode json = objectMapper.readTree(responseBody);

        assertTrue(json.get("success").asBoolean());
        assertEquals("newstaff@hotel.com", json.get("data").get("email").asText());
        assertEquals("New", json.get("data").get("firstName").asText());
    }

    @Test
    void test_change_password() throws Exception {
        // Login
        String loginJson = """
            {
                "email": "admin@hotel.com",
                "password": "Admin@1234"
            }
            """;

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();

        String loginBody = loginResult.getResponse().getContentAsString();
        JsonNode loginJsonNode = objectMapper.readTree(loginBody);
        String token = loginJsonNode.get("data").get("token").asText();

        // Change password
        String changePwdJson = """
            {
                "currentPassword": "Admin@1234",
                "newPassword": "NewAdmin@1234",
                "confirmPassword": "NewAdmin@1234"
            }
            """;

        MvcResult result = mockMvc.perform(put("/api/auth/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(changePwdJson))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        JsonNode json = objectMapper.readTree(responseBody);

        assertTrue(json.get("success").asBoolean());
        assertEquals("Password changed successfully", json.get("message").asText());
    }

    @Test
    void test_logout() throws Exception {
        String loginJson = """
            {
                "email": "admin@hotel.com",
                "password": "Admin@1234"
            }
            """;

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();

        String loginBody = loginResult.getResponse().getContentAsString();
        JsonNode loginJsonNode = objectMapper.readTree(loginBody);
        String token = loginJsonNode.get("data").get("token").asText();

        MvcResult result = mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        JsonNode json = objectMapper.readTree(responseBody);

        assertTrue(json.get("success").asBoolean());
        assertEquals("Logged out successfully", json.get("message").asText());
    }
}