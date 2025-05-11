package com.lolanalytics.service;

import com.lolanalytics.model.ChampionMastery;
import com.lolanalytics.model.Match;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;
import java.time.Instant;

@Service
public class ChampionMasteryService {
    
    private static final Logger logger = LoggerFactory.getLogger(ChampionMasteryService.class);
    
    @Autowired
    private RiotApiService riotApiService;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private ChampionDataService championDataService;
    
    private static class CacheEntry {
        List<ChampionMastery> data;
        Instant timestamp;
        CacheEntry(List<ChampionMastery> data, Instant timestamp) {
            this.data = data;
            this.timestamp = timestamp;
        }
    }
    private final Map<String, CacheEntry> masteryCache = new HashMap<>();
    private static final long CACHE_TTL_SECONDS = 300; // 5 minutes
    
    public List<ChampionMastery> getChampionMasteries(String region, String puuid) {
        String cacheKey = region + ":" + puuid;
        CacheEntry entry = masteryCache.get(cacheKey);
        Instant now = Instant.now();
        if (entry != null && now.minusSeconds(CACHE_TTL_SECONDS).isBefore(entry.timestamp)) {
            logger.info("Returning cached champion masteries for {}", cacheKey);
            return entry.data;
        }
        String url = String.format("https://%s.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/%s",
                region, puuid);
        logger.info("Requesting champion masteries: region={}, puuid={}, url={}", region, puuid, url);
        List<Map<String, Object>> masteryData = null;
        try {
            masteryData = restTemplate.getForObject(url, List.class);
            logger.info("Received mastery data: {} entries", masteryData != null ? masteryData.size() : 0);
        } catch (Exception e) {
            logger.error("Error fetching champion masteries from Riot API: {}", e.getMessage(), e);
        }
        List<ChampionMastery> masteries = new ArrayList<>();
        
        if (masteryData != null) {
            for (Map<String, Object> data : masteryData) {
                ChampionMastery mastery = new ChampionMastery();
                mastery.setChampionId(String.valueOf(data.get("championId")));
                mastery.setChampionLevel((Integer) data.get("championLevel"));
                mastery.setChampionPoints((Integer) data.get("championPoints"));
                mastery.setLastPlayTime((Long) data.get("lastPlayTime"));
                String championName = getChampionName(mastery.getChampionId());
                mastery.setChampionName(championName);
                Boolean chestGranted = (Boolean) data.get("chestGranted");
                mastery.setChestGranted(Boolean.TRUE.equals(chestGranted) ? 1 : 0);
                mastery.setTokensEarned((Integer) data.get("tokensEarned"));
                mastery.setChampionIconUrl(String.format(
                    "https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/%s.png",
                    championName
                ));
                
                masteries.add(mastery);
            }
        }
        
        // Sort by champion points
        masteries.sort((a, b) -> b.getChampionPoints() - a.getChampionPoints());
        
        masteryCache.put(cacheKey, new CacheEntry(masteries, now));
        return masteries;
    }
    
    public Map<String, Object> getChampionStats(String region, String puuid, List<Match> matches) {
        Map<String, Object> stats = new HashMap<>();
        Map<String, List<Match>> championMatches = matches.stream()
            .collect(Collectors.groupingBy(Match::getChampionName));
            
        List<Map<String, Object>> championStats = new ArrayList<>();
        
        for (Map.Entry<String, List<Match>> entry : championMatches.entrySet()) {
            String championName = entry.getKey();
            List<Match> championGames = entry.getValue();
            
            Map<String, Object> championStat = new HashMap<>();
            championStat.put("championName", championName);
            championStat.put("gamesPlayed", championGames.size());
            
            int wins = (int) championGames.stream().filter(Match::isWin).count();
            double winRate = (double) wins / championGames.size() * 100;
            championStat.put("winRate", winRate);
            
            double avgKDA = championGames.stream()
                .mapToDouble(m -> (m.getKills() + m.getAssists()) / (double) Math.max(1, m.getDeaths()))
                .average()
                .orElse(0.0);
            championStat.put("averageKDA", avgKDA);
            
            double avgDamage = championGames.stream()
                .mapToDouble(Match::getTotalDamageDealt)
                .average()
                .orElse(0.0);
            championStat.put("averageDamage", avgDamage);
            
            championStats.add(championStat);
        }
        
        stats.put("championStats", championStats);
        stats.put("totalGames", matches.size());
        stats.put("mostPlayedChampion", championStats.stream()
            .max(Comparator.comparingInt(m -> (Integer) m.get("gamesPlayed")))
            .map(m -> m.get("championName"))
            .orElse("Unknown"));
            
        return stats;
    }
    
    private String getChampionName(String championId) {
        return championDataService.getChampionName(championId);
    }
} 