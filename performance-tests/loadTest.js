/**
 * Performance Load Testing Script for Logware Security Platform
 * 
 * This script uses k6 (https://k6.io/) to perform load testing on the platform's API endpoints.
 * It simulates concurrent users performing various operations to measure performance under load.
 */

import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// Define custom metrics
const alertsProcessed = new Counter('alerts_processed');
const dashboardLoadTime = new Trend('dashboard_load_time');
const searchResponseTime = new Trend('search_response_time');

// Test data
const users = new SharedArray('users', function() {
  return [
    { username: 'analyst1', password: 'Password123!' },
    { username: 'analyst2', password: 'Password123!' },
    { username: 'admin1', password: 'AdminPass123!' },
    { username: 'manager1', password: 'ManagerPass123!' }
  ];
});

// Load testing configuration for different scenarios
export let options = {
  scenarios: {
    // Smoke test - just checking if the system works
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      tags: { test_type: 'smoke' },
    },
    // Load test - normal load the system should handle without issues
    load: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 0 },
      ],
      tags: { test_type: 'load' },
    },
    // Stress test - finding the system's breaking point
    stress: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 },
      ],
      tags: { test_type: 'stress' },
    },
    // Spike test - sudden increase in users
    spike: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '10s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '10s', target: 5 },
      ],
      tags: { test_type: 'spike' },
    },
    // Soak test - long duration testing
    soak: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '2m', target: 20 },
        { duration: '30m', target: 20 },
        { duration: '2m', target: 0 },
      ],
      tags: { test_type: 'soak' },
    },
  },
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests must complete below 500ms
    'http_req_failed': ['rate<0.01'], // http errors should be less than 1%
    'dashboard_load_time': ['p(95)<1000'], // 95% of dashboard loads should be under 1000ms
    'search_response_time': ['p(95)<2000'], // 95% of searches should return in under 2000ms
  },
};

// Setup function - runs once per VU
export function setup() {
  const baseUrl = __ENV.API_URL || 'http://localhost:8080/api';
  return { baseUrl };
}

// Default function - main VU code
export default function(data) {
  const { baseUrl } = data;
  const user = users[Math.floor(Math.random() * users.length)];
  let authToken;
  
  // Login
  const loginRes = http.post(`${baseUrl}/auth/login`, JSON.stringify({
    username: user.username,
    password: user.password
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200 && r.json('token') !== undefined,
  });
  
  if (loginRes.status === 200) {
    authToken = loginRes.json('token');
    
    // Set common headers for all future requests
    const params = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
    };
    
    // Dashboard Load Test
    const startDashboard = new Date();
    const dashboardRes = http.get(`${baseUrl}/dashboard/metrics`, params);
    const dashboardDuration = new Date() - startDashboard;
    
    check(dashboardRes, {
      'dashboard loaded': (r) => r.status === 200,
    });
    
    dashboardLoadTime.add(dashboardDuration);
    
    // Sleep between requests to simulate user behavior
    sleep(Math.random() * 3 + 1);
    
    // Alerts List Test
    const alertsRes = http.get(`${baseUrl}/alerts?limit=100&offset=0`, params);
    
    check(alertsRes, {
      'alerts retrieved': (r) => r.status === 200,
    });
    
    if (alertsRes.status === 200) {
      const alerts = alertsRes.json('alerts') || [];
      alertsProcessed.add(alerts.length);
      
      // If alerts exist, get details for one
      if (alerts.length > 0) {
        const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
        http.get(`${baseUrl}/alerts/${randomAlert.id}`, params);
      }
    }
    
    sleep(Math.random() * 2 + 1);
    
    // Search Test
    const searchTerms = ['login', 'failure', 'suspicious', 'malware', 'unauthorized'];
    const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    const startSearch = new Date();
    const searchRes = http.post(`${baseUrl}/search`, JSON.stringify({
      query: searchTerm,
      filters: {
        timeRange: '24h',
        severity: ['high', 'critical']
      }
    }), params);
    const searchDuration = new Date() - startSearch;
    
    check(searchRes, {
      'search successful': (r) => r.status === 200,
    });
    
    searchResponseTime.add(searchDuration);
    
    // Logout
    http.post(`${baseUrl}/auth/logout`, null, params);
  }
  
  // Sleep between iterations
  sleep(Math.random() * 5 + 2);
}

// Teardown function - runs at the end
export function teardown(data) {
  // Report any cleanup or final stats
  console.log('Load test complete');
}
