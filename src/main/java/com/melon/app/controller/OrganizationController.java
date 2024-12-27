package com.melon.app.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.melon.app.controller.DTO.EventDTO;
import com.melon.app.controller.DTO.OrganizationDTO;
import com.melon.app.controller.DTO.OrganizationIdNameDTO;
import com.melon.app.controller.DTO.OrganizationMemberDTO;
import com.melon.app.entity.Organization;
import com.melon.app.entity.OrganizationMembership;
import com.melon.app.entity.UpcomingEvent;
import com.melon.app.entity.User;
import com.melon.app.service.OrganizationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/organizations")
@Validated
public class OrganizationController extends BaseController {
    
    private final OrganizationService orgService;

    @Autowired
    public OrganizationController(OrganizationService organizationService) {
        this.orgService = organizationService;
    }
    
    @PostMapping("/{orgId}/members")
    public ResponseEntity<Map<String, String>> joinOrganization(@PathVariable String orgId) {
        // Validate organization ID
        if (!isValidId(orgId)) {
            logSecurityEvent("JOIN_ORG_INVALID_ID", "Invalid organization ID: " + orgId);
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid organization ID format");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        
        logSecurityEvent("JOIN_ORG_ATTEMPT", 
            String.format("User ID: %d, Org ID: %s", user.getId(), orgId));
        
        boolean success = orgService.joinOrganization(user, orgId);
        
        if (success) {
            logSecurityEvent("JOIN_ORG_SUCCESS", 
                String.format("User ID: %d, Org ID: %s", user.getId(), orgId));
            return createSuccessResponse("Organization joined successfully");
        } else {
            logSecurityEvent("JOIN_ORG_FAILURE", 
                String.format("User ID: %d, Org ID: %s", user.getId(), orgId));
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Failed to join organization");
        }
    }

    @DeleteMapping("/{orgId}/members")
    public ResponseEntity<Map<String, String>> removeMember(
            @PathVariable Long orgId,
            @RequestParam Long userId) {
        if (!isValidId(orgId) || !isValidId(userId)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, 
                "Invalid organization or user ID");
        }

        String username = orgService.removeMember(orgId, userId);
        logSecurityEvent("REMOVE_MEMBER", 
            String.format("Org ID: %d, User ID: %d", orgId, userId));
        
        return createSuccessResponse("Successfully removed " + sanitizeInput(username));
    }

    @PostMapping("/new")
    public ResponseEntity<?> createNewOrganization(@RequestParam String orgName) {
        String sanitizedName = sanitizeInput(orgName);
        
        if (!isValidName(sanitizedName)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, 
                "Invalid organization name format");
        }

        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Organization newOrg = orgService.createNewOrganization(sanitizedName, user);
        
        logSecurityEvent("CREATE_ORG", 
            String.format("User ID: %d, Org Name: %s", user.getId(), sanitizedName));
        
