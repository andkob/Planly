package com.melon.app.controller;

import java.util.Map;
import java.util.Optional;

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.melon.app.entity.User;
import com.melon.app.service.UserService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;

    @PostMapping("/user/login")
    public ResponseEntity<String> login(@RequestParam String email, @RequestParam String password, HttpSession session) {
        Optional<User> user = userService.login(email, password, session);
        
        if (user.isPresent()) {
            return ResponseEntity.ok("Login successful");
        } else {
            return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @PostMapping("/user/register")
    public ResponseEntity<String> register(@RequestBody Map<String, String> userData) {
        userService.registerUser(userData.get("email"), userData.get("password"));
        return ResponseEntity.ok("Registration successful");
    }
}
