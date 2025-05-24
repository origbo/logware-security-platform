/**
 * End-to-End Tests for Main User Workflows
 * 
 * These tests verify complete user journeys through the Logware Security Platform,
 * simulating real user interactions across multiple components.
 */

describe('User Workflows', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('[data-testid=email-input]').type('admin@logware.com');
    cy.get('[data-testid=password-input]').type('securePassword123');
    cy.get('[data-testid=login-button]').click();
    cy.url().should('include', '/dashboard');
  });

  it('Security Analyst Incident Response Workflow', () => {
    // Navigate to Alerts Dashboard
    cy.get('[data-testid=alerts-nav]').click();
    cy.url().should('include', '/alerts');
    
    // Filter for high severity alerts
    cy.get('[data-testid=severity-filter]').click();
    cy.get('[data-testid=high-severity]').click();
    cy.get('[data-testid=apply-filters]').click();
    
    // Select the first alert in the list
    cy.get('[data-testid=alert-item]').first().click();
    
    // Verify alert details are displayed
    cy.get('[data-testid=alert-details]').should('be.visible');
    cy.get('[data-testid=alert-title]').should('not.be.empty');
    
    // Create an incident from the alert
    cy.get('[data-testid=create-incident]').click();
    cy.get('[data-testid=incident-name]').type('Suspicious Login Activity');
    cy.get('[data-testid=incident-description]').type('Multiple failed login attempts from unusual location');
    cy.get('[data-testid=submit-incident]').click();
    
    // Verify incident was created and navigate to it
    cy.get('[data-testid=success-message]').should('contain', 'Incident created');
    cy.get('[data-testid=view-incident]').click();
    cy.url().should('include', '/incidents/');
    
    // Add a note to the incident
    cy.get('[data-testid=add-note]').click();
    cy.get('[data-testid=note-content]').type('Investigating source IP addresses');
    cy.get('[data-testid=submit-note]').click();
    
    // Run an automated playbook
    cy.get('[data-testid=run-playbook]').click();
    cy.get('[data-testid=playbook-list]').should('be.visible');
    cy.get('[data-testid=playbook-item]').contains('IP Investigation').click();
    cy.get('[data-testid=execute-playbook]').click();
    
    // Verify playbook started running
    cy.get('[data-testid=playbook-status]').should('contain', 'Running');
    
    // Wait for playbook to complete (this would have a longer timeout in real tests)
    cy.get('[data-testid=playbook-status]', { timeout: 10000 }).should('contain', 'Completed');
    
    // Check results and take action
    cy.get('[data-testid=playbook-results]').should('be.visible');
    cy.get('[data-testid=block-ip]').click();
    
    // Resolve the incident
    cy.get('[data-testid=resolve-incident]').click();
    cy.get('[data-testid=resolution-notes]').type('Blocked malicious IP addresses and reset affected user account');
    cy.get('[data-testid=confirm-resolution]').click();
    
    // Verify incident status changed
    cy.get('[data-testid=incident-status]').should('contain', 'Resolved');
  });

  it('Security Administrator Integration Setup Workflow', () => {
    // Navigate to Integration Manager
    cy.get('[data-testid=integrations-nav]').click();
    cy.url().should('include', '/integrations');
    
    // Add a new integration
    cy.get('[data-testid=add-integration]').click();
    
    // Select integration type
    cy.get('[data-testid=integration-type-select]').click();
    cy.get('[data-testid=integration-type-option]').contains('SIEM').click();
    
    // Fill in configuration details
    cy.get('[data-testid=integration-name]').type('Splunk SIEM');
    cy.get('[data-testid=integration-url]').type('https://splunk.example.com:8089');
    cy.get('[data-testid=integration-token]').type('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
    
    // Test connection
    cy.get('[data-testid=test-connection]').click();
    cy.get('[data-testid=connection-status]', { timeout: 10000 }).should('contain', 'Success');
    
    // Save integration
    cy.get('[data-testid=save-integration]').click();
    
    // Verify integration was added
    cy.get('[data-testid=integration-list]').should('contain', 'Splunk SIEM');
    cy.get('[data-testid=status-badge]').should('contain', 'Connected');
    
    // Configure data mapping
    cy.get('[data-testid=configure-mapping]').click();
    cy.get('[data-testid=map-field]').eq(0).type('source_ip');
    cy.get('[data-testid=map-field]').eq(1).type('dest_ip');
    cy.get('[data-testid=save-mapping]').click();
    
    // Enable the integration
    cy.get('[data-testid=toggle-integration]').click();
    
    // Check dashboard for integration status
    cy.get('[data-testid=dashboard-nav]').click();
    cy.get('[data-testid=integration-status-widget]').should('contain', 'Splunk SIEM');
    cy.get('[data-testid=integration-status-widget]').should('contain', 'Active');
  });

  it('Training and Documentation Workflow', () => {
    // Navigate to Training System
    cy.get('[data-testid=training-nav]').click();
    cy.url().should('include', '/training');
    
    // Browse available courses
    cy.get('[data-testid=course-library]').click();
    
    // Filter courses by role
    cy.get('[data-testid=role-filter]').click();
    cy.get('[data-testid=role-option]').contains('Analyst').click();
    
    // Select a course
    cy.get('[data-testid=course-card]').contains('Security Fundamentals').click();
    
    // Start the course
    cy.get('[data-testid=start-course]').click();
    
    // Navigate through course content
    cy.get('[data-testid=lesson-title]').should('be.visible');
    cy.get('[data-testid=next-lesson]').click();
    
    // Complete a quiz
    cy.get('[data-testid=quiz-option]').first().click();
    cy.get('[data-testid=submit-answer]').click();
    cy.get('[data-testid=feedback-message]').should('be.visible');
    cy.get('[data-testid=continue-button]').click();
    
    // Check documentation for related information
    cy.get('[data-testid=docs-nav]').click();
    cy.url().should('include', '/documentation');
    
    // Search documentation
    cy.get('[data-testid=search-docs]').type('security fundamentals');
    cy.get('[data-testid=search-results]').should('be.visible');
    cy.get('[data-testid=result-item]').first().click();
    
    // View documentation page
    cy.get('[data-testid=doc-content]').should('be.visible');
    
    // Return to training
    cy.get('[data-testid=training-nav]').click();
    
    // Verify progress was saved
    cy.get('[data-testid=progress-indicator]').should('exist');
    cy.get('[data-testid=progress-percentage]').should('not.contain', '0%');
  });
});
