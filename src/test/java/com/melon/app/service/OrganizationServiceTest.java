package com.melon.app.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.melon.app.entity.Organization;
import com.melon.app.entity.OrganizationMembership;
import com.melon.app.entity.Role;
import com.melon.app.entity.UpcomingEvent;
import com.melon.app.entity.User;
import com.melon.app.exception.CannotJoinOwnedOrgException;
import com.melon.app.exception.InvalidIdException;
import com.melon.app.exception.OrganizationDoesNotExistException;
import com.melon.app.repository.OrganizationRepository;
import com.melon.app.repository.UpcomingEventRepository;
import com.melon.app.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class OrganizationServiceTest {

    @Mock
    private OrganizationRepository orgRepo;

    @Mock
    private UserRepository userRepo;

    @Mock
    private UpcomingEventRepository eventRepo;

    @InjectMocks
    private OrganizationService organizationService;

    private User testUser;
    private Organization testOrg;
    private OrganizationMembership testMembership;
    private UpcomingEvent testEvent;

    @BeforeEach
    void setUp() {
        testUser = new User(1L, "testuser");

        testOrg = new Organization(1L, "Test Org");

        testMembership = new OrganizationMembership(testUser, testOrg, Role.OWNER);
        
        testEvent = new UpcomingEvent(1L, "Test Event");
    }

    @Test
    void joinOrganization_Success() {
        // Arrange
        when(userRepo.findById(1L)).thenReturn(Optional.of(testUser));
        when(orgRepo.findById(1L)).thenReturn(Optional.of(testOrg));
        when(userRepo.save(any(User.class))).thenReturn(testUser);
        when(orgRepo.save(any(Organization.class))).thenReturn(testOrg);

        // Act
        boolean result = organizationService.joinOrganization(testUser, "1");

        // Assert
        assertTrue(result);
        verify(userRepo).save(any(User.class));
        verify(orgRepo).save(any(Organization.class));
    }

    @Test
    void joinOrganization_InvalidId() {
        // Act & Assert
        assertThrows(InvalidIdException.class, () -> 
            organizationService.joinOrganization(testUser, "invalid"));
    }

    @Test
    void joinOrganization_OrgNotFound() {
        // Arrange
        when(userRepo.findById(1L)).thenReturn(Optional.of(testUser));
        when(orgRepo.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(OrganizationDoesNotExistException.class, () ->
            organizationService.joinOrganization(testUser, "1"));
    }

    @Test
    void joinOrganization_CannotJoinOwnedOrg() {
        // Arrange
        Organization ownedOrg = new Organization("Owned Org");
        ownedOrg.setId(1L);
        ownedOrg.setOwner(testUser);

        when(userRepo.findById(1L)).thenReturn(Optional.of(testUser));
        when(orgRepo.findById(1L)).thenReturn(Optional.of(ownedOrg));

        // Act & Assert
        assertThrows(CannotJoinOwnedOrgException.class, () ->
            organizationService.joinOrganization(testUser, "1"));
    }

    @Test
    void createNewOrganization_Success() {
        // Arrange
        Organization newOrg = new Organization("New Org");
        when(orgRepo.save(any(Organization.class))).thenReturn(newOrg);

        // Act
        Organization result = organizationService.createNewOrganization("New Org");

        // Assert
        assertNotNull(result);
        assertEquals("New Org", result.getName());
        verify(orgRepo).save(any(Organization.class));
    }

    @Test
    void createNewOwnedOrganization_Success() {
        // Arrange
        Organization newOrg = new Organization("New Owned Org", testUser);
        when(userRepo.findById(1L)).thenReturn(Optional.of(testUser));
        when(orgRepo.save(any(Organization.class))).thenReturn(newOrg);

        // Act
        Organization result = organizationService.createNewOwnedOrganization("New Owned Org", testUser);

        // Assert
        assertNotNull(result);
        assertEquals("New Owned Org", result.getName());
        assertEquals(testUser, result.getOwner());
        verify(orgRepo).save(any(Organization.class));
    }

    @Test
    void findOrganizationsByOwner_Success() {
        // Arrange
        List<Organization> expectedOrgs = Arrays.asList(testOrg);
        when(orgRepo.findByOwner(testUser)).thenReturn(expectedOrgs);

        // Act
        List<Organization> result = organizationService.findOrganizationsByOwner(testUser);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testOrg, result.get(0));
    }

    @Test
    void findOrgById_Success() {
        // Arrange
        when(orgRepo.findById(1L)).thenReturn(Optional.of(testOrg));

        // Act
        Organization result = organizationService.findOrgById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(testOrg, result);
    }

    @Test
    void findOrgById_NotFound() {
        // Arrange
        when(orgRepo.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(OrganizationDoesNotExistException.class, () ->
            organizationService.findOrgById(1L));
    }

    @Test
    void findOrgsByName_Success() {
        // Arrange
        List<Organization> expectedOrgs = Arrays.asList(testOrg);
        when(orgRepo.findByOrganizationName("Test Org")).thenReturn(expectedOrgs);

        // Act
        List<Organization> result = organizationService.findOrgsByName("Test Org");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testOrg, result.get(0));
    }

    @Test
    void addEventToOrganization_Success() {
        // Arrange
        when(orgRepo.findById(1L)).thenReturn(Optional.of(testOrg));
        when(orgRepo.save(any(Organization.class))).thenReturn(testOrg);

        // Act
        organizationService.addEventToOrganization(1L, testEvent);

        // Assert
        verify(orgRepo).save(any(Organization.class));
        assertTrue(testOrg.getEvents().contains(testEvent));
    }

    @Test
    void addEventToOrganization_OrgNotFound() {
        // Arrange
        when(orgRepo.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(OrganizationDoesNotExistException.class, () ->
            organizationService.addEventToOrganization(1L, testEvent));
    }

    @Test
    void getUpcomingEvents_Success() {
        // Arrange
        List<UpcomingEvent> expectedEvents = Arrays.asList(testEvent);
        when(eventRepo.findByOrganizationIdOrderByDateAscStartTimeAsc(1L)).thenReturn(expectedEvents);

        // Act
        List<UpcomingEvent> result = organizationService.getUpcomingEvents(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testEvent, result.get(0));
    }

    @Test
    void getUsers_Success() {
        // Arrange
        List<User> expectedMembers = Arrays.asList(testUser);
        when(userRepo.findUsersByOrganizationId(1L)).thenReturn(expectedMembers);

        // Act
        List<User> result = organizationService.getUsers(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testUser, result.get(0));
    }

    @Test
    void getMembers_Success() {
        // Arrange
        List<OrganizationMembership> expectedMemberships = Arrays.asList(testMembership);
        when(orgRepo.findMembershipsByOrganizationId(1L)).thenReturn(expectedMemberships);

        // Act
        List<OrganizationMembership> result = organizationService.getMembers(1L);

        // Print JSON representation
        ObjectMapper mapper = new ObjectMapper();
        try {
            String json = mapper.writeValueAsString(result);
            System.out.println("JSON output: " + json);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testMembership, result.get(0));
    }
}