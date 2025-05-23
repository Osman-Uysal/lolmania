# League of Legends Analytics Platform

A web application that provides analytics and insights for League of Legends players.

## Live Demo

The application is deployed and available at: [https://lol-analytics.onrender.com](https://lol-analytics.onrender.com)

## Local Development

### Prerequisites

- Java 17 or higher
- Maven
- Riot Games API key

### Quick Start

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd lol_analytics
   ```

2. Get your Riot Games API key from [Riot Games Developer Portal](https://developer.riotgames.com/)

3. Add your API key to `src/main/resources/application.properties`:
   ```properties
   riot.api.key=your_api_key_here
   ```

4. Build and run the application:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

The application will be available at `http://localhost:8080`

## Features

- Player profile lookup with Riot ID support (gameName#tagLine)
- Detailed match history analysis
- Rank information and statistics
- Champion performance tracking
- Match details including:
  - KDA statistics
  - Damage dealt
  - Gold earned
  - Vision score
  - Arena augment information (for Arena matches)
- Profile icons and champion icons from Data Dragon

## API Endpoints

- `GET /api/player/{region}/{riotId}` - Get player information
  - Example: `/api/player/na1/PlayerName#TAG`
  - Returns: Player profile, rank, and statistics

- `GET /api/player/{region}/{riotId}/matches` - Get match history
  - Returns: List of recent matches with detailed statistics

- `GET /api/match/{region}/{matchId}` - Get detailed match information
  - Returns: Complete match data including all participants

## Supported Regions

The application supports the following regions:
- NA1 (North America)
- BR1 (Brazil)
- LA1, LA2 (Latin America)
- OC1 (Oceania)
- EUW1 (Europe West)
- EUN1 (Europe Nordic & East)
- TR1 (Turkey)
- RU (Russia)
- KR (Korea)
- JP1 (Japan)

## Technologies Used

- Spring Boot
- Spring Web (RestTemplate)
- Data Dragon Integration for game assets
- Riot Games API v5

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/lolanalytics/
│   │       ├── controller/
│   │       ├── model/
│   │       │   ├── Player.java
│   │       │   └── Match.java
│   │       ├── service/
│   │       │   └── RiotApiService.java
│   │       └── LolAnalyticsApplication.java
│   └── resources/
│       └── application.properties
```

## Contributing

Feel free to submit issues and enhancement requests!

