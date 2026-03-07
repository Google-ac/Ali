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
  const levels = [
    { id: 'primary', name: 'ابتدائي', count: 4 },
    { id: 'middle', name: 'إعدادي', count: 4 },
    { id: 'high', name: 'ثانوي', count: 4 }
  ];
  
  let books = [];
  let bookId = 1;
  
  levels.forEach(level => {
    for (let i = 1; i <= level.count; i++) {
      books.push({
        id: bookId++,
        title: `كتاب اللغة الإنجليزية - الجزء ${i}`,
        subtitle: `المرحلة ${level.name}`,
        level: level.id,
        cover: `${bookId-1}.jpg`,
        pages: Math.floor(Math.random() * 100) + 50,
        size: (Math.random() * 10 + 5).toFixed(1) + ' MB'
      });
    }
  });
  
  return books;
}

function renderBooks(filter = 'all') {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;
  
  if (App.books.length === 0) App.books = generateBooksData();
  
  const filteredBooks = filter === 'all' 
    ? App.books 
    : App.books.filter(book => book.level === filter);
  
  grid.innerHTML = filteredBooks.map((book, index) => `
    <div class="book-card" style="animation-delay: ${index * 0.05}s">
      <img src="${book.cover}" alt="${book.title}" loading="lazy">
      <h4>${book.title}</h4>
      <p>${book.subtitle}</p>
      <p style="font-size:0.8rem;color:#999;">${book.pages} صفحة | ${book.size}</p>
      <a href="#" class="book-download" onclick="downloadBook(${book.id}); return false;">
        <i class="fas fa-download"></i> تحميل PDF
      </a>
    </div>
  `).join('');
}

function downloadBook(bookId) {
  const book = App.books.find(b => b.id === bookId);
  if (book) {
    showToast(`جاري تحميل: ${book.title}...`, 'info');
    setTimeout(() => showToast('تم بدء التحميل ✓', 'success'), 1000);
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
}

window.showPage = showPage;
window.showStage = showStage;
window.goHome = goHome;
window.downloadBook = downloadBook;

console.log(`
╔════════════════════════════════════════╗
║   موقع الأستاذ علي النجار             ║
║   للإشارة باللغة الإنجليزية           ║
╠════════════════════════════════════════╣
║   الإصدار: 2.1 (محدث)                 ║
║   الحالة: جاهز                        ║
╚════════════════════════════════════════╝
`);