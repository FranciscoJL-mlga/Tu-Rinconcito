// Navbar scroll
const nav = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 60);
});

// Scroll reveal
const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("visible"), i * 80);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);
reveals.forEach((el) => observer.observe(el));


document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  const links = document.querySelectorAll(".nav-links a");

  // Abrir y cerrar el menú
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  // Cerrar al hacer clic en un enlace
  links.forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navLinks.classList.remove("active");
    });
  });

  // Restablecer al cambiar el tamaño de pantalla
  window.addEventListener("resize", () => {
    if (window.innerWidth > 992) {
      hamburger.classList.remove("active");
      navLinks.classList.remove("active");
    }
  });
});

// Newsletter
function handleSubscribe(e) {
  e.preventDefault();
  document.getElementById("form-msg").style.display = "block";
  e.target.reset();
}

// Filter
const filterBtns = document.querySelectorAll('.filter-btn');
const sections = document.querySelectorAll('.menu-section');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    sections.forEach(sec => {
      if (filter === 'all' || sec.dataset.section === filter) {
        sec.classList.remove('hidden');
      } else {
        sec.classList.add('hidden');
      }
    });
  });
});

// ── CONFIG ──
const SUBJECTS = {
  '': ['love', 'adventure', 'mystery', 'dream', 'war', 'time', 'nature', 'music'],
  'fiction': ['fiction', 'novel', 'short_stories', 'fantasy', 'thriller'],
  'history': ['history', 'world_history', 'ancient_history', 'biography'],
  'philosophy': ['philosophy', 'ethics', 'logic', 'metaphysics'],
  'science': ['science', 'physics', 'biology', 'mathematics', 'astronomy'],
  'poetry': ['poetry', 'poems', 'verse'],
  'art': ['art', 'painting', 'architecture', 'design', 'photography']
};
const GENRE_LABELS = {
  '': 'General', 'fiction': 'Ficción', 'history': 'Historia',
  'philosophy': 'Filosofía', 'science': 'Ciencia', 'poetry': 'Poesía', 'art': 'Arte'
};

let currentSubject = '';
let currentBooks = [];

// ── NAV SCROLL ──

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── COVER URL ──
function coverUrl(coverId, size = 'M') {
  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : null;
}

// ── RANDOM PICK ──
function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── SKELETONS ──
function showSkeletons(count = 8) {
  const grid = document.getElementById('booksGrid');
  grid.innerHTML = Array(count).fill(0).map(() => `
      <div class="skeleton">
        <div class="skeleton-cover"></div>
        <div class="skeleton-body">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>`).join('');
}

function showFeaturedSkeleton() {
  document.getElementById('featuredBook').innerHTML = `
      <div class="featured-card" style="pointer-events:none">
        <div class="featured-cover-ph"></div>
        <div>
          <div class="skeleton-line short" style="margin-bottom:1rem;height:8px;background:rgba(245,240,232,0.15);border-radius:100px;width:80px"></div>
          <div class="skeleton-line medium" style="margin-bottom:.5rem;height:18px;background:rgba(245,240,232,0.2);border-radius:4px"></div>
          <div class="skeleton-line short" style="height:12px;background:rgba(245,240,232,0.12);border-radius:4px;width:160px"></div>
        </div>
      </div>`;
}

// ── FETCH BOOKS ──
async function fetchBooks(subject, offset = 0) {
  const topics = SUBJECTS[subject] || SUBJECTS[''];
  const topic = randomFrom(topics);
  const url = `https://openlibrary.org/subjects/${topic}.json?limit=20&offset=${Math.floor(Math.random() * 80)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  return (data.works || []).filter(b => b.cover_id);
}

// ── RENDER FEATURED ──
function renderFeatured(book) {
  const cover = coverUrl(book.cover_id, 'M');
  const authors = (book.authors || []).map(a => a.name).join(', ') || 'Autor desconocido';
  const year = book.first_publish_year || '';
  const desc = book.description
    ? (typeof book.description === 'string' ? book.description : book.description.value || '')
    : 'Un título imprescindible en nuestra selección. Pásate por la librería y cuéntanos qué te pareció.';
  const shortDesc = desc.length > 200 ? desc.slice(0, 200) + '…' : desc;
  const olKey = book.key ? `https://openlibrary.org${book.key}` : 'https://openlibrary.org';

  document.getElementById('featuredBook').innerHTML = `
      <div class="featured-card reveal" onclick="openModal(${JSON.stringify(book).replace(/"/g, '&quot;')})">
        ${cover
      ? `<img class="featured-cover" src="${cover}" alt="${book.title}" onerror="this.parentNode.replaceChild(Object.assign(document.createElement('div'),{className:'featured-cover-ph'}),this)">`
      : `<div class="featured-cover-ph"></div>`}
        <div>
          <p class="featured-eyebrow">Recomendación del día</p>
          <h3 class="featured-title">${book.title}</h3>
          <p class="featured-author">${authors}${year ? ' · ' + year : ''}</p>
          <p class="featured-desc">${shortDesc}</p>
          <button class="featured-link" onclick="event.stopPropagation(); window.open('${olKey}','_blank')">
            Ver más detalles →
          </button>
        </div>
      </div>`;
  // trigger reveal
  setTimeout(() => {
    document.querySelectorAll('.featured-card.reveal').forEach(el => el.classList.add('visible'));
  }, 100);
}

