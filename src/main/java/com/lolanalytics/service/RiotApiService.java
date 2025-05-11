package com.lolanalytics.service;

import com.lolanalytics.model.Player;
import com.lolanalytics.model.Match;
import com.merakianalytics.orianna.types.core.league.LeagueEntry;
import com.merakianalytics.orianna.types.core.match.MatchHistory;
import com.merakianalytics.orianna.types.core.match.Participant;
import com.merakianalytics.orianna.types.core.match.ParticipantStats;
import com.merakianalytics.orianna.types.core.summoner.Summoner;
import org.joda.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class RiotApiService {
    
    @Value("${riot.api.key}")
    private String apiKey;
    
    private final RestTemplate restTemplate;
    private static final String RIOT_API_BASE_URL = "https://{region}.api.riotgames.com";
    private static final String DDRAGON_PROFILE_ICON_URL = "https://ddragon.leagueoflegends.com/cdn/14.9.1/img/profileicon/";
    private static final String DDRAGON_CHAMPION_ICON_URL = "https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/";
    
    public RiotApiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private String getRegionalRouting(String platformRegion) {
        switch (platformRegion.toLowerCase()) {
            case "na1":
            case "br1":
            case "la1":
            case "la2":
            case "oc1":
                return "americas";
            case "euw1":
            case "eun1":
            case "tr1":
            case "ru":
                return "europe";
            case "kr":
            case "jp1":
                return "asia";
            default:
                return "americas";
        }
    }

    public Player getPlayerBySummonerName(String region, String riotId) {
        // Split Riot ID into gameName and tagLine
        String[] parts = riotId.split("#");
        String gameName = parts[0];
        String tagLine = parts.length > 1 ? parts[1] : "NA1";
        String regionalRouting = getRegionalRouting(region);
        // 1. Get account info (PUUID)
        String accountUrl = "https://" + regionalRouting + ".api.riotgames.com/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}";
        Map account = restTemplate.getForObject(accountUrl, Map.class, gameName, tagLine);
        String puuid = (String) account.get("puuid");
        // 2. Get summoner info by PUUID
        String summonerUrl = "https://" + region + ".api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}";
        Map summoner = restTemplate.getForObject(summonerUrl, Map.class, puuid);
        Player player = new Player();
        player.setPuuid(puuid);
        player.setSummonerName((String) summoner.get("name"));
        player.setTagLine(tagLine);
        player.setSummonerLevel(summoner.get("summonerLevel") != null ? ((Number) summoner.get("summonerLevel")).intValue() : 0);
        player.setProfileIconId(summoner.get("profileIconId") != null ? ((Number) summoner.get("profileIconId")).intValue() : 0);
        player.setProfileIconUrl(DDRAGON_PROFILE_ICON_URL + player.getProfileIconId() + ".png");
        // 3. Get rank info
        String summonerId = (String) summoner.get("id");
        String leagueUrl = "https://" + region + ".api.riotgames.com/lol/league/v4/entries/by-summoner/{summonerId}";
        List leagueEntries = restTemplate.getForObject(leagueUrl, List.class, summonerId);
        if (leagueEntries != null && !leagueEntries.isEmpty()) {
            for (Object entryObj : leagueEntries) {
                Map entry = (Map) entryObj;
                if ("RANKED_SOLO_5x5".equals(entry.get("queueType"))) {
                    player.setTier((String) entry.get("tier"));
                    player.setRank((String) entry.get("rank"));
                    player.setLeaguePoints(entry.get("leaguePoints") != null ? ((Number) entry.get("leaguePoints")).intValue() : 0);
                    player.setWins(entry.get("wins") != null ? ((Number) entry.get("wins")).intValue() : 0);
                    player.setLosses(entry.get("losses") != null ? ((Number) entry.get("losses")).intValue() : 0);
                    break;
                }
            }
        }
        return player;
    }
    
    public List<Match> getMatchHistory(String region, String riotId) {
        Player player = getPlayerBySummonerName(region, riotId);
        String puuid = player.getPuuid();
        String regionalRouting = getRegionalRouting(region);
        String url = "https://" + regionalRouting + ".api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids";
        String[] matchIds = restTemplate.getForObject(url, String[].class, puuid);
        List<Match> matches = new ArrayList<>();
        for (String matchId : matchIds) {
            matches.add(getMatchDetails(region, matchId, puuid));
        }
        return matches;
    }

    // New: Fetch detailed match info for modal
    public Map getMatchDetailsFull(String region, String matchId) {
        String regionalRouting = getRegionalRouting(region);
        String matchUrl = "https://" + regionalRouting + ".api.riotgames.com/lol/match/v5/matches/{matchId}";
        Map matchData = restTemplate.getForObject(matchUrl, Map.class, matchId);
        return matchData;
    }

    // Helper: Fetch and map match for summary table
    public Match getMatchDetails(String region, String matchId, String puuid) {
        String regionalRouting = getRegionalRouting(region);
        String matchUrl = "https://" + regionalRouting + ".api.riotgames.com/lol/match/v5/matches/{matchId}";
        Map matchData = restTemplate.getForObject(matchUrl, Map.class, matchId);
        if (matchData == null) return null;
        Map info = (Map) matchData.get("info");
        List participants = (List) info.get("participants");
        Map participant = null;
        for (Object p : participants) {
            Map part = (Map) p;
            if (puuid.equals(part.get("puuid"))) {
                participant = part;
                break;
            }
        }
        if (participant == null) return null;
        Match match = new Match();
        match.setMatchId(matchId);
        match.setChampionName((String) participant.get("championName"));
        match.setKills(participant.get("kills") != null ? ((Number) participant.get("kills")).intValue() : 0);
        match.setDeaths(participant.get("deaths") != null ? ((Number) participant.get("deaths")).intValue() : 0);
        match.setAssists(participant.get("assists") != null ? ((Number) participant.get("assists")).intValue() : 0);
        match.setTotalDamageDealt(participant.get("totalDamageDealtToChampions") != null ? ((Number) participant.get("totalDamageDealtToChampions")).intValue() : 0);
        match.setGoldEarned(participant.get("goldEarned") != null ? ((Number) participant.get("goldEarned")).intValue() : 0);
        match.setVisionScore(participant.get("visionScore") != null ? ((Number) participant.get("visionScore")).intValue() : 0);
        match.setWin(Boolean.TRUE.equals(participant.get("win")));
        match.setChampionIconUrl(DDRAGON_CHAMPION_ICON_URL + participant.get("championName") + ".png");
        match.setQueueId(info.get("queueId") != null ? ((Number) info.get("queueId")).intValue() : 0);
        
        // Add augment information for Arena matches
        if (match.getQueueId() == 1700) {
            List<String> augments = (List<String>) participant.get("augments");
            if (augments != null) {
                match.setAugments(augments);
                // Get augment names if available
                List<String> augmentNames = new ArrayList<>();
                for (String augmentId : augments) {
                    // You might want to fetch augment names from a separate API or maintain a mapping
                    augmentNames.add(augmentId); // For now, just use the IDs as names
                }
                match.setAugmentNames(augmentNames);
            }
        }
        
        return match;
    }
} 