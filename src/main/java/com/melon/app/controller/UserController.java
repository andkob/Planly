package com.melon.app.controller;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.melon.app.entity.User;
import com.melon.app.service.UserService;
import com.melon.app.controller.DTO.OrganizationIdNameDTO;
import com.melon.app.entity.Organization;

/**
 * Controller for handling user-related operations such as retrieving user information
 * and organizations they are associated with.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Retrieves the first name of the currently authenticated user.
     *
     * @return {@link ResponseEntity} containing the first name of the authenticated user,
     *         or an empty response if the user is not authenticated.
     */
    @GetMapping("/me/first-name")
    public ResponseEntity<?> getFirstName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            User user = (User) auth.getPrincipal();
            return ResponseEntity.ok(user.getUsername()); // TODO change to name when names are added
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Retrieves a list of organizations that the currently authenticated user is a member of.
     *
     * @return {@link ResponseEntity} containing a list of OrganizationIdNameDTO objects representing
     *         the user's organizations.
     */
    @GetMapping("/me/organizations")
    public ResponseEntity<?> getOrganizations() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Set<Organization> orgs = userService.getOrganizations(user);
        List<OrganizationIdNameDTO> orgIdNameDTOs = orgs.stream().map(OrganizationIdNameDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(orgIdNameDTOs);
    }
}
