/* ============================================
   الملف: script.js
   الوصف: ملف الجافاسكريبت الرئيسي
   ============================================ */

const App = {
  currentUser: null,
  books: []
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
  renderBooks();
  loadUserFromStorage();
  setupScrollHandler();
});

function initApp() {
  console.log('✅ تم تحميل التطبيق بنجاح');
}

// ===== إدارة النماذج =====
function showLoginForm() {
  closeModal();
  document.getElementById('loginModal').style.display = 'block';
  document.getElementById('modalOverlay').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function showSignupForm() {
  closeModal();
  document.getElementById('signupModal').style.display = 'block';
  document.getElementById('modalOverlay').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('loginModal').style.display = 'none';
  document.getElementById('signupModal').style.display = 'none';
  document.getElementById('modalOverlay').style.display = 'none';
  document.body.style.overflow = '';
}

function switchToSignup() {
  document.getElementById('loginModal').style.display = 'none';
  document.getElementById('signupModal').style.display = 'block';
}

function switchToLogin() {
  document.getElementById('signupModal').style.display = 'none';
  document.getElementById('loginModal').style.display = 'block';
}

// ===== إدارة المستخدمين =====
function loadUserFromStorage() {
  try {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      App.currentUser = JSON.parse(savedUser);
      updateAuthUI();
    }
  } catch (error) {
    console.error('❌ خطأ في تحميل المستخدم:', error);
    localStorage.removeItem('currentUser');
  }
}

function saveUserToStorage(user) {
  App.currentUser = user;
  const { password, ...safeUser } = user;
  localStorage.setItem('currentUser', JSON.stringify(safeUser));
  updateAuthUI();
  closeModal();
  showToast(`مرحباً ${user.name} 👋`, 'success');
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  // محاكاة تسجيل الدخول
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    saveUserToStorage(user);
    document.getElementById('loginForm').reset();
  } else {
    showToast('❌ البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
  }
}

function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  
  if (password !== confirmPassword) {
    showToast('❌ كلمة المرور غير متطابقة', 'error');
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  if (users.some(u => u.email === email)) {
    showToast('❌ البريد الإلكتروني موجود بالفعل', 'error');
    return;
  }
  
  const newUser = { name, email, password };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  saveUserToStorage(newUser);
  document.getElementById('signupForm').reset();
}

function logout() {
  App.currentUser = null;
  localStorage.removeItem('currentUser');
  updateAuthUI();
  showToast('تم تسجيل الخروج بنجاح ✓', 'success');
}

function updateAuthUI() {
  const authSection = document.getElementById('authSection');
  const userSection = document.getElementById('userSection');
  
  if (App.currentUser) {
    authSection.style.display = 'none';
    userSection.style.display = 'flex';
    document.getElementById('userNameDisplay').textContent = App.currentUser.name || 'مستخدم';
    const firstLetter = (App.currentUser.name || 'U').charAt(0);
    document.getElementById('userAvatar').src = `1.jpg`;
  } else {
    authSection.style.display = 'flex';
    userSection.style.display = 'none';
  }
}

// ===== التنقل =====
function hideAllPages() {
  document.querySelectorAll('.page-section').forEach(page => page.hidden = true);
  document.querySelectorAll('#homeSection').forEach(section => section.classList.remove('hidden'));
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showPage(pageName) {
  hideAllPages();
  document.querySelectorAll('#homeSection').forEach(section => section.classList.add('hidden'));
  const targetPage = document.getElementById(`${pageName}-page`);
  if (targetPage) {
    targetPage.hidden = false;
    updatePageTitle(pageName);
  }
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('onclick')?.includes(pageName)) link.classList.add('active');
  });
}

function showStage(stageName) {
  hideAllPages();
  document.querySelectorAll('#homeSection').forEach(section => section.classList.add('hidden'));
  const videosPage = document.getElementById('videos-page');
  if (videosPage) {
    videosPage.hidden = false;
    updatePageTitle('videos');
  }
  document.querySelectorAll('.stage-content').forEach(stage => stage.hidden = true);
  const targetStage = document.getElementById(`${stageName}-stage`);
  if (targetStage) targetStage.hidden = false;
  updatePageTitle('videos');
}

function goHome() {
  hideAllPages();
  updatePageTitle('home');
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  document.querySelector('.nav-link:first-child')?.classList.add('active');
}

function updatePageTitle(pageName) {
  const titles = {
    home: 'علي النجار – أستاذ اللغة الإنجليزية',
    books: 'مكتبة الكتب - علي النجار',
    videos: 'فيديوهات الشرح - علي النجار'
  };
  document.title = titles[pageName] || titles.home;
}

// ===== القائمة الجانبية =====
function setupMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const closeBtn = document.getElementById('closeSidebar');
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (!menuBtn) return;
  
  menuBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
  
  closeBtn.addEventListener('click', closeMobileMenu);
  overlay.addEventListener('click', closeMobileMenu);
}

