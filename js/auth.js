// ===== AUTH.JS — Autentifikimi =====

const Auth = {
  currentUser: null,

  init() {
    const saved = localStorage.getItem('eKonkursiUser');
    if (saved) this.currentUser = JSON.parse(saved);
  },

  login(email, password, role) {
    const user = DB.users.find(u =>
      u.email === email && u.password === password && u.role === role
    );
    if (user) {
      this.currentUser = user;
      localStorage.setItem('eKonkursiUser', JSON.stringify(user));
      return { ok: true, user };
    }
    return { ok: false, msg: 'Email, fjalëkalim ose rol i pasaktë!' };
  },

  register(name, email, password, role = 'kandidat') {
    const exists = DB.users.find(u => u.email === email);
    if (exists) return { ok: false, msg: 'Ky email është i regjistruar paraprakisht!' };

    const newUser = {
      id: DB.users.length + 1,
      name,
      email,
      password,
      role: role,
      code: role === 'kandidat' ? 'K-' + (1000 + DB.users.length + 1) : null
    };

    DB.users.push(newUser);
    saveDB();
    
    // Auto login after register
    this.currentUser = newUser;
    localStorage.setItem('eKonkursiUser', JSON.stringify(newUser));
    
    return { ok: true, user: newUser };
  },

  resetPassword(email, newPassword) {
    const userIndex = DB.users.findIndex(u => u.email === email);
    if (userIndex === -1) return { ok: false, msg: 'Ky email nuk ekziston në sistem!' };

    DB.users[userIndex].password = newPassword;
    saveDB();
    return { ok: true, msg: 'Fjalëkalimi u ndryshua me sukses!' };
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('eKonkursiUser');
    window.location.href = 'index.html';
  },

  requireAuth(allowedRoles = []) {
    if (!this.currentUser) {
      window.location.href = 'index.html';
      return false;
    }
    if (allowedRoles.length && !allowedRoles.includes(this.currentUser.role)) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  isLoggedIn() { return !!this.currentUser; },
  getUser()    { return this.currentUser; },
  getRole()    { return this.currentUser?.role; },
};

Auth.init();
