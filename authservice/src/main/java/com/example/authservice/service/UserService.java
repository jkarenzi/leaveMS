package com.example.authservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.authservice.model.User;
import com.example.authservice.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${leave.service.url}")
    private String leaveServiceUrl;
    
    public User registerUser(User user, String token) {
        // Save the user to the database
        User savedUser = userRepository.save(user);
        
        // Initialize leave balances for the new user, passing the token
        initializeLeaveBalances(savedUser.getId().toString(), token);
        
        return savedUser;
    }
    
    private void initializeLeaveBalances(String userId, String token) {
        try {
            // Create request payload
            Map<String, String> requestBody = new HashMap<>();

            
            requestBody.put("employeeId", userId);
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + token); // Add token to authorization header
            
            // Create the request entity (combines headers and body)
            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);
            
            // Make the API call to leave service
            // Uses POST to the /leave/balances endpoint with the requestEntity as the body
            restTemplate.postForEntity(
                leaveServiceUrl + "/leave/balances", 
                requestEntity, 
                Object.class // The expected response type
            );
            
            System.out.println("Leave balances initialized for user: " + userId);
        } catch (Exception e) {
            // Log the error but don't prevent user registration
            System.err.println("Failed to initialize leave balances: " + e.getMessage());
            e.printStackTrace();
        }
    }
}