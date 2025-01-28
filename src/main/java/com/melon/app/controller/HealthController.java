package com.melon.app.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * A server endpoint to verify running status.
 */
@RestController
public class HealthController extends BaseController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        logSecurityEvent("HealthCheck", "Health check success");
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Planly API is running");
        return ResponseEntity.ok(response);
    }
}
