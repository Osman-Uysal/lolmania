import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import config from '../config';

// Available regions
const REGIONS = [
  { value: 'na1', label: 'North America' },
  { value: 'euw1', label: 'Europe West' },
  { value: 'eun1', label: 'Europe Nordic & East' },
  { value: 'kr', label: 'Korea' },
  { value: 'br1', label: 'Brazil' },
  { value: 'jp1', label: 'Japan' },
  { value: 'ru', label: 'Russia' },
  { value: 'oc1', label: 'Oceania' },
  { value: 'tr1', label: 'Turkey' },
  { value: 'la1', label: 'Latin America North' },
  { value: 'la2', label: 'Latin America South' }
];

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summonerName, setSummonerName] = useState('');
  const [region, setRegion] = useState('na1');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        text: 'Welcome to the LoL Analytics Chatbot! You can ask for tips about specific champions, game strategies, or enter a summoner name to get personalized advice. Please select your region first.',
        isBot: true,
      },
    ]);

    // Configure axios defaults
    axios.defaults.baseURL = config.API_BASE_URL;
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    setError(null);

    const userMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let response = '';
      if (input.toLowerCase().includes('summoner')) {
        // Extract summoner name and tag from input (e.g., "summoner Pluto#1234")
        const nameMatch = input.match(/summoner\s+([^\s#]+)(?:#(\w+))?/i);
        if (nameMatch) {
          const gameName = nameMatch[1];
          const tagLine = nameMatch[2] || 'NA1'; // Default to NA1 if no tag provided
          const riotId = `${gameName}#${tagLine}`;
          setSummonerName(riotId);
          try {
            // Get player data from backend
            const encodedRiotId = encodeURIComponent(riotId);
            const playerData = await axios.get(`/api/player/${region}/player`, { 
              params: { 
                riotId: encodedRiotId
              }
            });
            const matchesData = await axios.get(`/api/player/${region}/player/matches`, { 
              params: { 
                riotId: encodedRiotId, 
                count: 10 
              }
            });
            // Use Gemini to generate personalized tips
            const prompt = buildPrompt(playerData.data, matchesData.data);
            const aiResponse = await axios.post('/api/gemini/chat', prompt);
            response = aiResponse.data || 'Sorry, I could not generate a tip at this time.';
          } catch (error) {
            let errorMsg = 'An unexpected error occurred. Please try again.';
            if (error && typeof error === 'object') {
              if (error.message) {
                errorMsg = error.message;
              } else if (error.error && typeof error.error === 'object') {
                errorMsg = error.error.message || JSON.stringify(error.error);
              } else {
                errorMsg = JSON.stringify(error, null, 2);
              }
            } else if (typeof error === 'string') {
              errorMsg = error;
            }
            setError(errorMsg);
            setMessages((prev) => [
              ...prev,
              { text: errorMsg, isBot: true },
            ]);
            setLoading(false);
            return;
          }
        } else {
          response = 'Please provide a valid summoner name (and optional tag) after "summoner". Example: "summoner PlayerName#TAG"';
        }
      } else {
        // Use Gemini for general queries
        const prompt = `You are a League of Legends expert. Answer this question about League of Legends: ${input}. Keep the response concise and helpful.`;
        const aiResponse = await axios.post('/api/gemini/chat', prompt);
        response = aiResponse.data || 'Sorry, I could not generate a tip at this time.';
      }
      setMessages((prev) => [
        ...prev,
        { text: response, isBot: true },
      ]);
    } catch (error) {
      console.error('Error:', error);
      let errorMsg = 'An unexpected error occurred. Please try again.';
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMsg = error.message;
        } else if (error.error && typeof error.error === 'object') {
          errorMsg = error.error.message || JSON.stringify(error.error);
        } else {
          errorMsg = JSON.stringify(error, null, 2);
        }
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      setError(errorMsg);
      setMessages((prev) => [
        ...prev,
        { text: errorMsg, isBot: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const buildPrompt = (player, matches) => {
    let prompt = `Analyze this League of Legends player's performance and provide personalized tips:\n\n`;
    prompt += `Player: ${player.summonerName}\n`;
    prompt += `Level: ${player.summonerLevel}\n`;
    prompt += `Rank: ${player.tier} ${player.rank}\n`;
    prompt += `Win/Loss: ${player.wins}/${player.losses}\n\n`;
    prompt += `Recent Matches:\n`;
    matches.forEach(match => {
      prompt += `- ${match.championName}: ${match.kills}/${match.deaths}/${match.assists} (Win: ${match.win})\n`;
    });
    prompt += `\nBased on this data, provide 3 specific, actionable tips to improve their gameplay. Keep the response concise.`;
    return prompt;
  };

  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mt: 4,
          display: 'flex',
          flexDirection: 'column',
          height: '70vh',
        }}
      >
        <Typography variant="h5" gutterBottom>
          LoL Analytics Chatbot
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <FormControl sx={{ mb: 2 }}>
          <InputLabel id="region-select-label">Region</InputLabel>
          <Select
            labelId="region-select-label"
            value={region}
            label="Region"
            onChange={(e) => setRegion(e.target.value)}
          >
            {REGIONS.map((region) => (
              <MenuItem key={region.value} value={region.value}>
                {region.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            mb: 2,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
          }}
        >
          <List>
            {messages.map((message, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={message.text}
                    secondary={message.isBot ? 'Bot' : 'You'}
                    sx={{
                      textAlign: message.isBot ? 'left' : 'right',
                      bgcolor: message.isBot ? 'action.hover' : 'primary.light',
                      p: 2,
                      borderRadius: 2,
                    }}
                  />
                </ListItem>
                {index < messages.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {loading && (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            )}
          </List>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={loading}
            endIcon={<SendIcon />}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Chatbot; 