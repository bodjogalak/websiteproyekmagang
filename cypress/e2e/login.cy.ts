describe('User Login Flow (Black Box Test)', () => {
  
  // Skenario 1 & 2: Halaman dimuat dan Login Berhasil (Happy Path)
  it('Should load elements and successfully log in with valid user credentials', () => {
    cy.visit('http://localhost:3000/login'); 

    // Checking visibility (Point 1) and typing user credentials
    cy.get('input[name="email"]').should('be.visible').type('fritz@gmail.com');
    cy.get('input[name="password"]').should('be.visible').type('asdf123', { log: false });
    
    // Clicking the button
    cy.get('button[type="submit"]').should('be.visible').click();

    // Verification (Point 2): Regular users go to /dashboard
    cy.url().should('include', '/dashboard');
    
    // Optional: If there is specific text on the user dashboard, check it here
    cy.contains('Portal Magang').should('be.visible'); 
  });

  // Skenario 3: Login Gagal (Sad Path)
  it('Should reject invalid credentials and show error message', () => {
    cy.visit('http://localhost:3000/login'); 

    // Entering fake credentials
    cy.get('input[name="email"]').type('pesertapalsu@email.com');
    cy.get('input[name="password"]').type('wrongpassword123');
    cy.get('button[type="submit"]').click();

    // Verification (Point 3): Check for the specific error message from your UI
    cy.contains('Email atau password salah').should('be.visible');
    
    // Ensure the user was NOT redirected to the user dashboard
    cy.url().should('not.include', '/dashboard');
  });

});