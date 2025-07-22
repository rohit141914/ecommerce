package com.rohit.ecommerce.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rohit.ecommerce.model.User;
import com.rohit.ecommerce.service.AuthService;

@RestController
@CrossOrigin
@RequestMapping("/api/auth")
public class Auth {

    // Autowire the AuthService to handle authentication and registration logic
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user) {
        if(user.getEmail() == null || user.getPassword() == null) {
            return new ResponseEntity<>("Username and password must not be empty", HttpStatus.BAD_REQUEST);
        }
        String authResult = authService.authenticate(user);
        if(authResult == null) {
            return new ResponseEntity<>("Invalid username or password", HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>(authResult, HttpStatus.OK);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if( user.getEmail() == null || user.getPassword() == null) {
            return new ResponseEntity<>("Username, email, and password must not be empty", HttpStatus.BAD_REQUEST);
        }
        if(authService.register(user)) {
            return new ResponseEntity<>("Registration successful", HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>("User already exists with this email", HttpStatus.CONFLICT);
        }
    }

}
