import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DashboardAdminControl from './DashboardAdminControl';

const mockStore = configureStore([]);

// Mock the rest client
jest.mock('../../services/restClient', () => ({
  service: jest.fn(() => ({
    find: jest.fn(() => Promise.resolve({ data: [] })),
    reAuthenticate: jest.fn(() => Promise.resolve({ user: { id: 1, role: 'admin' } }))
  }))
}));

// Mock chart.js components
jest.mock('react-chartjs-2', () => ({
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Line: () => <div data-testid="line-chart">Line Chart</div>
}));

describe('DashboardAdminControl Analytics', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: { id: 1, role: 'admin' },
        isLoggedIn: true
      }
    });
  });

  test('renders analytics dashboard with metrics', async () => {
    render(
      <Provider store={store}>
        <DashboardAdminControl />
      </Provider>
    );

    // Check if analytics section is rendered
    await waitFor(() => {
      expect(screen.getByText('📊 Analytics Dashboard')).toBeInTheDocument();
    });

    // Check if metric cards are rendered
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Total Vouchers')).toBeInTheDocument();
    expect(screen.getByText('Vouchers Redeemed')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg Points/User')).toBeInTheDocument();
  });

  test('renders chart sections', async () => {
    render(
      <Provider store={store}>
        <DashboardAdminControl />
      </Provider>
    );

    await waitFor(() => {
      // Check if chart sections are rendered
      expect(screen.getByText('Redeemed Vouchers by Category')).toBeInTheDocument();
      expect(screen.getByText('User Registration Trend (Last 6 Months)')).toBeInTheDocument();
      expect(screen.getByText('Voucher Redemption Trend (Last 6 Months)')).toBeInTheDocument();
      expect(screen.getByText('Most Popular Vouchers')).toBeInTheDocument();
      expect(screen.getByText('Top Performing Categories')).toBeInTheDocument();
      expect(screen.getByText('User Points Distribution')).toBeInTheDocument();
    });
  });

  test('shows no data state when no analytics data', async () => {
    render(
      <Provider store={store}>
        <DashboardAdminControl />
      </Provider>
    );

    await waitFor(() => {
      // Check for no data messages
      expect(screen.getByText('No redemption data available')).toBeInTheDocument();
      expect(screen.getByText('No user data available')).toBeInTheDocument();
    });
  });

  test('displays metric values correctly', async () => {
    render(
      <Provider store={store}>
        <DashboardAdminControl />
      </Provider>
    );

    await waitFor(() => {
      // Check if metric values are displayed (should be 0 initially)
      const metricValues = screen.getAllByText('0');
      expect(metricValues.length).toBeGreaterThan(0);
    });
  });
}); 