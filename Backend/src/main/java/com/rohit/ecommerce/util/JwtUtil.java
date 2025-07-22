package com.rohit.ecommerce.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.rohit.ecommerce.service.AuthService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtUtil {

    @Autowired
    private AuthService authService;

    /**
     * Extracts the user email from the JWT token in the request
     * @param request The HTTP request containing the JWT token
     * @return The email of the authenticated user, or null if not found
     */
    public String getUserEmailFromToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Claims claims = Jwts.parser()
                    .verifyWith(authService.getSecretKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
                return claims.getSubject();
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }
}
