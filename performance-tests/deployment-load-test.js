import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';

// Custom metrics
const errorRate = new Rate('error_rate');
const apiCalls = new Counter('api_calls');
const authLatency = new Trend('auth_latency');
const incidentLatency = new Trend('incident_latency');
const dashboardLatency = new Trend('dashboard_latency');
const trainingLatency = new Trend('training_latency');

// Configuration
const API_BASE_URL = __ENV.API_BASE_URL || 'http://localhost:8080/api';
const THINK_TIME_MIN = 1;
const THINK_TIME_MAX = 5;

// Options for the test
export const options = {
  scenarios: {
    smoke_test: {
      executor: 'constant-vus',
      vus: 5,
      duration: '1m',
      tags: { test_type: 'smoke' },
    },
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up to 50 users over 2 minutes
        { duration: '5m', target: 50 },   // Stay at 50 users for 5 minutes
        { duration: '2m', target: 0 },    // Ramp down to 0 users over 2 minutes
      ],
      tags: { test_type: 'load' },
      startTime: '1m30s',
    },
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },  // Ramp up to 100 users over 2 minutes
        { duration: '5m', target: 100 },  // Stay at 100 users for 5 minutes
        { duration: '5m', target: 200 },  // Ramp up to 200 users over 5 minutes
        { duration: '3m', target: 200 },  // Stay at 200 users for 3 minutes
        { duration: '2m', target: 0 },    // Ramp down to 0 users
      ],
      tags: { test_type: 'stress' },
      startTime: '9m',
    },
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 0 },
        { duration: '1m', target: 300 },  // Quick spike to 300 users
        { duration: '3m', target: 300 },  // Maintain for 3 minutes
        { duration: '1m', target: 0 },    // Quick drop off
      ],
      tags: { test_type: 'spike' },
      startTime: '20m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1500'],
    'http_req_duration{stage:login}': ['p(95)<400'],
    'http_req_duration{stage:dashboard}': ['p(95)<600'],
    'http_req_duration{stage:incidents}': ['p(95)<800'],
    'http_req_duration{stage:training}': ['p(95)<1000'],
    error_rate: ['rate<0.1'],  // Error rate should be less than 10%
  },
};

// Utility function to simulate user think time
function think() {
  sleep(randomIntBetween(THINK_TIME_MIN, THINK_TIME_MAX));
}

// Setup function that runs once per VU
export function setup() {
  console.log(`Starting load test against ${API_BASE_URL}`);
  return { startTime: new Date().toISOString() };
}

// Main function
export default function() {
  let token;
  
  group('Authentication', function() {
    const loginStart = new Date();
    const loginRes = http.post(`${API_BASE_URL}/auth/login`, JSON.stringify({
      email: 'loadtest@example.com',
      password: 'LoadTest123!',
    }), {
      headers: { 'Content-Type': 'application/json' },
      tags: { stage: 'login' },
    });
    
    const loginDuration = new Date() - loginStart;
    authLatency.add(loginDuration);
    apiCalls.add(1);
    
    check(loginRes, {
      'login status is 200': (r) => r.status === 200,
      'login has token': (r) => r.json('token') !== undefined,
    }) || errorRate.add(1);
    
    if (loginRes.status === 200) {
      token = loginRes.json('token');
    }
    
    think();
  });
  
  if (!token) {
    console.error('Authentication failed, skipping further requests');
    return;
  }
  
  // Common headers for authenticated requests
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  group('Dashboard', function() {
    const dashStart = new Date();
    const dashRes = http.get(`${API_BASE_URL}/dashboard/summary`, {
      headers: authHeaders,
      tags: { stage: 'dashboard' },
    });
    
    const dashDuration = new Date() - dashStart;
    dashboardLatency.add(dashDuration);
    apiCalls.add(1);
    
    check(dashRes, {
      'dashboard status is 200': (r) => r.status === 200,
      'dashboard data is valid': (r) => r.json('stats') !== undefined,
    }) || errorRate.add(1);
    
    think();
  });
  
  group('Incidents', function() {
    const incidentStart = new Date();
    const incidentsRes = http.get(`${API_BASE_URL}/incidents?limit=10&page=1`, {
      headers: authHeaders,
      tags: { stage: 'incidents' },
    });
    
    const incidentDuration = new Date() - incidentStart;
    incidentLatency.add(incidentDuration);
    apiCalls.add(1);
    
    check(incidentsRes, {
      'incidents status is 200': (r) => r.status === 200,
      'incidents data is array': (r) => Array.isArray(r.json('incidents')),
    }) || errorRate.add(1);
    
    // View a specific incident if any are available
    if (incidentsRes.status === 200 && Array.isArray(incidentsRes.json('incidents')) && incidentsRes.json('incidents').length > 0) {
      const incidentId = incidentsRes.json('incidents')[0].id;
      
      const detailRes = http.get(`${API_BASE_URL}/incidents/${incidentId}`, {
        headers: authHeaders,
        tags: { stage: 'incidents' },
      });
      
      apiCalls.add(1);
      
      check(detailRes, {
        'incident detail status is 200': (r) => r.status === 200,
        'incident detail data is valid': (r) => r.json('id') === incidentId,
      }) || errorRate.add(1);
    }
    
    think();
  });
  
  group('Training', function() {
    const trainingStart = new Date();
    const coursesRes = http.get(`${API_BASE_URL}/training/courses`, {
      headers: authHeaders,
      tags: { stage: 'training' },
    });
    
    const trainingDuration = new Date() - trainingStart;
    trainingLatency.add(trainingDuration);
    apiCalls.add(1);
    
    check(coursesRes, {
      'courses status is 200': (r) => r.status === 200,
      'courses data is array': (r) => Array.isArray(r.json('courses')),
    }) || errorRate.add(1);
    
    // View a specific course if any are available
    if (coursesRes.status === 200 && Array.isArray(coursesRes.json('courses')) && coursesRes.json('courses').length > 0) {
      const courseId = coursesRes.json('courses')[0].id;
      
      const courseDetailRes = http.get(`${API_BASE_URL}/training/courses/${courseId}`, {
        headers: authHeaders,
        tags: { stage: 'training' },
      });
      
      apiCalls.add(1);
      
      check(courseDetailRes, {
        'course detail status is 200': (r) => r.status === 200,
        'course detail data is valid': (r) => r.json('id') === courseId,
      }) || errorRate.add(1);
    }
    
    think();
  });
}

// Teardown function that runs at the end of the test
export function teardown(data) {
  const endTime = new Date().toISOString();
  console.log(`Load test completed. Started at ${data.startTime}, ended at ${endTime}`);
}