        return ResponseEntity.ok(new OrganizationDTO(newOrg));
    }

    @GetMapping("/owned/id-name")
    public ResponseEntity<Map<String, Object>> getOwnedOrganizationsIdName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();

        List<Organization> ownedOrgs = orgService.findOrganizationsByOwner(user);
        List<OrganizationIdNameDTO> orgDTOs = ownedOrgs.stream()
            .map(OrganizationIdNameDTO::new)
            .collect(Collectors.toList());
        
        return createSuccessResponseWithPayload("Successfully fetched owned organization IDs", orgDTOs);
    }

    @GetMapping("/{orgName}")
    public ResponseEntity<?> findOrgsByName(@PathVariable String orgName) {
        String sanitizedName = sanitizeInput(orgName);
        
        if (!isValidSafeString(sanitizedName)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, 
                "Invalid organization name format");
        }

        List<Organization> foundOrganizations = orgService.findOrgsByName(sanitizedName);
        List<OrganizationIdNameDTO> orgDTOs = foundOrganizations.stream()
            .map(OrganizationIdNameDTO::new)
            .collect(Collectors.toList());
        return createSuccessResponseWithPayload("Successfully executed search", orgDTOs);
    }

    @PostMapping("/{orgId}/events")
    public ResponseEntity<?> addEvent(
            @PathVariable Long orgId,
            @Valid @RequestBody EventDTO eventDTO,
            BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return handleValidationErrors(bindingResult);
        }

        if (!isValidId(orgId)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid organization ID");
        }

        String sanitizedName = sanitizeInput(eventDTO.getName());
        String sanitizedLocation = sanitizeInput(eventDTO.getLocation());
        String sanitizedDescription = sanitizeInput(eventDTO.getDescription());

        // Validate event data lengths
        if (!isValidLength(sanitizedName, 1, MAX_NAME_LENGTH) ||
            !isValidLength(sanitizedLocation, 1, MAX_STRING_LENGTH) ||
            (sanitizedDescription != null && !isValidLength(sanitizedDescription, 0, MAX_STRING_LENGTH))) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid event data length");
        }

        // Validate safe string content
        if (!isValidSafeString(sanitizedName) || 
            !isValidSafeString(sanitizedLocation) ||
            (sanitizedDescription != null && !sanitizedDescription.isEmpty() && !isValidSafeString(sanitizedDescription))) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid event data format");
        }

        UpcomingEvent event = new UpcomingEvent();
        event.setName(sanitizedName);
        event.setLocation(sanitizedLocation);
        event.setDescription(sanitizedDescription);

        try {
            event.setDate(LocalDate.parse(eventDTO.getDate()));
            event.setStartTime(LocalTime.parse(eventDTO.getStartTime()));
            
            // Validate date is not in past
            if (event.getDate().isBefore(LocalDate.now())) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, 
                    "Event date cannot be in the past");
            }
        } catch (DateTimeParseException e) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, 
                "Invalid date or time format");
        }

        event.setType(eventDTO.getEventType());
        
        orgService.addEventToOrganization(orgId, event);
        
        logSecurityEvent("CREATE_EVENT", 
            String.format("Org ID: %d, Event: %s", orgId, sanitizedName));
            
        return createSuccessResponse("Event added successfully");
    }

    @GetMapping("/{orgId}/events")
    public ResponseEntity<?> getEvents(@PathVariable Long orgId) {
        if (!isValidId(orgId)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid organization ID");
        }
        
        List<UpcomingEvent> events = orgService.getUpcomingEvents(orgId);
        List<EventDTO> eventDTOs = events.stream()
            .map(EventDTO::new)
            .collect(Collectors.toList());
        return createSuccessResponseWithPayload("Successfully fetched organization events", eventDTOs);
    }

    @GetMapping("/{orgId}/details")
    public ResponseEntity<?> getOrganizationDetails(@PathVariable Long orgId) {
        if (!isValidId(orgId)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid organization ID");
        }
        
        Organization org = orgService.findOrgById(orgId);
        OrganizationDTO orgDTO = new OrganizationDTO(org);
        return createSuccessResponseWithPayload("Successfully fetched organization details", orgDTO);
    }

    @GetMapping("/{orgId}/members")
    public ResponseEntity<?> getOrganizationMembers(@PathVariable Long orgId) {
        if (!isValidId(orgId)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid organization ID");
        }
        
        List<OrganizationMembership> members = orgService.getMembers(orgId);
        List<OrganizationMemberDTO> membersDTO = members.stream()
            .map(member -> {
                OrganizationMemberDTO dto = new OrganizationMemberDTO();
                User user = member.getUser();
                dto.setUserId(user.getId());
                dto.setEmail(user.getEmail());
                dto.setUsername(user.getUsername());
                dto.setRole(member.getRole());
                dto.setCreatedAt(LocalDate.now().toString());
                return dto;
            })
            .collect(Collectors.toList());
        return createSuccessResponseWithPayload("Successfully fetched organization members", membersDTO);
    }
}