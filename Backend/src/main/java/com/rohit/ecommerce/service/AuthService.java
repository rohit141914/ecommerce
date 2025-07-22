package com.rohit.ecommerce.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;
import javax.crypto.SecretKey;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rohit.ecommerce.model.User;
import com.rohit.ecommerce.repo.UserRepo;

@Service
public class AuthService {
    private static final String SECRET = "your-very-long-random-secret-key-string-should-be-at-least-32-bytes";
    private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    private static final long EXPIRATION_TIME = 86400000; // 1 day in ms
    
    /**
     * Returns the secret key used for JWT token verification
     * @return The SecretKey object
     */
    public SecretKey getSecretKey() {
        return SECRET_KEY;
    }

    @Autowired
    private UserRepo userRepo;

    public String authenticate(User user) {
        if (userRepo.findByEmailAndPassword(user.getEmail(), user.getPassword()) != null) {
            return generateJwtToken(user.getEmail());
        }
        return null;
    }

    public boolean register(User user) {
        if (userRepo.findByEmail(user.getEmail()) != null) {
            return false;
        }
        return userRepo.save(user) != null;
    }

    public String generateJwtToken(String email) {
        java.util.Map<String, Object> claims = new java.util.HashMap<>();
        claims.put("sub", email);
        claims.put("iat", System.currentTimeMillis() / 1000); // issued at (seconds)
        claims.put("exp", (System.currentTimeMillis() + EXPIRATION_TIME) / 1000); // expiration (seconds)

        return Jwts.builder()
            .claims(claims)
            .signWith(SECRET_KEY)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
            Long exp = claims.get("exp", Long.class);
            return exp != null && exp * 1000 > System.currentTimeMillis();
        } catch (Exception e) {
            return false;
        }
    }
}