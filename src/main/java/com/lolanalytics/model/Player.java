package com.lolanalytics.model;

import lombok.Data;

@Data
public class Player {
    private String summonerName;
    private String tagLine;
    private int summonerLevel;
    private int profileIconId;
    private String profileIconUrl;
    private String tier;
    private String rank;
    private int leaguePoints;
    private int wins;
    private int losses;
    private String puuid;
} 