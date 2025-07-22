package com.rohit.ecommerce.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.rohit.ecommerce.middleware.AuthInterceptor;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private AuthInterceptor authInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Apply the AuthInterceptor to specific product endpoints that require authentication
        registry.addInterceptor(authInterceptor)
                .addPathPatterns(
                    "/api/product/**",    // All product-specific endpoints (add, update, delete)
                    "/api/products/**"    // All products collection endpoints
                )
                .excludePathPatterns(
                    "/api/auth/**",           // Exclude auth endpoints
                    "/api/products",          // Allow public product listing
                    "/api/product/*/image",   // Allow public image access
                    "/api/products/search"    // Allow public product search
                );
    }
}
