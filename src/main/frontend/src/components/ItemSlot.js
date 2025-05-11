import React from 'react';
import { Box, Tooltip } from '@mui/material';

const ItemSlot = ({ itemId }) => {
  if (!itemId || itemId === 0) {
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
    <Tooltip title={`Item ${itemId}`}>
      <img
        src={`https://ddragon.leagueoflegends.com/cdn/14.9.1/img/item/${itemId}.png`}
        alt={`Item ${itemId}`}
        style={{
          width: 24,
          height: 24,
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      />
    </Tooltip>
  );
};

export default ItemSlot; 