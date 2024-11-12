package com.melon.app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.melon.app.entity.Organization;
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

    @PostMapping("/post/new-org")
    public ResponseEntity<String> createOrganization(@RequestParam String orgName) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
        }

        orgService.createNewOrganization(orgName);
        return ResponseEntity.ok("Organizatin successfully created");
    }

    @GetMapping("/get/org-name")
    public ResponseEntity<?> findOrgsByName(@RequestParam String orgName) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
        }
        
        List<Organization> foundOrganizations = orgService.findOrgsByName(orgName);

        // TODO - response should say this stuff
        if (foundOrganizations.isEmpty()) {
            System.out.println("No orgs with that name");
        } else {
            for (Organization org : foundOrganizations) {
                System.out.println("Found: " + org.getName());
            }
        }
        return ResponseEntity.ok(foundOrganizations);
    }
}
