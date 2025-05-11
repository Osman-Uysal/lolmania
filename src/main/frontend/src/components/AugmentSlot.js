import React from 'react';
import { Box, Tooltip } from '@mui/material';

const AugmentSlot = ({ augmentId, augmentName }) => {
  if (!augmentId) {
    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '4px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      />
    );
  }

  return (
    <Tooltip title={augmentName || `Augment ${augmentId}`}>
      <img
        src={`https://raw.communitydragon.org/latest/game/assets/ux/tft/augments/${augmentId.toLowerCase()}.png`}
        alt={augmentName || `Augment ${augmentId}`}
        style={{
          width: 24,
          height: 24,
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        onError={(e) => {
          e.target.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/augments/${augmentId.toLowerCase()}.png`;
        }}
      />
    </Tooltip>
  );
};

export default AugmentSlot; 