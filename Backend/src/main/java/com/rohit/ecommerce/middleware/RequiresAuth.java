package com.rohit.ecommerce.middleware;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark endpoints that require authentication.
 * This is for documentation purposes only, as the actual authentication
 * is handled by the AuthInterceptor based on URL patterns.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresAuth {
    String description() default "This endpoint requires authentication";
}
