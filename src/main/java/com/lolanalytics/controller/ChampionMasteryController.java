package com.lolanalytics.controller;

import com.lolanalytics.model.ChampionMastery;
import com.lolanalytics.model.Match;
import com.lolanalytics.service.ChampionMasteryService;
import com.lolanalytics.service.RiotApiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/champion-mastery")
public class ChampionMasteryController {
    
    private static final Logger logger = LoggerFactory.getLogger(ChampionMasteryController.class);
    
    @Autowired
    private ChampionMasteryService championMasteryService;
    
    @Autowired
    private RiotApiService riotApiService;
    
    @GetMapping("/{region}/masteries")
    public ResponseEntity<List<ChampionMastery>> getChampionMasteries(
            @PathVariable String region,
            @RequestParam String riotId) {
        try {
            String decodedRiotId = java.net.URLDecoder.decode(riotId, java.nio.charset.StandardCharsets.UTF_8.toString());
            logger.info("Decoded riotId: {} for region: {}", decodedRiotId, region);
            String puuid = riotApiService.getPlayerBySummonerName(region, decodedRiotId).getPuuid();
            List<ChampionMastery> masteries = championMasteryService.getChampionMasteries(region, puuid);
            return ResponseEntity.ok(masteries);
        } catch (Exception e) {
            logger.error("Error in getChampionMasteries for region: {}, riotId: {}: {}", region, riotId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{region}/stats")
    public ResponseEntity<Map<String, Object>> getChampionStats(
            @PathVariable String region,
            @RequestParam String riotId) {
        try {
            String decodedRiotId = java.net.URLDecoder.decode(riotId, java.nio.charset.StandardCharsets.UTF_8.toString());
            logger.info("Decoded riotId: {} for region: {}", decodedRiotId, region);
            String puuid = riotApiService.getPlayerBySummonerName(region, decodedRiotId).getPuuid();
            List<Match> matches = riotApiService.getMatchHistory(region, decodedRiotId);
            Map<String, Object> stats = championMasteryService.getChampionStats(region, puuid, matches);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error in getChampionStats for region: {}, riotId: {}: {}", region, riotId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
} 