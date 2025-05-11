import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  IconButton,
  Tooltip,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ItemSlot from './ItemSlot';
import AugmentSlot from './AugmentSlot';
import ChampionMastery from './ChampionMastery';

const QUEUE_ID_TO_MODE = {
  420: 'Ranked Solo',
  430: 'Normal Blind',
  440: 'Ranked Flex',
  450: 'ARAM',
  700: 'Clash',
  900: 'URF',
  1020: 'One for All',
  1700: 'Arena',
  400: 'Normal Draft',
  0: 'Custom',
};

const SPELL_ID_TO_NAME = {
  21: 'SummonerBarrier',
  1: 'SummonerBoost',
  14: 'SummonerDot',
  3: 'SummonerExhaust',
  4: 'SummonerFlash',
  6: 'SummonerHaste',
  7: 'SummonerHeal',
  13: 'SummonerMana',
  30: 'SummonerPoroRecall',
  31: 'SummonerPoroThrow',
  11: 'SummonerSmite',
  39: 'SummonerSnowURFSnowball_Mark',
  32: 'SummonerSnowball',
  12: 'SummonerTeleport',
  54: 'Summoner_UltBookPlaceholder',
  55: 'Summoner_UltBookSmitePlaceholder',
};

const RUNE_ID_TO_ICON = {
  // Example: 8005: 'perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png',
};
const FALLBACK_RUNE_ICON = 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png';

// Arena team colors
const ARENA_TEAM_COLORS = [
  { bg: '#1e293b', text: '#60a5fa' }, // Blue
  { bg: '#991b1b', text: '#f87171' }, // Red
  { bg: '#064e3b', text: '#6ee7b7' }, // Green
  { bg: '#713f12', text: '#fbbf24' }, // Yellow
  { bg: '#581c87', text: '#d8b4fe' }, // Purple
  { bg: '#831843', text: '#fb7185' }, // Pink
  { bg: '#1e3a8a', text: '#93c5fd' }, // Light Blue
  { bg: '#3f6212', text: '#bef264' }, // Lime
];

const RuneTooltip = ({ rune }) => (
  <Box>
    <Typography variant="subtitle2">{rune.name}</Typography>
    <Typography variant="body2">{rune.description}</Typography>
  </Box>
);

