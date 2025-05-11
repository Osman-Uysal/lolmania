package com.lolanalytics.controller;

import com.lolanalytics.model.Player;
import com.lolanalytics.model.Match;
import com.lolanalytics.service.RiotApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/player")
public class PlayerController {
    
    private static final Logger logger = LoggerFactory.getLogger(PlayerController.class);
    
    @Autowired
    private RiotApiService riotApiService;
    
    @GetMapping("/{region}/player")
    public ResponseEntity<Player> getPlayerInfo(
            @PathVariable String region,
            @RequestParam String riotId) {
        try {
            // Decode the Riot ID
            String decodedRiotId = URLDecoder.decode(riotId, StandardCharsets.UTF_8.toString());
            logger.info("Fetching player info for region: {}, riotId: {}", region, decodedRiotId);
            Player player = riotApiService.getPlayerBySummonerName(region, decodedRiotId);
            return ResponseEntity.ok(player);
        } catch (Exception e) {
            logger.error("Error fetching player info for region: {}, riotId: {}", region, riotId, e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{region}/player/matches")
    public ResponseEntity<List<Match>> getMatchHistory(
            @PathVariable String region,
            @RequestParam String riotId,
            @RequestParam(defaultValue = "10") int count) {
        try {
            // Decode the Riot ID
            String decodedRiotId = URLDecoder.decode(riotId, StandardCharsets.UTF_8.toString());
            logger.info("Fetching match history for region: {}, riotId: {}, count: {}", region, decodedRiotId, count);
            List<Match> matches = riotApiService.getMatchHistory(region, decodedRiotId);
            return ResponseEntity.ok(matches);
        } catch (Exception e) {
            logger.error("Error fetching match history for region: {}, riotId: {}", region, riotId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{region}/match-details")
    public ResponseEntity<?> getMatchDetails(
            @PathVariable String region,
            @RequestParam String matchId) {
        try {
            logger.info("Fetching match details for region: {}, matchId: {}", region, matchId);
            Map matchDetails = riotApiService.getMatchDetailsFull(region, matchId);
            return ResponseEntity.ok(matchDetails);
        } catch (Exception e) {
            logger.error("Error fetching match details for region: {}, matchId: {}", region, matchId, e);
            return ResponseEntity.status(500).body("Error loading match details: " + e.getMessage());
        }
    }
} 