// ── RENDER GRID ──
function renderGrid(books) {
  const grid = document.getElementById('booksGrid');
  const note = document.getElementById('catalogNote');
  note.textContent = `${books.length} títulos · actualizado ahora`;

  if (!books.length) {
    grid.innerHTML = `<div class="error-msg" style="grid-column:1/-1">No hemos encontrado títulos para esta búsqueda. Prueba otra categoría.</div>`;
    return;
  }

  grid.innerHTML = books.map(book => {
    const cover = coverUrl(book.cover_id, 'M');
    const authors = (book.authors || []).map(a => a.name).join(', ') || 'Autor desconocido';
    const year = book.first_publish_year || '';
    const genreLabel = GENRE_LABELS[currentSubject] || 'General';
    const bookJson = JSON.stringify(book).replace(/"/g, '&quot;');
    return `
        <div class="book-card reveal" onclick="openModal(${bookJson})">
          <div class="book-cover-wrap">
            ${cover
        ? `<img src="${cover}" alt="${book.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ''}
            <div class="book-cover-placeholder" style="${cover ? 'display:none' : ''}">
              <p class="ph-title">${book.title}</p>
              <p class="ph-author">${authors}</p>
            </div>
            <div class="book-overlay">
              <button class="overlay-btn" onclick="event.stopPropagation();openModal(${bookJson})">Ver detalles</button>
              <a class="overlay-btn secondary" href="https://openlibrary.org${book.key}" target="_blank" onclick="event.stopPropagation()">Open Library →</a>
            </div>
          </div>
          <div class="book-body">
            <span class="book-genre">${genreLabel}</span>
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">${authors}</p>
            ${year ? `<p class="book-year">${year}</p>` : ''}
          </div>
        </div>`;
  }).join('');

  // trigger reveals on new cards
  setTimeout(() => {
    document.querySelectorAll('.book-card.reveal:not(.visible)').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 60);
      observer.observe(el);
    });
  }, 50);
}

// ── LOAD ──
async function loadBooks(subject = '') {
  currentSubject = subject;
  showSkeletons(8);
  showFeaturedSkeleton();
  try {
    const books = await fetchBooks(subject);
    currentBooks = books;
    if (books.length > 0) {
      renderFeatured(books[Math.floor(Math.random() * Math.min(books.length, 5))]);
      renderGrid(books.slice(0, 8));
    } else {
      document.getElementById('featuredBook').innerHTML = '';
      document.getElementById('booksGrid').innerHTML = `<div class="error-msg" style="grid-column:1/-1">Sin resultados. Prueba otra categoría.</div>`;
    }
  } catch (e) {
    document.getElementById('booksGrid').innerHTML = `<div class="error-msg" style="grid-column:1/-1">Error al conectar con Open Library. Comprueba tu conexión e inténtalo de nuevo.</div>`;
    document.getElementById('featuredBook').innerHTML = '';
  }
}

// ── MODAL ──
function openModal(book) {
  const cover = coverUrl(book.cover_id, 'L');
  const authors = (book.authors || []).map(a => a.name).join(', ') || 'Autor desconocido';
  const year = book.first_publish_year || '';
  const genreLabel = GENRE_LABELS[currentSubject] || 'General';
  const desc = book.description
    ? (typeof book.description === 'string' ? book.description : book.description.value || '')
    : 'Sin descripción disponible. Pásate por la librería y te contamos más sobre este título.';

  document.getElementById('modalGenre').textContent = genreLabel;
  document.getElementById('modalTitle').textContent = book.title;
  document.getElementById('modalAuthor').textContent = authors;
  document.getElementById('modalYear').textContent = year ? `Publicado en ${year}` : '';
  document.getElementById('modalDesc').textContent = desc.length > 500 ? desc.slice(0, 500) + '…' : desc;
  document.getElementById('modalLink').href = `https://openlibrary.org${book.key}`;

  const coverEl = document.getElementById('modalCover');
  if (cover) {
    coverEl.innerHTML = `<img class="modal-cover" src="${cover}" alt="${book.title}" onerror="this.parentNode.innerHTML='<div class=modal-cover-ph></div>'">`;
  } else {
    coverEl.innerHTML = `<div class="modal-cover-ph"></div>`;
  }

  document.getElementById('modalBackdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalClose2').addEventListener('click', closeModal);
document.getElementById('modalBackdrop').addEventListener('click', e => {
  if (e.target === document.getElementById('modalBackdrop')) closeModal();
});

// ── FILTERS ──
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadBooks(btn.dataset.subject);
  });
});

// ── REFRESH ──
const refreshBtn = document.getElementById('refreshBtn');
refreshBtn.addEventListener('click', () => {
  refreshBtn.classList.add('spinning');
  loadBooks(currentSubject).then(() => {
    setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
  });
});

// ── INIT ──
loadBooks('');


