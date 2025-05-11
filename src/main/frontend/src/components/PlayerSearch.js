import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const REGIONS = [
  { value: 'na1', label: 'North America (NA1)' },
  { value: 'euw1', label: 'Europe West (EUW1)' },
  { value: 'eun1', label: 'Europe Nordic & East (EUN1)' },
  { value: 'kr', label: 'Korea (KR)' },
  { value: 'jp1', label: 'Japan (JP1)' },
  { value: 'br1', label: 'Brazil (BR1)' },
  { value: 'la1', label: 'Latin America North (LA1)' },
  { value: 'la2', label: 'Latin America South (LA2)' },
  { value: 'oc1', label: 'Oceania (OC1)' },
  { value: 'tr1', label: 'Turkey (TR1)' },
  { value: 'ru', label: 'Russia (RU)' },
  { value: 'sg2', label: 'Singapore (SG2)' },
  { value: 'ph2', label: 'Philippines (PH2)' },
  { value: 'tw2', label: 'Taiwan (TW2)' },
  { value: 'vn2', label: 'Vietnam (VN2)' },
  { value: 'th2', label: 'Thailand (TH2)' },
];

function PlayerSearch() {
  const [riotId, setRiotId] = useState('');
  const [region, setRegion] = useState('na1');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (riotId.trim()) {
      // Ensure there's a tag by adding #NA1 if no tag is provided
      let searchId = riotId.trim();
      if (!searchId.includes('#')) {
        searchId += '#NA1';
      }
      // Double encode the Riot ID to handle special characters properly
      const encodedRiotId = encodeURIComponent(searchId);
      navigate(`/player/${region}/${encodedRiotId}`);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            League of Legends Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Enter a Riot ID and select your region to view player statistics, match history, and personalized tips
          </Typography>
          <Box component="form" onSubmit={handleSearch} sx={{ width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Riot ID"
                  variant="outlined"
                  value={riotId}
                  onChange={(e) => setRiotId(e.target.value)}
                  placeholder="PlayerName#NA1"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Region</InputLabel>
                  <Select
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
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<SearchIcon />}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default PlayerSearch; 