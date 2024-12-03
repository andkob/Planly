package com.melon.app.controller;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.melon.app.entity.User;
import com.melon.app.service.UserService;
import com.melon.app.controller.DTO.OrganizationIdNameDTO;
import com.melon.app.entity.Organization;;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/get/first-name") // TODO - endpoint names should follow RESTful guidelines
    public ResponseEntity<?> getFirstName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            User user = (User) auth.getPrincipal();
            return ResponseEntity.ok(user.getUsername()); // TODO change to name when names are added
        } else {
            System.err.println("Uhhhhh check the user controller");
            return ResponseEntity.ofNullable(null);
        }
    }

    @GetMapping("/get/joined-orgs")
    public ResponseEntity<?> getOrganizations() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Set<Organization> orgs = userService.getOrganizations(user);
        List<OrganizationIdNameDTO> orgIdNameDTOs = orgs.stream().map(OrganizationIdNameDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(orgIdNameDTOs);
    }
}
