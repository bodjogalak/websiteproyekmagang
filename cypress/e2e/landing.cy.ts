describe('Landing Page Smoke Test', () => {
  it('should load the homepage successfully', () => {
    // 1. Visit your local dev site
    // Ensure 'npm run dev' is running in another terminal!
    cy.visit('http://localhost:3000');

    // 2. Check if your main title is there
    // Tip: Use a word you know is on your landing page
    cy.contains('Magang').should('be.visible');
    
    // 3. Check if the login link/button exists
    cy.contains('Login').should('be.visible');
  });
});