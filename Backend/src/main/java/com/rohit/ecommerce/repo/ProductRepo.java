package com.rohit.ecommerce.repo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.rohit.ecommerce.model.Product;

@Repository
public interface ProductRepo extends MongoRepository<Product, String> {
    // This interface will automatically provide CRUD operations for Product entity
    // MongoDB query methods using regex for case-insensitive search
    
    @Query("{ $or: [ " +
           "{ 'name': { $regex: ?0, $options: 'i' } }, " +
           "{ 'description': { $regex: ?0, $options: 'i' } }, " +
           "{ 'brand': { $regex: ?0, $options: 'i' } }, " +
           "{ 'category': { $regex: ?0, $options: 'i' } } " +
           "] }")
    List<Product> searchProducts(String keyword);
    
    // Additional MongoDB-specific query methods you can use:
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByCategory(String category);
    List<Product> findByBrand(String brand);
    List<Product> findByAvailable(boolean available);
}
