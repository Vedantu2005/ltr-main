import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StarRating from '../components/ui/StarRating';

describe('StarRating (rating interaction)', () => {
  test('clicking a star calls onChange with that star value', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<StarRating value={0} onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: '4 stars' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  test('arrow keys move the selection up and down', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<StarRating value={3} onChange={onChange} />);

    const star = screen.getByRole('radio', { name: '3 stars' });
    star.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(4);
  });

  test('readOnly mode renders no interactive buttons', () => {
    render(<StarRating value={3} readOnly />);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
});
