import React from 'react';
import { render, screen } from '@testing-library/react';
import ItemSlot from './ItemSlot';

describe('ItemSlot', () => {
  it('renders an empty slot when no itemId is provided', () => {
    render(<ItemSlot />);
    // Should render a box, not an image
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders an empty slot when itemId is 0', () => {
    render(<ItemSlot itemId={0} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders an empty slot when itemId is invalid', () => {
    render(<ItemSlot itemId={null} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders an item image when itemId is provided', () => {
    render(<ItemSlot itemId={1001} />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('1001.png');
  });

  it('renders correct alt text for the image', () => {
    render(<ItemSlot itemId={2003} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Item 2003');
  });
}); 