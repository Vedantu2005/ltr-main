import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '../components/ui/Pagination';

describe('Pagination', () => {
  test('renders a range summary and disables Previous on page 1', () => {
    render(<Pagination page={1} totalPages={3} total={25} limit={10} onPageChange={() => {}} />);
    expect(screen.getByText(/showing 1–10 of 25/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
  });

  test('clicking Next calls onPageChange with page + 1', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={1} totalPages={3} total={25} limit={10} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: /next page/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test('clicking a page number navigates directly to that page', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={1} totalPages={3} total={25} limit={10} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: '3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test('single-page results hide the pager controls', () => {
    render(<Pagination page={1} totalPages={1} total={4} limit={10} onPageChange={() => {}} />);
    expect(screen.queryByRole('button', { name: /next page/i })).not.toBeInTheDocument();
    expect(screen.getByText('4 results')).toBeInTheDocument();
  });
});
