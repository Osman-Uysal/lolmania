const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://lolmania.onrender.com/api'
    : (process.env.REACT_APP_API_URL || 'http://localhost:8080/api');

export const API_ENDPOINTS = {
  player: (region, summonerName) => `${API_BASE_URL}/player/${region}/player?summonerName=${encodeURIComponent(summonerName)}`,
  matches: (region, summonerName, count) => 
    `${API_BASE_URL}/player/${region}/player/matches?summonerName=${encodeURIComponent(summonerName)}&count=${count}`,
  matchDetails: (region, matchId) => `${API_BASE_URL}/player/${region}/match-details?matchId=${encodeURIComponent(matchId)}`,
  chatbotTips: (summonerName) => `${API_BASE_URL}/chatbot/tips/${encodeURIComponent(summonerName)}`,
  randomTip: `${API_BASE_URL}/chatbot/random-tip`,
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
}; 