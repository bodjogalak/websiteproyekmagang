describe('Attendance Dashboard Flow (Black Box Test)', () => {
  
  beforeEach(() => {
    // 1. Robot Login
    cy.visit('http://localhost:3000/login'); 
    cy.get('input[name="email"]').type(Cypress.env('USER_EMAIL') as string);
    cy.get('input[name="password"]').type(Cypress.env('USER_PASSWORD') as string, { log: false });
    cy.get('button[type="submit"]').click();

    // 🌟 KUNCI PERBAIKAN: Tunggu sampai URL berubah menjadi /dashboard
    // Ini memastikan Next-Auth sudah selesai membuat session!
    cy.url().should('include', '/dashboard');

    // 2. Mencegat API Face Descriptor (agar Promise.all di React tidak error)
    cy.intercept('GET', '/api/user/face-descriptor', {
      statusCode: 200,
      body: { hasFace: true, descriptor: "[]" } // Data dummy
    }).as('getFaceData');

    // 3. Mencegat API status hari ini agar membalas "Sudah Absen Masuk" (PRESENT)
    cy.intercept('GET', '/api/attendance/today', {
      statusCode: 200,
      body: { status: 'PRESENT' }
    }).as('getTodayStatus');

    // 4. Setelah sesi aman dan jebakan API siap, baru kita kunjungi halamannya
    cy.visit('http://localhost:3000/dashboard/attendance');

    // 5. Tunggu komponen React memanggil kedua API tersebut
    cy.wait('@getFaceData');
    cy.wait('@getTodayStatus');
  });

  it('Should successfully open and submit the Break (Izin Keluar) modal', () => {
    cy.contains('Sudah Absen Masuk').should('be.visible');

    cy.intercept('POST', '/api/attendance/break', {
      statusCode: 200,
      body: { status: 'ON_BREAK' }
    }).as('submitBreak');

    cy.get('button').contains('Izin Keluar / Istirahat').click();
    cy.contains('Form Izin Keluar').should('be.visible');
    
    // Pastikan elemen textarea memang ada dan terlihat sebelum mengetik
    cy.get('textarea').should('be.visible').type('Keperluan bimbingan skripsi di kampus');

    cy.get('button').contains('Mulai Izin').click();
    cy.wait('@submitBreak');

    cy.contains('Sedang Istirahat').should('be.visible');
    cy.contains('Kembali Bekerja').should('be.visible');
  });

  it('Should successfully trigger the Check Out (Absen Pulang) camera mode', () => {
    // Robot menekan OK otomatis pada popup konfirmasi window.confirm()
    cy.on('window:confirm', () => true);

    // Pastikan elemen sudah dirender sepenuhnya sebelum diklik
    cy.contains('Sudah Absen Masuk').should('be.visible');
    
    cy.get('button').contains('Absen Pulang').click();

    cy.contains('Konfirmasi Pulang').should('be.visible');
    cy.contains('Senyum untuk Absen Pulang!').should('be.visible');
  });

});