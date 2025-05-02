package com.example.authservice.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.example.authservice.model.User;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;
    
    private final long jwtExpirationMs = 86400000; // 1 day

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("email", user.getEmail());
        claims.put("name", user.getName());
        claims.put("avatarUrl", user.getAvatarUrl());
        claims.put("role", user.getRole());
        claims.put("department", user.getDepartment());

        return Jwts.builder()
            .setClaims(claims)
            .setSubject(user.getEmail())
            .setIssuedAt(new Date())
            .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
            .signWith(SignatureAlgorithm.HS256, "DUIFNBVDFOV548N04V8VN043V5I845N80N485048N5V90485NV04N5".getBytes(StandardCharsets.UTF_8))
            .compact();
}
}