package com.rohit.ecommerce.service;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.multipart.MultipartFile;

import com.rohit.ecommerce.model.Product;
import com.rohit.ecommerce.repo.ProductRepo;

@Service
@RequestMapping("/api")
public class ProductService {

    @Autowired
    private ProductRepo repo;
    public List<Product> getAllProducts() {

        return repo.findAll();

    }
    public Product getProductById(String id) {
        return repo.findById(id).orElse(null);
    }
    public Product addProduct(Product product, MultipartFile imageFile) throws IOException {
        searchProducts("jsdfksdlfsijdfok");
        product.setImageName(imageFile.getOriginalFilename());
        product.setImageType(imageFile.getContentType());
        product.setImageData(imageFile.getBytes());

        return repo.save(product);
    }

    public Product updateProduct(String id, Product product, MultipartFile imageFile) throws IOException {
        product.setImageName(null != imageFile ? imageFile.getOriginalFilename() : null);
        product.setImageType(null != imageFile ? imageFile.getContentType() : null);
        product.setImageData(null != imageFile ? imageFile.getBytes() : null);
        return repo.save(product);
    }
    public void deleteProduct(String id) {
        repo.deleteById(id);
    }
    public List<Product> searchProducts(String keyword) {
        return repo.searchProducts(keyword);
    }
}