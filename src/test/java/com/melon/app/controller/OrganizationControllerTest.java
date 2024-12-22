package com.melon.app.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.melon.app.controller.DTO.EventDTO;
import com.melon.app.entity.Organization;
import com.melon.app.entity.OrganizationMembership;
import com.melon.app.entity.Role;
import com.melon.app.entity.User;
import com.melon.app.entity.UpcomingEvent;
import com.melon.app.service.OrganizationService;

@SpringBootTest
@AutoConfigureMockMvc
public class OrganizationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrganizationService orgService;

    @Autowired
    private OrganizationController organizationController;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private Organization testOrg;
    private static final String BASE_URL = "/api/organizations";

    @BeforeEach
    void setUp() {
        // Set up test user

        testUser = new User(1L, "testusser", "test@example.com");

        // Set up test organization
        testOrg = new Organization(1L, "Test Org");
        testOrg.addUser(testUser, Role.OWNER);

        // Set up security context
        UsernamePasswordAuthenticationToken authentication = 
            new UsernamePasswordAuthenticationToken(testUser, null);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Set up MockMvc
        mockMvc = MockMvcBuilders
            .standaloneSetup(organizationController)
            .build();
    }

    @Test
    void joinOrganization_ValidId_ReturnsSuccess() throws Exception {
        // Arrange
        String orgId = "1";
        when(orgService.joinOrganization(any(User.class), anyString())).thenReturn(true);

        // Act & Assert
        mockMvc.perform(post(BASE_URL + "/{orgId}/members", orgId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Organization joined successfully"));
    }

    @Test
    void joinOrganization_InvalidId_ReturnsBadRequest() throws Exception {
        // Arrange
        String invalidOrgId = "invalid";

        // Act & Assert
        mockMvc.perform(post(BASE_URL + "/{orgId}/members", invalidOrgId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid organization ID format"));
    }

    @Test
    void removeMember_ValidIds_ReturnsSuccess() throws Exception {
        // Arrange
        when(orgService.removeMember(anyLong(), anyLong())).thenReturn("testuser");

        // Act & Assert
        mockMvc.perform(delete(BASE_URL + "/{orgId}/members", 1L)
                .param("userId", "1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Successfully removed testuser"));
    }

    @Test
    void createNewOrganization_ValidName_ReturnsSuccess() throws Exception {
        // Arrange
        String orgName = "New Org";
        when(orgService.createNewOrganization(anyString(), any(User.class))).thenReturn(testOrg);

        // Act & Assert
        mockMvc.perform(post(BASE_URL + "/new")
                .param("orgName", orgName)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(testOrg.getOrganizationName()));
    }

    @Test
    void createNewOrganization_InvalidName_ReturnsBadRequest() throws Exception {
        // Arrange
        String invalidOrgName = "Invalid@Name#$%";

        // Act & Assert
        mockMvc.perform(post(BASE_URL + "/new")
                .param("orgName", invalidOrgName)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid organization name format"));
    }

    @Test
    void getOwnedOrganizations_ReturnsOrganizationList() throws Exception {
        // Arrange
        when(orgService.findOrganizationsByOwner(any(User.class)))
            .thenReturn(Arrays.asList(testOrg));

        // Act & Assert
        mockMvc.perform(get(BASE_URL + "/owned/id-name")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value(testOrg.getOrganizationName()));
    }

    @Test
    void addEvent_ValidEvent_ReturnsSuccess() throws Exception {
        // Arrange
        EventDTO eventDTO = new EventDTO("Test Event",
            LocalDate.now().plusDays(1).toString(),
            LocalTime.of(14, 0).toString(),
            "OTHER",
            "Test Location",
            "Test Description");

        // Act & Assert
        mockMvc.perform(post(BASE_URL + "/{orgId}/events", 1L)
                .content(objectMapper.writeValueAsString(eventDTO))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Event added successfully"));
    }

    @Test
    void addEvent_PastDate_ReturnsBadRequest() throws Exception {
        // Arrange
        EventDTO eventDTO = new EventDTO("Test Event",
            LocalDate.now().minusDays(1).toString(),
            LocalTime.of(14, 0).toString(),
            "OTHER",
            "Test Location",
            "Test Description");

        // Act & Assert
        mockMvc.perform(post(BASE_URL + "/{orgId}/events", 1L)
                .content(objectMapper.writeValueAsString(eventDTO))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Event date cannot be in the past"));
    }

    @Test
    void getOrganizationMembers_ReturnsMembers() throws Exception {
        // Arrange
        OrganizationMembership membership = new OrganizationMembership();
        membership.setUser(testUser);
        membership.setRole(Role.MEMBER);

        when(orgService.getMembers(anyLong())).thenReturn(Arrays.asList(membership));

        // Act & Assert
        mockMvc.perform(get(BASE_URL + "/{orgId}/members", 1L)
                .param("orgId", "1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value(testUser.getUsername()));
    }

    @Test
    void getEvents_ReturnsEventsList() throws Exception {
        // Arrange
        UpcomingEvent event = new UpcomingEvent(1L, "Test Upcoming Event");

        when(orgService.getUpcomingEvents(anyLong())).thenReturn(Arrays.asList(event));

        // Act & Assert
        mockMvc.perform(get(BASE_URL + "/{orgId}/events", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value(event.getName()));
    }

    @Test
    void getOrganizationDetails_ReturnsOrgDetails() throws Exception {
        // Arrange
        when(orgService.findOrgById(anyLong())).thenReturn(testOrg);

        // Act & Assert
        mockMvc.perform(get(BASE_URL + "/{orgId}/details", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(testOrg.getOrganizationName()));
    }
}