package com.melon.app.security;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * TEMPORARY - used for generating hardcoded JWT secret
 */
public class JwtSecretGenerator {

    public static void main(String[] args) {
        SecureRandom secureRandom = new SecureRandom();
        byte[] secretBytes = new byte[32]; // 32 bytes = 256 bits
        secureRandom.nextBytes(secretBytes);
        String secret = Base64.getEncoder().encodeToString(secretBytes);
        System.out.println("Generated JWT secret: " + secret);
    }
}