function PlayerProfile() {
  const { region, summonerName } = useParams();
  const [player, setPlayer] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMatch, setModalMatch] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [tips, setTips] = useState(null);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const decodedRiotId = decodeURIComponent(summonerName);
        const [playerResponse, matchesResponse] = await Promise.all([
          axios.get(`/api/player/${region}/player`, { 
            params: { riotId: decodedRiotId }
          }),
          axios.get(`/api/player/${region}/player/matches`, { 
            params: { riotId: decodedRiotId, count: 10 }
          }),
        ]);
        setPlayer(playerResponse.data);
        setMatches(matchesResponse.data);
        // Generate tips using Gemini
        setTipsLoading(true);
        try {
          const prompt = buildPrompt(playerResponse.data, matchesResponse.data);
          const aiResponse = await axios.post('/api/gemini/chat', prompt);
          setTips(aiResponse.data || 'Tips are currently unavailable.');
        } catch (error) {
          setTips('Unable to generate tips at this time. Please try again later.');
        } finally {
          setTipsLoading(false);
        }
      } catch (err) {
        setError(err.response?.data || 'Error fetching player data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [region, summonerName]);

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

  const handleRowClick = async (matchId) => {
    setModalLoading(true);
    setModalOpen(true);
    try {
      const res = await axios.get(`/api/player/${region}/match-details`, { 
        params: { 
          matchId 
        }
      });
      setModalMatch(res.data);
    } catch (e) {
      console.error('Error fetching match details:', e);
      setModalMatch(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalMatch(null);
  };

  const formatRank = (tier, rank) => {
    if (!tier) return 'Unranked';
    return `${tier} ${rank || ''}`.trim();
  };

  const renderTeams = (modalMatch) => {
    if (modalMatch.info.queueId === 1700) { // Arena Mode
      const teams = [];
      for (let i = 0; i < 8; i++) {
        const teamMembers = Array.isArray(modalMatch.info.participants) ? modalMatch.info.participants.filter(p => Math.floor(p.teamId / 100) === i) : [];
        if (teamMembers.length > 0) {
          teams.push({
            members: teamMembers,
            color: ARENA_TEAM_COLORS[i],
            placement: i + 1
          });
        }
      }
      
      // Sort teams by placement
      teams.sort((a, b) => a.placement - b.placement);
      
      return Array.isArray(teams) && teams.map((team, index) => (
        <Paper 
          key={index} 
          sx={{ 
            mb: 1,
            p: 1,
            background: team.color.bg,
            borderRadius: '8px',
            border: `1px solid ${team.color.text}40`
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="subtitle2" color={team.color.text}>
              {`${team.placement}${getOrdinalSuffix(team.placement)}`}
            </Typography>
            <Typography variant="body2" color={team.color.text}>
              Team {team.members[0].teamId}
            </Typography>
          </Box>
          
          {Array.isArray(team.members) && team.members.map((p, i) => (
            <Box 
              key={p.puuid || i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: i < team.members.length - 1 ? 1 : 0,
                p: 1,
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
              }}
            >
              {/* Champion Icon & Level */}
              <Box position="relative">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/${p.championName}.png`}
                  alt={p.championName}
                  style={{ width: 40, height: 40, borderRadius: '4px' }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '0 4px',
                    borderRadius: '4px',
                    fontSize: '0.7rem'
                  }}
                >
                  {p.champLevel}
                </Typography>
              </Box>

              {/* Summoner Spells */}
              <Box display="flex" flexDirection="column" gap={0.5}>
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.9.1/img/spell/${SPELL_ID_TO_NAME[p.summoner1Id] || 'SummonerFlash'}.png`}
                  alt="Summoner 1"
                  style={{ width: 20, height: 20, borderRadius: '2px' }}
                />
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.9.1/img/spell/${SPELL_ID_TO_NAME[p.summoner2Id] || 'SummonerFlash'}.png`}
                  alt="Summoner 2"
                  style={{ width: 20, height: 20, borderRadius: '2px' }}
                />
              </Box>

              {/* Augments */}
              <Box display="flex" gap={0.5}>
                {p.augments && p.augments.map((augmentId, idx) => (
                  <AugmentSlot 
                    key={idx} 
                    augmentId={augmentId} 
                    augmentName={p.augmentNames ? p.augmentNames[idx] : null}
                  />
                ))}
              </Box>

              {/* Player Name */}
              <Box flexGrow={1}>
                <Typography variant="body2" color={team.color.text}>
                  {p.summonerName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {`${p.kills}/${p.deaths}/${p.assists}`}
                </Typography>
              </Box>

              {/* Damage */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {p.totalDamageDealtToChampions.toLocaleString()}
                </Typography>
              </Box>

              {/* Gold */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {p.goldEarned.toLocaleString()}
                </Typography>
              </Box>

              {/* Items */}
              <Box display="flex" gap={0.5}>
                {[...Array(7)].map((_, idx) => (
                  <ItemSlot key={idx} itemId={p[`item${idx}`]} />
                ))}
              </Box>
            </Box>
          ))}
        </Paper>
      ));
    } else {
      // Regular 5v5 teams rendering
      const blueTeam = Array.isArray(modalMatch.info.participants) ? modalMatch.info.participants.filter(p => p.teamId === 100) : [];
      const redTeam = Array.isArray(modalMatch.info.participants) ? modalMatch.info.participants.filter(p => p.teamId === 200) : [];
      
      return (
        <>
          {/* Blue Team */}
          <Paper sx={{ mb: 2, p: 2, background: '#1e293b' }}>
            <Typography variant="subtitle2" color="#60a5fa" gutterBottom>Blue Team</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Summoner</TableCell>
                    <TableCell>Champion</TableCell>
                    <TableCell>KDA</TableCell>
                    <TableCell>Damage</TableCell>
                    <TableCell>Gold</TableCell>
                    <TableCell>Vision</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Summoners</TableCell>
                    <TableCell>Runes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(blueTeam) && blueTeam.map((p, i) => (
                    <TableRow key={p.puuid || i}>
                      <TableCell>{p.summonerName}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/${p.championName}.png`}
                            alt={p.championName}
                            style={{ width: 32, height: 32, marginRight: 8, borderRadius: '4px' }}
                          />
                          {p.championName}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {p.kills}/{p.deaths}/{p.assists}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {((p.kills + p.assists) / Math.max(1, p.deaths)).toFixed(2)} KDA
                        </Typography>
                      </TableCell>
                      <TableCell>{p.totalDamageDealtToChampions.toLocaleString()}</TableCell>
                      <TableCell>{p.goldEarned.toLocaleString()}</TableCell>
                      <TableCell>{p.visionScore}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          {[...Array(7)].map((_, idx) => {
                            const itemId = p[`item${idx}`];
                            return itemId && itemId !== 0 ? (
                              <img
                                key={itemId}
                                src={`https://ddragon.leagueoflegends.com/cdn/14.9.1/img/item/${itemId}.png`}
                                alt={`Item ${idx}`}
                                style={{ width: 24, height: 24, borderRadius: '2px' }}
                              />
                            ) : null;
                          })}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/14.9.1/img/spell/${SPELL_ID_TO_NAME[p.summoner1Id] || 'SummonerFlash'}.png`}
                            alt="Summoner 1"
                            style={{ width: 24, height: 24, borderRadius: '2px' }}
                          />
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/14.9.1/img/spell/${SPELL_ID_TO_NAME[p.summoner2Id] || 'SummonerFlash'}.png`}
                            alt="Summoner 2"
                            style={{ width: 24, height: 24, borderRadius: '2px' }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <img
                            src={RUNE_ID_TO_ICON[p.perks.styles[0].selections[0].perk] ? `https://ddragon.leagueoflegends.com/cdn/img/${RUNE_ID_TO_ICON[p.perks.styles[0].selections[0].perk]}` : FALLBACK_RUNE_ICON}
                            alt="Primary Rune"
                            style={{ width: 24, height: 24, borderRadius: '2px' }}
                          />
                          <img
                            src={RUNE_ID_TO_ICON[p.perks.styles[1].selections[0].perk] ? `https://ddragon.leagueoflegends.com/cdn/img/${RUNE_ID_TO_ICON[p.perks.styles[1].selections[0].perk]}` : FALLBACK_RUNE_ICON}
                            alt="Secondary Rune"
                            style={{ width: 24, height: 24, borderRadius: '2px' }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          {/* Red Team */}
          <Paper sx={{ mb: 2, p: 2, background: '#991b1b' }}>
            <Typography variant="subtitle2" color="#f87171" gutterBottom>Red Team</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Summoner</TableCell>
                    <TableCell>Champion</TableCell>
                    <TableCell>KDA</TableCell>
                    <TableCell>Damage</TableCell>
                    <TableCell>Gold</TableCell>
                    <TableCell>Vision</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Summoners</TableCell>
                    <TableCell>Runes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(redTeam) && redTeam.map((p, i) => (
                    <TableRow key={p.puuid || i}>
                      <TableCell>{p.summonerName}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/${p.championName}.png`}
                            alt={p.championName}
                            style={{ width: 32, height: 32, marginRight: 8, borderRadius: '4px' }}
                          />
                          {p.championName}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {p.kills}/{p.deaths}/{p.assists}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {((p.kills + p.assists) / Math.max(1, p.deaths)).toFixed(2)} KDA
                        </Typography>
                      </TableCell>
                      <TableCell>{p.totalDamageDealtToChampions.toLocaleString()}</TableCell>
                      <TableCell>{p.goldEarned.toLocaleString()}</TableCell>
                      <TableCell>{p.visionScore}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          {[...Array(7)].map((_, idx) => {
                            const itemId = p[`item${idx}`];
                            return itemId && itemId !== 0 ? (
                              <img
                                key={itemId}
                                src={`https://ddragon.leagueoflegends.com/cdn/14.9.1/img/item/${itemId}.png`}
                                alt={`Item ${idx}`}
                                style={{ width: 24, height: 24, borderRadius: '2px' }}
                              />
                            ) : null;
                          })}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/14.9.1/img/spell/${SPELL_ID_TO_NAME[p.summoner1Id] || 'SummonerFlash'}.png`}
                            alt="Summoner 1"
                            style={{ width: 24, height: 24, borderRadius: '2px' }}
                          />
                          <img
                            src={`https://ddragon.leagueoflegends.com/cdn/14.9.1/img/spell/${SPELL_ID_TO_NAME[p.summoner2Id] || 'SummonerFlash'}.png`}
                            alt="Summoner 2"
                            style={{ width: 24, height: 24, borderRadius: '2px' }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <img
                            src={RUNE_ID_TO_ICON[p.perks.styles[0].selections[0].perk] ? `https://ddragon.leagueoflegends.com/cdn/img/${RUNE_ID_TO_ICON[p.perks.styles[0].selections[0].perk]}` : FALLBACK_RUNE_ICON}
                            alt="Primary Rune"
                            style={{ width: 24, height: 24, borderRadius: '2px' }}
                          />
                          <img
                            src={RUNE_ID_TO_ICON[p.perks.styles[1].selections[0].perk] ? `https://ddragon.leagueoflegends.com/cdn/img/${RUNE_ID_TO_ICON[p.perks.styles[1].selections[0].perk]}` : FALLBACK_RUNE_ICON}
                            alt="Secondary Rune"
                            style={{ width: 24, height: 24, borderRadius: '2px' }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      );
    }
  };

  // Helper function for ordinal suffixes
  const getOrdinalSuffix = (i) => {
    const j = i % 10,
          k = i % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <img
                    src={player.profileIconUrl}
                    alt="Profile Icon"
                    style={{ width: 100, height: 100, marginRight: 16, borderRadius: '50%' }}
                  />
                  <Box>
                    <Typography variant="h5">
                      {player.summonerName}
                      <Typography variant="caption" display="block" color="text.secondary">
                        #{player.tagLine}
                      </Typography>
                    </Typography>
                    <Typography variant="subtitle1">
                      Level {player.summonerLevel}
                    </Typography>
                    <Typography variant="subtitle2" color="primary">
                      {formatRank(player.tier, player.rank)} - {player.leaguePoints} LP
                    </Typography>
                    <Typography variant="body2">
                      {player.wins}W {player.losses}L ({((player.wins / (player.wins + player.losses)) * 100).toFixed(1)}%)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Region: {region.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
                {tips && (
                  <Box mt={2}>
                    <Typography variant="h6" gutterBottom>
                      Personalized Tips
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
                      {typeof tips === 'string' ? tips : 'Tips are currently unavailable.'}
                    </Typography>
                  </Box>
                )}
                {tipsLoading && (
                  <Box display="flex" justifyContent="center" mt={2}>
                    <CircularProgress size={20} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <ChampionMastery region={region} riotId={summonerName} />
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ mt: 3 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
                <Tab label="Match History" />
                <Tab label="Detailed Champion Stats" />
              </Tabs>
              <Box sx={{ p: 2 }}>
                {tab === 0 && (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Game Mode</TableCell>
                          <TableCell>Champion</TableCell>
                          <TableCell>KDA</TableCell>
                          <TableCell>Damage</TableCell>
                          <TableCell>Gold</TableCell>
                          <TableCell>Vision</TableCell>
                          <TableCell>Result</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.isArray(matches) && matches.map((match, idx) => (
                          <TableRow 
                            key={match.matchId || idx} 
                            hover 
                            style={{ cursor: 'pointer' }} 
                            onClick={() => handleRowClick(match.matchId)}
                          >
                            <TableCell>{QUEUE_ID_TO_MODE[match.queueId] || 'Unknown'}</TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <img 
                                  src={match.championIconUrl} 
                                  alt={match.championName} 
                                  style={{ width: 32, height: 32, marginRight: 8, borderRadius: '4px' }} 
                                />
                                {match.championName}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {match.kills}/{match.deaths}/{match.assists}
                              <Typography variant="caption" display="block" color="text.secondary">
                                {((match.kills + match.assists) / Math.max(1, match.deaths)).toFixed(2)} KDA
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {match.totalDamageDealt.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {match.goldEarned.toLocaleString()}
                            </TableCell>
                            <TableCell>{match.visionScore}</TableCell>
                            <TableCell>
                              <Typography 
                                color={match.win ? 'success.main' : 'error.main'}
                                fontWeight="bold"
                              >
                                {match.win ? 'Victory' : 'Defeat'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                {tab === 1 && (
                  <ChampionMastery region={region} riotId={summonerName} showDetailedStatsOnly />
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      {/* Match Details Modal */}
      <Modal 
        open={modalOpen} 
        onClose={handleCloseModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{
          position: 'relative',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          width: '90%',
          maxWidth: 1200,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 2,
        }}>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>

          {modalLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : modalMatch ? (
            <>
              <Typography variant="h6" gutterBottom>
                Match Details
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Game Mode: {QUEUE_ID_TO_MODE[modalMatch.info.queueId] || 'Unknown'} | Game Duration: {Math.round(modalMatch.info.gameDuration / 60)} minutes
              </Typography>
              
              {renderTeams(modalMatch)}
            </>
          ) : (
            <Typography color="error">Error loading match details.</Typography>
          )}
        </Box>
      </Modal>
    </Container>
  );
}

export default PlayerProfile;