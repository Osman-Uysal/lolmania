package com.lolanalytics.model;

import lombok.Data;
import org.joda.time.LocalDateTime;
import java.util.List;

@Data
public class Match {
    private String matchId;
    private LocalDateTime gameCreation;
    private String championName;
    private String championIconUrl;
    private int kills;
    private int deaths;
    private int assists;
    private int totalDamageDealt;
    private int goldEarned;
    private int visionScore;
    private boolean win;
    private String summonerSpell1;
    private String summonerSpell2;
    private String primaryRune;
    private String secondaryRune;
    private int queueId;
    private int teamId;
    private List<String> augments;
    private List<String> augmentNames;

    public List<String> getAugments() {
        return augments;
    }

    public void setAugments(List<String> augments) {
        this.augments = augments;
    }

    public List<String> getAugmentNames() {
        return augmentNames;
    }

    public void setAugmentNames(List<String> augmentNames) {
        this.augmentNames = augmentNames;
    }
} 