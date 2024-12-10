package com.melon.app.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.melon.app.controller.DTO.EventDTO;
import com.melon.app.controller.DTO.OrganizationDTO;
import com.melon.app.controller.DTO.OrganizationIdNameDTO;
import com.melon.app.controller.DTO.OrganizationMemberDTO;
import com.melon.app.entity.Organization;
import com.melon.app.entity.OrganizationMembership;
import com.melon.app.entity.UpcomingEvent;
import com.melon.app.entity.User;
import com.melon.app.exception.CannotRemoveOwnerException;
import com.melon.app.exception.UserNotInOrganizationException;
import com.melon.app.service.OrganizationService;

/**
 * REST controller for managing organizations and related entities.
 */
@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    @Autowired
    private final OrganizationService orgService;

    @Autowired
    public OrganizationController(OrganizationService organizationService) {
        this.orgService = organizationService;
    }

    /**
     * Allows a user to join an organization.
     *
     * @param orgId the ID of the organization to join.
     * @return {@link ResponseEntity} indicating the success or failure of the operation.
     */
    @PostMapping("/{orgId}/members")
    public ResponseEntity<String> joinOrganization(@PathVariable String orgId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        boolean success = orgService.joinOrganization(user, orgId);
        return success ? ResponseEntity.ok("Organization joined successfully") : ResponseEntity.ok("Failed to join organization");
    }

    /**
     * Removes a member from an organization.
     *
     * @param orgId  the ID of the organization.
     * @param userId the ID of the user to be removed.
     * @return {@link ResponseEntity} indicating the outcome of the operation.
     */
    @DeleteMapping("/{orgId}/members")
    public ResponseEntity<String> removeMember(@PathVariable Long orgId, @RequestParam Long userId) {
        try {
            String username = orgService.removeMember(orgId, userId);
            return ResponseEntity.ok("Successfully removed " + username);
        } catch (CannotRemoveOwnerException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cannot remove the owner of the organization");
        } catch (UserNotInOrganizationException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User is not a member of this organization");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while removing the member");
        }
    }

    /**
     * Creates a new organization owned by the current user.
     *
     * @param orgName the name of the organization to be created.
     * @return {@link ResponseEntity} with the created organization's details.
     */
    @PostMapping("/new")
    public ResponseEntity<?> createOwnedOrganization(@RequestParam String orgName) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Organization newOrg = orgService.createNewOwnedOrganization(orgName, user);
        return ResponseEntity.ok(new OrganizationDTO(newOrg));
    }

    /**
     * Retrieves a list of organizations owned by the current user.
     *
     * @return {@link ResponseEntity} containing a list of owned organizations with their IDs and names.
     */
    @GetMapping("/owned/id-name")
    public ResponseEntity<List<OrganizationIdNameDTO>> getOwnedOrganizationsIdName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        List<Organization> ownedOrgs = orgService.findOrganizationsByOwner(user);
        List<OrganizationIdNameDTO> orgDTOs = ownedOrgs.stream().map(OrganizationIdNameDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(orgDTOs);
    }

    /**
     * Searches for organizations by name.
     *
     * @param orgName the name of the organization to search for.
     * @return {@link ResponseEntity} containing a list of matching organizations.
     */
    @GetMapping("{orgName}")
    public ResponseEntity<?> findOrgsByName(@PathVariable String orgName) {
        List<Organization> foundOrganizations = orgService.findOrgsByName(orgName);
        List<OrganizationIdNameDTO> orgDTOs = foundOrganizations.stream().map(OrganizationIdNameDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(orgDTOs);
    }

    /**
     * Adds a new event to an organization.
     *
     * @param orgId    the ID of the organization.
     * @param eventDTO the details of the event to be added.
     * @return {@link ResponseEntity} indicating the success of the operation.
     */
    @PostMapping("{orgId}/events")
    public ResponseEntity<?> addEvent(@PathVariable Long orgId, @RequestBody EventDTO eventDTO) {
        UpcomingEvent event = new UpcomingEvent();
        event.setName(eventDTO.getName());
        event.setDate(LocalDate.parse(eventDTO.getDate()));
        event.setStartTime(LocalTime.parse(eventDTO.getStartTime()));
        event.setType(eventDTO.getEventType());
        event.setLocation(eventDTO.getLocation());
        event.setDescription(eventDTO.getDescription());
        orgService.addEventToOrganization(orgId, event);
        return ResponseEntity.ok().build();
    }

    /**
     * Retrieves upcoming events for an organization.
     *
     * @param orgId the ID of the organization.
     * @return {@link ResponseEntity} containing a list of events.
     */
    @GetMapping("{orgId}/events")
    public ResponseEntity<?> getEvents(@PathVariable Long orgId) {
        List<UpcomingEvent> events = orgService.getUpcomingEvents(orgId);
        List<EventDTO> eventDTOs = events.stream().map(EventDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(eventDTOs);
    }

    /**
     * Retrieves details of an organization by ID.
     *
     * @param orgId the ID of the organization.
     * @return {@link ResponseEntity} containing the organization's details.
     */
    @GetMapping("/{orgId}/details")
    public ResponseEntity<?> getOrganizationDetails(@PathVariable Long orgId) {
        Organization org = orgService.findOrgById(orgId);
        OrganizationDTO orgDTO = new OrganizationDTO(org);
        return ResponseEntity.ok(orgDTO);
    }

    /**
     * Retrieves members of an organization.
     *
     * @param orgId the ID of the organization.
     * @return {@link ResponseEntity} containing a list of members.
     */
    @GetMapping("/{orgId}/members")
    public ResponseEntity<?> getOrganizationMembers(@RequestParam Long orgId) {
        List<OrganizationMembership> members = orgService.getMembers(orgId);
        List<OrganizationMemberDTO> memberDTO = members.stream().map(member -> {
            OrganizationMemberDTO dto = new OrganizationMemberDTO();
            User user = member.getUser();
            dto.setUserId(user.getId());
            dto.setEmail(user.getEmail());
            dto.setUsername(user.getUsername());
            dto.setRole(member.getRole());
            dto.setCreatedAt(LocalDate.now().toString()); // TODO - implement JoinedAt timestamp
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(memberDTO);
    }
}
