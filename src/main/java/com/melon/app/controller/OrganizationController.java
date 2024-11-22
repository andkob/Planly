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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.melon.app.controller.DTO.EventDTO;
import com.melon.app.controller.DTO.OrganizationIdNameDTO;
import com.melon.app.entity.Organization;
import com.melon.app.entity.UpcomingEvent;
import com.melon.app.entity.User;
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
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
        }

        User user = (User) auth.getPrincipal();
        boolean success = orgService.joinOrganization(user, orgId);

        System.out.println("Joining org? -> " + success);

        return success ? ResponseEntity.ok("Organization joined successfully") : ResponseEntity.ok("Org not joined");
    }

    @PostMapping("/post/new-org")
    public ResponseEntity<String> createOrganization(@RequestParam String orgName) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
        }

        orgService.createNewOrganization(orgName);
        return ResponseEntity.ok("Organization successfully created");
    }

    @GetMapping("/get/org-name")
    public ResponseEntity<?> findOrgsByName(@RequestParam String orgName) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
        }
        
        List<Organization> foundOrganizations = orgService.findOrgsByName(orgName);
        List<OrganizationIdNameDTO> orgDTOs = foundOrganizations.stream().map(OrganizationIdNameDTO::new).collect(Collectors.toList());

        // TODO - response should say this stuff
        if (orgDTOs.isEmpty()) {
            System.out.println("No orgs with that name");
        } else {
            for (OrganizationIdNameDTO org : orgDTOs) {
                System.out.println("Found: " + org.getName());
            }
        }
        return ResponseEntity.ok(orgDTOs);
    }

    @PostMapping("/post/new-event/{orgId}")
    public ResponseEntity<?> addEvent(@PathVariable Long orgId, @RequestBody EventDTO eventDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
        }

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
}
