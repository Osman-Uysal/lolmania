package com.lolanalytics.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Bean
    public CorsFilter corsFilter() {
        System.out.println("CORS filter initialized!");
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow all origins for debugging (use patterns for subdomain support)
        config.setAllowedOriginPatterns(Arrays.asList("*"));
        
        // Allow all HTTP methods
        config.setAllowedMethods(Arrays.asList("*"));
        
        // Allow all headers
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // Expose headers that might be needed by the client
        config.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials",
            "Authorization"
        ));
        
        // Allow credentials
        config.setAllowCredentials(true);
        
        // How long the response to preflight requests can be cached
        config.setMaxAge(3600L);
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
} 