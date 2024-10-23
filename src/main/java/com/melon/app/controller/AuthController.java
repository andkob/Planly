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
import com.melon.app.security.JwtUtil;
import com.melon.app.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/user/login")
    public ResponseEntity<String> login(@RequestParam String email, @RequestParam String password) {
        Optional<User> user = userService.login(email, password);
        
        if (user.isPresent()) {
            String jwt = jwtUtil.generateToken(email); // Generate JWT on successful login
            return ResponseEntity.ok().body("{\"token\": \"" + jwt + "\"}");
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
