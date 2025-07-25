package com.rohit.ecommerce.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.rohit.ecommerce.middleware.RequiresAuth;

import com.rohit.ecommerce.model.Product;
import com.rohit.ecommerce.service.ProductService;

@RestController
@CrossOrigin
@RequestMapping("/api")
/**
 * ProductController handles all product-related operations.
 * Most endpoints in this controller are protected by AuthInterceptor,
 * which requires a valid JWT token in the Authorization header (Bearer format).
 * Public endpoints: GET /api/products, GET /api/product/{id}/image, GET /api/products/search
 */
public class ProductController {

    @Autowired
    private ProductService service;

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        System.out.println("Fetching all products");

        return new ResponseEntity<>(null != service.getAllProducts() ? service.getAllProducts() : List.of(), HttpStatus.OK);
    }
    
    @GetMapping("/product/{id}")
    @RequiresAuth(description = "Get product details by ID - requires authentication")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        Product product = service.getProductById(id);
        if (product != null) {
            return new ResponseEntity<>(product, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @PostMapping("/product")
    @RequiresAuth(description = "Add new product - requires authentication")
    public ResponseEntity<?> addProduct(@RequestPart Product product, @RequestPart MultipartFile imageFile) {
        try {
            Product savedProduct = service.addProduct(product, imageFile);
            return new ResponseEntity<>(savedProduct,HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/product/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductId(@PathVariable String productId) {
        Product product = service.getProductById(productId);
        if (product != null && product.getImageData() != null) {
            return ResponseEntity.ok()
                    .header("ContentType", product.getImageType())
                    .body(product.getImageData());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/product/{id}")
    @RequiresAuth(description = "Update product - requires authentication")
    public ResponseEntity<String> updateProduct(@PathVariable String id, @RequestPart Product product, @RequestPart(required = false) MultipartFile imageFile) {
        
        Product product2=null;
        try{
            product2 = service.updateProduct(id,product, imageFile);
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Failed to update: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Unexpected error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (product2 != null) {
            return new ResponseEntity<>("Product updated successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Product not found", HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/product/{id}")
    @RequiresAuth(description = "Delete product - requires authentication")
    public ResponseEntity<String> deleteProduct(@PathVariable String id) {
        Product product = service.getProductById(id);
        if (product != null) {
            service.deleteProduct(id);
            return new ResponseEntity<>("Product deleted successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Product not found", HttpStatus.NOT_FOUND); 
            }
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword) {

        List<Product> products = service.searchProducts(keyword);
        if (products != null && !products.isEmpty()) {
            return new ResponseEntity<>(products, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}

