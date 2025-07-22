package com.rohit.ecommerce.middleware;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import com.rohit.ecommerce.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Autowired
    private AuthService authService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Skip OPTIONS requests (for CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        
        
        // Get the Authorization header
        String authHeader = request.getHeader("Authorization");
        
        // Check if the header exists and has the Bearer format
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            // Validate the token
            boolean isValid = authService.validateToken(token);
            
            if (isValid) {
                return true; // Allow the request to proceed
            }
        }
        
        // If no valid token is provided, return 401 Unauthorized
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.getWriter().write("Not authorized. Please sign in.");
        return false; // Block the request
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        // Nothing to do here
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        // Nothing to do here
    }
}
