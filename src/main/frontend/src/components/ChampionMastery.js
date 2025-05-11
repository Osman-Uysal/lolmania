import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import InfoIcon from '@mui/icons-material/Info';
import config from '../config';

const ChampionMastery = ({ region, riotId, showDetailedStatsOnly = false }) => {
  const [masteries, setMasteries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [masteriesRes, statsRes] = await Promise.all([
          fetch(config.API_BASE_URL + `/champion-mastery/${region}/masteries?riotId=${encodeURIComponent(riotId)}`),
          fetch(config.API_BASE_URL + `/champion-mastery/${region}/stats?riotId=${encodeURIComponent(riotId)}`)
        ]);

        if (!masteriesRes.ok || !statsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const masteriesData = await masteriesRes.json();
        const statsData = await statsRes.json();

        setMasteries(masteriesData);
        setStats(statsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [region, riotId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const topChampions = masteries.slice(0, 5);
  const chartData = stats?.championStats?.map(stat => ({
    name: stat.championName,
    winRate: stat.winRate,
    gamesPlayed: stat.gamesPlayed,
    kda: stat.averageKDA,
  })) || [];

  if (showDetailedStatsOnly) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detailed Champion Statistics
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Champion</TableCell>
                  <TableCell>Games</TableCell>
                  <TableCell>Win Rate</TableCell>
                  <TableCell>Average KDA</TableCell>
                  <TableCell>Average Damage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats?.championStats?.map((stat) => (
                  <TableRow key={stat.championName}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/${stat.championName}.png`}
                          alt={stat.championName}
                          style={{ width: 24, height: 24, marginRight: 8, borderRadius: 4 }}
                          onError={e => e.target.style.display = 'none'}
                        />
                        {stat.championName}
                      </Box>
                    </TableCell>
                    <TableCell>{stat.gamesPlayed}</TableCell>
                    <TableCell>{stat.winRate.toFixed(1)}%</TableCell>
                    <TableCell>{stat.averageKDA.toFixed(2)}</TableCell>
                    <TableCell>{Math.round(stat.averageDamage).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Top Champions Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Champions
                <Tooltip title="Your highest mastery champions">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Champion</TableCell>
                      <TableCell>Level</TableCell>
                      <TableCell>Points</TableCell>
                      <TableCell>Last Played</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topChampions.map((mastery) => (
                      <TableRow key={mastery.championId}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <img
                              src={mastery.championIconUrl}
                              alt={mastery.championName}
                              style={{ width: 32, height: 32, marginRight: 8, borderRadius: 4 }}
                              onError={e => e.target.style.display = 'none'}
                            />
                            {mastery.championName}
                          </Box>
                        </TableCell>
                        <TableCell>{mastery.championLevel}</TableCell>
                        <TableCell>{mastery.championPoints.toLocaleString()}</TableCell>
                        <TableCell>
                          {new Date(mastery.lastPlayTime).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Champion Stats Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Champion Performance
                <Tooltip title="Win rates and performance metrics for your champions">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="winRate" name="Win Rate %" fill="#8884d8" />
                    <Bar dataKey="kda" name="Average KDA" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChampionMastery; 