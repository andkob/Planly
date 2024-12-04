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

@RestController
@RequestMapping("/api/org")
public class OrganizationController {
    
    @Autowired
    private final OrganizationService orgService;

    @Autowired
    public OrganizationController(OrganizationService organizationService) {
        this.orgService = organizationService;
    }

    @PostMapping("/join")
    public ResponseEntity<String> joinOrganization(@RequestParam String orgId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        User user = (User) auth.getPrincipal();
        boolean success = false;
        success = orgService.joinOrganization(user, orgId);
        return success ? ResponseEntity.ok("Organization joined successfully") : ResponseEntity.ok("Failed to join organization");
    }

    @DeleteMapping("/members")
    public ResponseEntity<String> removeMember(@RequestParam Long orgId, @RequestParam Long userId) {
         try {
            String username = orgService.removeMember(orgId, userId);
            return ResponseEntity.ok("Successfully removed "+ username);
        } catch (CannotRemoveOwnerException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Cannot remove the owner of the organization");
        } catch (UserNotInOrganizationException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("User is not a member of this organization");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while removing the member");
        }
    }

    @PostMapping("/post/new-org")
    public ResponseEntity<String> createOrganization(@RequestParam String orgName) {
        orgService.createNewOrganization(orgName);
        return ResponseEntity.ok("Organization successfully created");
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOwnedOrganization(@RequestParam String orgName) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Organization newOrg = orgService.createNewOwnedOrganization(orgName, user);
        System.out.println("Created new org: " + newOrg.toString());
        return ResponseEntity.ok(new OrganizationDTO(newOrg));
    }

    @GetMapping("/get/owned/id-name")
    public ResponseEntity<List<OrganizationIdNameDTO>> getOwnedOrganizationsIdName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        List<Organization> ownedOrgs = orgService.findOrganizationsByOwner(user);
        
        List<OrganizationIdNameDTO> orgDTOs = ownedOrgs.stream()
            .map(OrganizationIdNameDTO::new)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(orgDTOs);
    }

    @GetMapping("/get/org-name")
    public ResponseEntity<?> findOrgsByName(@RequestParam String orgName) {     
        List<Organization> foundOrganizations = orgService.findOrgsByName(orgName);
        List<OrganizationIdNameDTO> orgDTOs = foundOrganizations.stream().map(OrganizationIdNameDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(orgDTOs);
    }

    @PostMapping("/post/new-event/{orgId}")
    public ResponseEntity<?> addEvent(@PathVariable Long orgId, @RequestBody EventDTO eventDTO) {
        UpcomingEvent event = new UpcomingEvent();
        event.setName(eventDTO.getName());
        event.setDate(LocalDate.parse(eventDTO.getDate()));
        event.setStartTime(LocalTime.parse(eventDTO.getStartTime()));
        event.setType(eventDTO.getEventType());
        event.setLocation(eventDTO.getLocation());
        event.setDescription(eventDTO.getDescription());

        System.out.println("Created: " + event.toString());

        orgService.addEventToOrganization(orgId, event);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/get/events/{orgId}")
    public ResponseEntity<?> getEvents(@PathVariable Long orgId) {
        List<UpcomingEvent> events = orgService.getUpcomingEvents(orgId);
        List<EventDTO> eventDTOs = events.stream()
            .map(EventDTO::new)  // Uses the new constructor
            .collect(Collectors.toList());

        return ResponseEntity.ok(eventDTOs);
    }

    @GetMapping("/details/{orgId}")
    public ResponseEntity<?> getOrganizationDetails(@PathVariable Long orgId) {
        Organization org = orgService.findOrgById(orgId);
        OrganizationDTO orgDTO = new OrganizationDTO(org);
        return ResponseEntity.ok(orgDTO);
    }

    @GetMapping("/get/members")
    public ResponseEntity<?> getOrganizationMembers(@RequestParam Long orgId) {
        List<OrganizationMembership> members = orgService.getMembers(orgId);
        List<OrganizationMemberDTO> memberDTO = members.stream()
            .map(member -> {
                OrganizationMemberDTO dto = new OrganizationMemberDTO();
                User user = member.getUser();
                dto.setUserId(user.getId());
                dto.setEmail(user.getEmail());
                dto.setUsername(user.getUsername());
                dto.setRole(member.getRole());
                dto.setCreatedAt(LocalDate.now().toString()); // TODO - implement JoinedAt timestamp
                return dto;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(memberDTO);
    }
}
