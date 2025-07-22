package com.rohit.ecommerce.repo;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.rohit.ecommerce.model.User;

public interface UserRepo extends MongoRepository<User, String> {
    // This interface will automatically provide CRUD operations for User entity
    // You can add custom query methods if needed, for example:
    
    // User findByUsername(String username);
    
    // Additional methods can be defined here as per requirements

    User findByEmailAndPassword(String email, String password);
    // This method can be used for authentication purposes
    User findByEmail(String email);
}
