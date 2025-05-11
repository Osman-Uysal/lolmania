package com.lolanalytics.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.ClientHttpRequestExecution;
import java.io.IOException;

@Configuration
public class RestTemplateConfig {
    
    @Value("${riot.api.key}")
    private String apiKey;
    
    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        
        // Add the API key to all requests
        restTemplate.getInterceptors().add(new ClientHttpRequestInterceptor() {
            @Override
            public ClientHttpResponse intercept(org.springframework.http.HttpRequest request, 
                                              byte[] body, 
                                              ClientHttpRequestExecution execution) throws IOException {
                HttpHeaders headers = request.getHeaders();
                headers.set("X-Riot-Token", apiKey);
                return execution.execute(request, body);
            }
        });
        
        return restTemplate;
    }
} 