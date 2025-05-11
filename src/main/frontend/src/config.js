const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://lolmania.onrender.com/api'
    : (process.env.REACT_APP_API_URL || 'http://localhost:8080/api');

export const API_ENDPOINTS = {
  player: (region, riotId) => `${API_BASE_URL}/player/${region}/player?riotId=${encodeURIComponent(riotId)}`,
  matches: (region, riotId, count) => 
    `${API_BASE_URL}/player/${region}/player/matches?riotId=${encodeURIComponent(riotId)}&count=${count}`,
  matchDetails: (region, matchId) => `${API_BASE_URL}/player/${region}/match-details?matchId=${encodeURIComponent(matchId)}`,
  chatbotTips: (riotId) => `${API_BASE_URL}/chatbot/tips/${encodeURIComponent(riotId)}`,
  randomTip: `${API_BASE_URL}/chatbot/random-tip`,
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
}; 