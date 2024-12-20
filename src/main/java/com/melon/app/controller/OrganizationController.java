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
import com.melon.app.exception.CannotRemoveOwnerException;
import com.melon.app.exception.UserNotInOrganizationException;
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
        try {
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
        } catch (Exception e) {
            logError("Error joining organization", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while joining the organization");
        }
    }

    @DeleteMapping("/{orgId}/members")
    public ResponseEntity<Map<String, String>> removeMember(
            @PathVariable Long orgId,
            @RequestParam Long userId) {
        try {
            if (!isValidId(orgId) || !isValidId(userId)) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, 
                    "Invalid organization or user ID");
            }

            String username = orgService.removeMember(orgId, userId);
            logSecurityEvent("REMOVE_MEMBER", 
                String.format("Org ID: %d, User ID: %d", orgId, userId));
            
            return createSuccessResponse("Successfully removed " + sanitizeInput(username));
        } catch (CannotRemoveOwnerException e) {
            return createErrorResponse(HttpStatus.FORBIDDEN, 
                "Cannot remove the owner of the organization");
        } catch (UserNotInOrganizationException e) {
            return createErrorResponse(HttpStatus.NOT_FOUND, 
                "User is not a member of this organization");
        } catch (Exception e) {
            logError("Error removing member", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while removing the member");
        }
    }

    @PostMapping("/new")
    public ResponseEntity<?> createNewOrganization(@RequestParam String orgName) {
        try {
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
        } catch (Exception e) {
            logError("Error creating organization", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while creating the organization");
        }
    }

    @GetMapping("/owned/id-name")
    public ResponseEntity<List<OrganizationIdNameDTO>> getOwnedOrganizationsIdName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        List<Organization> ownedOrgs = orgService.findOrganizationsByOwner(user);
        List<OrganizationIdNameDTO> orgDTOs = ownedOrgs.stream()
            .map(OrganizationIdNameDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(orgDTOs);
    }

    @GetMapping("/{orgName}")
    public ResponseEntity<?> findOrgsByName(@PathVariable String orgName) {
        try {
            String sanitizedName = sanitizeInput(orgName);
            
            if (!isValidSafeString(sanitizedName)) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, 
                    "Invalid organization name format");
            }

            List<Organization> foundOrganizations = orgService.findOrgsByName(sanitizedName);
            List<OrganizationIdNameDTO> orgDTOs = foundOrganizations.stream()
                .map(OrganizationIdNameDTO::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(orgDTOs);
        } catch (Exception e) {
            logError("Error finding organizations", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while searching for organizations");
        }
    }

    @PostMapping("/{orgId}/events")
    public ResponseEntity<?> addEvent(
            @PathVariable Long orgId,
            @Valid @RequestBody EventDTO eventDTO,
            BindingResult bindingResult) {
        try {
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
        } catch (Exception e) {
            logError("Error adding event", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while adding the event");
        }
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
        return ResponseEntity.ok(eventDTOs);
    }

    @GetMapping("/{orgId}/details")
    public ResponseEntity<?> getOrganizationDetails(@PathVariable Long orgId) {
        if (!isValidId(orgId)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid organization ID");
        }
        
        Organization org = orgService.findOrgById(orgId);
        OrganizationDTO orgDTO = new OrganizationDTO(org);
        return ResponseEntity.ok(orgDTO);
    }

    @GetMapping("/{orgId}/members")
    public ResponseEntity<?> getOrganizationMembers(@PathVariable Long orgId) {
        if (!isValidId(orgId)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid organization ID");
        }
        
        List<OrganizationMembership> members = orgService.getMembers(orgId);
        List<OrganizationMemberDTO> memberDTO = members.stream()
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
        return ResponseEntity.ok(memberDTO);
    }
}