package com.example.authservice.controller;

import com.example.authservice.model.User;
import com.example.authservice.repository.UserRepository;
import com.example.authservice.service.GoogleTokenVerifierService;
import com.example.authservice.service.JwtService;
import com.example.authservice.service.UserService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final GoogleTokenVerifierService googleTokenVerifier;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    
    private static final String DEFAULT_ROLE = "staff";

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> authenticate(@RequestBody Map<String, String> body) {
        try {
            String idTokenString = body.get("idToken");
            String department = body.getOrDefault("department", null);
            
            // Verify Google token
            GoogleIdToken.Payload payload = googleTokenVerifier.verify(idTokenString);
            if (payload == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Invalid Google token");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String avatarUrl = (String) payload.get("picture");
            
            // Check if user exists
            Optional<User> existingUser = userRepository.findByEmail(email);
            User user;
            boolean isNewUser = false;
            
            if (existingUser.isPresent()) {
                // Login flow
                user = existingUser.get();
            } else {
                // Signup flow
                isNewUser = true;
                
                user = User.builder()
                        .email(email)
                        .name(name)
                        .avatarUrl(avatarUrl)
                        .role(DEFAULT_ROLE)
                        .department(department)
                        .build();

                // Generate JWT token
                String tokenOne = jwtService.generateToken(user);        
                        
                // Use the service instead of directly saving
                User registeredUser = userService.registerUser(user, tokenOne);
            }

            // Generate JWT token
            String token = jwtService.generateToken(user);
            
            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", isNewUser ? "Account created successfully" : "Login successful");
            response.put("token", token);
            
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("email", user.getEmail());
            userMap.put("name", user.getName());
            userMap.put("role", user.getRole());
            userMap.put("department", user.getDepartment());
            userMap.put("avatarUrl", user.getAvatarUrl());
            
            response.put("user", userMap);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get a user's profile by ID
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable UUID id) {
        try {
            Optional<User> userOptional = userRepository.findById(id);
            
            if (userOptional.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            User user = userOptional.get();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("email", user.getEmail());
            userMap.put("name", user.getName());
            userMap.put("role", user.getRole());
            userMap.put("department", user.getDepartment());
            userMap.put("avatarUrl", user.getAvatarUrl());
            
            response.put("user", userMap);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get all users in the system
     */
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            
            List<Map<String, Object>> usersList = users.stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("email", user.getEmail());
                    userMap.put("name", user.getName());
                    userMap.put("role", user.getRole());
                    userMap.put("department", user.getDepartment());
                    userMap.put("avatarUrl", user.getAvatarUrl());
                    return userMap;
                })
                .collect(Collectors.toList());
                
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", usersList);
            response.put("count", users.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}