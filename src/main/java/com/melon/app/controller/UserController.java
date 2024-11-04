package com.melon.app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.melon.app.entity.User;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/get/first-name")
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
}
