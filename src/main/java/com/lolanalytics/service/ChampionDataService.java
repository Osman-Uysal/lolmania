package com.lolanalytics.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Service
public class ChampionDataService {
    private final Map<String, String> championIdToName = new HashMap<>();

    @Value("${ddragon.version:14.9.1}")
    private String ddragonVersion;

    @PostConstruct
    public void loadChampionData() {
        String url = String.format("https://ddragon.leagueoflegends.com/cdn/%s/data/en_US/champion.json", ddragonVersion);
        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> data = restTemplate.getForObject(url, Map.class);
        if (data != null && data.containsKey("data")) {
            Map<String, Object> champions = (Map<String, Object>) data.get("data");
            for (Object champObj : champions.values()) {
                Map<String, Object> champ = (Map<String, Object>) champObj;
                String key = (String) champ.get("key"); // numeric string
                String name = (String) champ.get("id"); // e.g. "Aatrox"
                championIdToName.put(key, name);
            }
        }
    }

    public String getChampionName(String championId) {
        return championIdToName.getOrDefault(championId, "Unknown");
    }

    public Map<String, String> getChampionIdToName() {
        return championIdToName;
    }
} 