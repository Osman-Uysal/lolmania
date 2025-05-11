const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  player: (summonerName) => `${API_BASE_URL}/player/${summonerName}`,
  matches: (summonerName, count) => 
    `${API_BASE_URL}/player/${summonerName}/matches?count=${count}`,
  chatbotTips: (summonerName) => 
    `${API_BASE_URL}/chatbot/tips/${summonerName}`,
  randomTip: `${API_BASE_URL}/chatbot/random-tip`,
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
}; 