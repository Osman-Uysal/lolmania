package com.lolanalytics.model;

import lombok.Data;

@Data
public class ChampionMastery {
    private String championId;
    private String championName;
    private int championLevel;
    private int championPoints;
    private long lastPlayTime;
    private int chestGranted;
    private int tokensEarned;
    private double winRate;
    private int gamesPlayed;
    private double kda;
    private String championIconUrl;
} 