function closeMobileMenu() {
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

window.closeMobileMenu = closeMobileMenu;

// ===== الكتب =====
function generateBooksData() {
  const books = [
    // المرحلة الابتدائية - 6 كتب
    { id: 1, title: 'اللغة الإنجليزية - الصف الأول الابتدائي', level: 'primary', cover: '1.jpg', pages: 120, size: '15.2 MB' },
    { id: 2, title: 'اللغة الإنجليزية - الصف الثاني الابتدائي', level: 'primary', cover: '2.jpg', pages: 135, size: '16.5 MB' },
    { id: 3, title: 'اللغة الإنجليزية - الصف الثالث الابتدائي', level: 'primary', cover: '3.jpg', pages: 142, size: '17.8 MB' },
    { id: 4, title: 'اللغة الإنجليزية - الصف الرابع الابتدائي', level: 'primary', cover: '4.jpg', pages: 158, size: '18.3 MB' },
    { id: 5, title: 'اللغة الإنجليزية - الصف الخامس الابتدائي', level: 'primary', cover: '5.jpg', pages: 165, size: '19.1 MB' },
    { id: 6, title: 'اللغة الإنجليزية - الصف السادس الابتدائي', level: 'primary', cover: '6.jpg', pages: 180, size: '20.4 MB' },
    
    // المرحلة الإعدادية - 3 كتب
    { id: 7, title: 'اللغة الإنجليزية - الصف الأول الإعدادي', level: 'middle', cover: '7.jpg', pages: 210, size: '22.7 MB' },
    { id: 8, title: 'اللغة الإنجليزية - الصف الثاني الإعدادي', level: 'middle', cover: '8.jpg', pages: 225, size: '24.2 MB' },
    { id: 9, title: 'اللغة الإنجليزية - الصف الثالث الإعدادي', level: 'middle', cover: '9.jpg', pages: 240, size: '25.8 MB' },
    
    // المرحلة الثانوية - 3 كتب
    { id: 10, title: 'اللغة الإنجليزية - الصف الأول الثانوي', level: 'high', cover: '10.jpg', pages: 280, size: '28.5 MB' },
    { id: 11, title: 'اللغة الإنجليزية - الصف الثاني الثانوي', level: 'high', cover: '11.jpg', pages: 295, size: '30.1 MB' },
    { id: 12, title: 'اللغة الإنجليزية - الصف الثالث الثانوي', level: 'high', cover: '12.jpg', pages: 320, size: '32.7 MB' }
  ];
  
  return books;
}

function renderBooks(filter = 'all') {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;
  
  if (App.books.length === 0) App.books = generateBooksData();
  
  const filteredBooks = filter === 'all' 
    ? App.books 
    : App.books.filter(book => book.level === filter);
  
  grid.innerHTML = filteredBooks.map((book, index) => {
    // تحديد الصف الدراسي بناءً على العنوان
    let gradeText = '';
    if (book.title.includes('الأول')) gradeText = 'الصف الأول';
    else if (book.title.includes('الثاني')) gradeText = 'الصف الثاني';
    else if (book.title.includes('الثالث')) gradeText = 'الصف الثالث';
    else if (book.title.includes('الرابع')) gradeText = 'الصف الرابع';
    else if (book.title.includes('الخامس')) gradeText = 'الصف الخامس';
    else if (book.title.includes('السادس')) gradeText = 'الصف السادس';
    
    return `
    <div class="book-card" style="animation-delay: ${index * 0.05}s">
      <img src="${book.cover}" alt="${book.title}" loading="lazy">
      <h4>${book.title}</h4>
      <p>${gradeText} - ${book.level === 'primary' ? 'ابتدائي' : book.level === 'middle' ? 'إعدادي' : 'ثانوي'}</p>
      <p style="font-size:0.8rem;color:#999;">${book.pages} صفحة | ${book.size}</p>
      <a href="#" class="book-download" onclick="downloadBook(${book.id}); return false;">
        <i class="fas fa-download"></i> تحميل PDF
      </a>
    </div>
  `}).join('');
}

function downloadBook(bookId) {
  const book = App.books.find(b => b.id === bookId);
  if (book) {
    // رابط التحميل فارغ حالياً
    showToast(`📚 ${book.title} - الرابط سيتوفر قريباً`, 'info');
    setTimeout(() => showToast('جاري تجهيز رابط التحميل', 'info'), 1500);
  }
}

function setupBookFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderBooks(btn.dataset.filter);
    });
  });
}

// ===== الإشعارات =====
function showToast(message, type = 'info') {
  const existing = document.getElementById('toast-notification');
  if (existing) existing.remove();
  
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const colors = { success: '#28a745', error: '#dc3545', info: '#17a2b8', warning: '#ffc107' };
  
  const toast = document.createElement('div');
  toast.id = 'toast-notification';
  toast.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: ${colors[type] || colors.info}; color: white;
    padding: 14px 28px; border-radius: 50px; font-weight: 600; font-size: 1rem;
    z-index: 3000; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    animation: slideUp 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
    display: flex; align-items: center; gap: 10px; max-width: 90vw; text-align: center;
    font-family: 'Tajawal', sans-serif;
  `;
  
  toast.innerHTML = `<span style="font-size:1.3em">${icons[type] || icons.info}</span> ${message}`;
  
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      @keyframes fadeOut { to { opacity: 0; transform: translateX(-50%) translateY(-20px); } }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== أدوات إضافية =====
function setupScrollHandler() {
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (!scrollTopBtn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) scrollTopBtn.classList.add('visible');
    else scrollTopBtn.classList.remove('visible');
  });
  
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function setupEventListeners() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
  setupMobileMenu();
  setupBookFilters();
  
  // إغلاق النماذج عند الضغط على Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ===== تصدير الدوال إلى النطاق العام =====
window.showPage = showPage;
window.showStage = showStage;
window.goHome = goHome;
window.downloadBook = downloadBook;
window.showLoginForm = showLoginForm;
window.showSignupForm = showSignupForm;
window.closeModal = closeModal;
window.switchToLogin = switchToLogin;
window.switchToSignup = switchToSignup;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.closeMobileMenu = closeMobileMenu;

console.log(`
╔════════════════════════════════════════╗
║   موقع الأستاذ علي النجار             ║
║   للإشارة باللغة الإنجليزية           ║
╠════════════════════════════════════════╣
║   الإصدار: 3.1 (محدث)                 ║
║   الكتب: ابتدائي 6 | إعدادي 3 | ثانوي 3║
║   الحالة: جاهز                        ║
╚════════════════════════════════════════╝
`);
