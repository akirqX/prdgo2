/**
 * PRODGIO - ARQUIVO JAVASCRIPT UNIFICADO
 * Todas as funcionalidades do site em um único arquivo
 */

// ===================================
// UTILITIES
// ===================================

// DOM Utilities
const DOM = {
  query: (selector, context = document) => context.querySelector(selector),
  queryAll: (selector, context = document) => context.querySelectorAll(selector),
  create: (tag, attributes = {}, content = '') => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    if (content) element.textContent = content;
    return element;
  },
  addClass: (element, className) => element?.classList.add(className),
  removeClass: (element, className) => element?.classList.remove(className),
  toggleClass: (element, className) => element?.classList.toggle(className),
  hasClass: (element, className) => element?.classList.contains(className),
  show: (element) => {
    if (element) element.style.display = 'block';
  },
  hide: (element) => {
    if (element) element.style.display = 'none';
  },
  fadeIn: (element, duration = 300) => {
    if (!element) return;
    element.style.opacity = '0';
    element.style.display = 'block';
    let start = performance.now();
    
    function animate(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      element.style.opacity = progress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    requestAnimationFrame(animate);
  },
  fadeOut: (element, duration = 300) => {
    if (!element) return;
    let start = performance.now();
    
    function animate(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      element.style.opacity = 1 - progress;
      
      if (progress >= 1) {
        element.style.display = 'none';
      } else {
        requestAnimationFrame(animate);
      }
    }
    requestAnimationFrame(animate);
  }
};

// Performance Utilities
const Performance = {
  throttle: (func, delay) => {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  },
  
  debounce: (func, delay) => {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },
  
  requestIdleCallback: (callback) => {
    if (window.requestIdleCallback) {
      return window.requestIdleCallback(callback);
    } else {
      return setTimeout(callback, 1);
    }
  }
};

// Device Detection
const Device = {
  isMobile: () => window.innerWidth <= 768,
  isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
  isDesktop: () => window.innerWidth > 1024,
  isTouchDevice: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  isRetina: () => window.devicePixelRatio > 1,
  getViewportSize: () => ({
    width: window.innerWidth,
    height: window.innerHeight
  })
};

// Storage Utilities
const Storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Storage.set failed:', e);
      return false;
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('Storage.get failed:', e);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('Storage.remove failed:', e);
      return false;
    }
  }
};

// ===================================
// NAVIGATION MODULE
// ===================================

class Navigation {
  constructor() {
    this.header = DOM.query('.header');
    this.navbar = DOM.query('.navbar');
    this.navToggle = DOM.query('.navbar-toggle');
    this.mobileMenu = DOM.query('.navbar-mobile');
    this.navLinks = DOM.queryAll('.nav-link');
    this.mobileLinks = DOM.queryAll('.mobile-links a');
    this.progressBar = DOM.query('.progress-bar');
    
    this.isMenuOpen = false;
    this.lastScrollY = 0;
    this.scrollThreshold = 100;
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.updateActiveLink();
    this.updateScrollProgress();
  }
  
  bindEvents() {
    // Mobile menu toggle
    if (this.navToggle && this.mobileMenu) {
      this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
    }
    
    // Navigation links
    [...this.navLinks, ...this.mobileLinks].forEach(link => {
      link.addEventListener('click', (e) => this.handleNavClick(e));
    });
    
    // Scroll events
    window.addEventListener('scroll', Performance.throttle(() => {
      this.updateScrollProgress();
      this.updateActiveLink();
      this.handleHeaderScroll();
    }, 16));
    
    // Resize events
    window.addEventListener('resize', Performance.debounce(() => {
      if (!Device.isMobile() && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    }, 250));
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !this.mobileMenu.contains(e.target) && !this.navToggle.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
  }
  
  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }
  
  openMobileMenu() {
    DOM.addClass(this.mobileMenu, 'active');
    DOM.addClass(this.navToggle, 'active');
    DOM.addClass(document.body, 'no-scroll');
    this.navToggle.setAttribute('aria-expanded', 'true');
    this.mobileMenu.setAttribute('aria-hidden', 'false');
    this.isMenuOpen = true;
  }
  
  closeMobileMenu() {
    DOM.removeClass(this.mobileMenu, 'active');
    DOM.removeClass(this.navToggle, 'active');
    DOM.removeClass(document.body, 'no-scroll');
    this.navToggle.setAttribute('aria-expanded', 'false');
    this.mobileMenu.setAttribute('aria-hidden', 'true');
    this.isMenuOpen = false;
  }
  
  handleNavClick(e) {
    const href = e.target.getAttribute('href');
    
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = DOM.query(`#${targetId}`);
      
      if (targetElement) {
        this.scrollToElement(targetElement);
        
        // Close mobile menu if open
        if (this.isMenuOpen) {
          this.closeMobileMenu();
        }
      }
    }
  }
  
  scrollToElement(element) {
    const headerHeight = this.header ? this.header.offsetHeight : 0;
    const targetPosition = element.offsetTop - headerHeight - 20;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
  
  updateActiveLink() {
    const sections = DOM.queryAll('section[id]');
    const scrollPosition = window.scrollY + window.innerHeight / 3;
    
    let activeSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        activeSection = section.id;
      }
    });
    
    // Update navigation links
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeSection}`) {
        DOM.addClass(link, 'active');
        link.setAttribute('aria-current', 'page');
      } else {
        DOM.removeClass(link, 'active');
        link.removeAttribute('aria-current');
      }
    });
  }
  
  updateScrollProgress() {
    if (!this.progressBar) return;
    
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    this.progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
    
    if (scrollPercent > 90) {
      DOM.addClass(this.progressBar, 'near-complete');
    } else {
      DOM.removeClass(this.progressBar, 'near-complete');
    }
  }
  
  handleHeaderScroll() {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > this.scrollThreshold) {
      DOM.addClass(this.header, 'scrolled');
    } else {
      DOM.removeClass(this.header, 'scrolled');
    }
    
    this.lastScrollY = currentScrollY;
  }
}

// ===================================
// HERO EFFECTS MODULE
// ===================================

class HeroEffects {
  constructor() {
    this.hero = DOM.query('.hero');
    this.canvas = DOM.query('.hero-canvas');
    this.particles = DOM.query('.hero-particles');
    this.counters = DOM.queryAll('.hero-counter');
    this.typewriter = DOM.query('.typewriter-text');
    
    this.animationId = null;
    this.particleArray = [];
    this.isVisible = false;
    
    if (this.hero) {
      this.init();
    }
  }
  
  init() {
    this.setupCanvas();
    this.createParticles();
    this.setupCounters();
    this.setupTypewriter();
    this.bindEvents();
    this.startAnimation();
  }
  
  setupCanvas() {
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    
    window.addEventListener('resize', Performance.debounce(() => {
      this.resizeCanvas();
    }, 250));
  }
  
  resizeCanvas() {
    if (!this.canvas || !this.ctx) return;
    
    const rect = this.hero.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }
  
  createParticles() {
    if (!this.canvas) return;
    
    const particleCount = Device.isMobile() ? 30 : 50;
    
    for (let i = 0; i < particleCount; i++) {
      this.particleArray.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }
  
  setupCounters() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          this.animateCounter(entry.target);
          entry.target.classList.add('counted');
        }
      });
    }, { threshold: 0.5 });
    
    this.counters.forEach(counter => observer.observe(counter));
  }
  
  animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const suffix = element.dataset.suffix || '';
    const duration = 2000;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * target);
      
      element.textContent = current + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  setupTypewriter() {
    if (!this.typewriter) return;
    
    const text = this.typewriter.textContent;
    this.typewriter.textContent = '';
    
    let i = 0;
    const typeSpeed = 50;
    
    const type = () => {
      if (i < text.length) {
        this.typewriter.textContent += text.charAt(i);
        i++;
        setTimeout(type, typeSpeed);
      }
    };
    
    // Start typing after a delay
    setTimeout(type, 1000);
  }
  
  bindEvents() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.1 });
    
    if (this.hero) {
      observer.observe(this.hero);
    }
  }
  
  startAnimation() {
    if (!this.canvas || !this.ctx) return;
    
    const animate = () => {
      if (this.isVisible) {
        this.updateParticles();
        this.drawParticles();
      }
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  updateParticles() {
    this.particleArray.forEach(particle => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      if (particle.x < 0 || particle.x > this.canvas.width) {
        particle.speedX *= -1;
      }
      if (particle.y < 0 || particle.y > this.canvas.height) {
        particle.speedY *= -1;
      }
    });
  }
  
  drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particleArray.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(209, 62, 255, ${particle.opacity})`;
      this.ctx.fill();
    });
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// ===================================
// PORTFOLIO MODULE
// ===================================

class Portfolio {
  constructor() {
    this.container = DOM.query('.portfolio');
    this.filters = DOM.queryAll('.filter-btn');
    this.items = DOM.queryAll('.portfolio-item');
    this.loadMoreBtn = DOM.query('.load-more-btn');
    
    this.currentFilter = 'all';
    this.itemsPerPage = 6;
    this.currentPage = 1;
    
    if (this.container) {
      this.init();
    }
  }
  
  init() {
    this.bindEvents();
    this.updateFilterCounts();
    this.showItems();
  }
  
  bindEvents() {
    // Filter buttons
    this.filters.forEach(filter => {
      filter.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleFilterClick(filter);
      });
    });
    
    // Load more button
    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.loadMore();
      });
    }
    
    // Portfolio item clicks
    this.items.forEach(item => {
      item.addEventListener('click', () => {
        this.openPortfolioModal(item);
      });
    });
  }
  
  handleFilterClick(filterBtn) {
    const filter = filterBtn.dataset.filter;
    
    if (filter === this.currentFilter) return;
    
    // Update active filter
    this.filters.forEach(btn => DOM.removeClass(btn, 'active'));
    DOM.addClass(filterBtn, 'active');
    
    this.currentFilter = filter;
    this.currentPage = 1;
    
    this.filterItems();
    this.updateLoadMoreButton();
  }
  
  filterItems() {
    const filteredItems = this.getFilteredItems();
    
    // Hide all items first
    this.items.forEach(item => {
      DOM.addClass(item, 'hidden');
    });
    
    // Show filtered items with animation
    setTimeout(() => {
      filteredItems.slice(0, this.itemsPerPage * this.currentPage).forEach((item, index) => {
        setTimeout(() => {
          DOM.removeClass(item, 'hidden');
          DOM.addClass(item, 'animate-in');
        }, index * 100);
      });
    }, 300);
  }
  
  getFilteredItems() {
    if (this.currentFilter === 'all') {
      return Array.from(this.items);
    }
    
    return Array.from(this.items).filter(item => {
      const categories = item.dataset.category?.split(',') || [];
      return categories.includes(this.currentFilter);
    });
  }
  
  loadMore() {
    this.currentPage++;
    const filteredItems = this.getFilteredItems();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = this.currentPage * this.itemsPerPage;
    
    filteredItems.slice(startIndex, endIndex).forEach((item, index) => {
      setTimeout(() => {
        DOM.removeClass(item, 'hidden');
        DOM.addClass(item, 'animate-in');
      }, index * 100);
    });
    
    this.updateLoadMoreButton();
  }
  
  updateLoadMoreButton() {
    if (!this.loadMoreBtn) return;
    
    const filteredItems = this.getFilteredItems();
    const visibleItems = this.currentPage * this.itemsPerPage;
    
    if (visibleItems >= filteredItems.length) {
      DOM.hide(this.loadMoreBtn);
    } else {
      DOM.show(this.loadMoreBtn);
    }
  }
  
  updateFilterCounts() {
    this.filters.forEach(filter => {
      const filterValue = filter.dataset.filter;
      const count = filterValue === 'all' ? 
        this.items.length : 
        this.getFilteredItems().length;
      
      const countElement = filter.querySelector('.filter-count');
      if (countElement) {
        countElement.textContent = count;
      }
    });
  }
  
  showItems() {
    this.filterItems();
    this.updateLoadMoreButton();
  }
  
  openPortfolioModal(item) {
    // Portfolio modal functionality would go here
    console.log('Opening portfolio item:', item);
  }
}

// ===================================
// TESTIMONIALS MODULE
// ===================================

class Testimonials {
  constructor() {
    this.container = DOM.query('.testimonials-carousel');
    this.track = DOM.query('.testimonials-track');
    this.cards = DOM.queryAll('.testimonial-card');
    this.prevBtn = DOM.query('.carousel-btn.prev');
    this.nextBtn = DOM.query('.carousel-btn.next');
    this.indicators = DOM.queryAll('.indicator');
    
    this.currentIndex = 0;
    this.autoplayInterval = null;
    this.autoplayDelay = 5000;
    
    if (this.container && this.cards.length > 0) {
      this.init();
    }
  }
  
  init() {
    this.bindEvents();
    this.updateCarousel();
    this.startAutoplay();
  }
  
  bindEvents() {
    // Navigation buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }
    
    // Indicators
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goTo(index));
    });
    
    // Pause autoplay on hover
    if (this.container) {
      this.container.addEventListener('mouseenter', () => this.stopAutoplay());
      this.container.addEventListener('mouseleave', () => this.startAutoplay());
    }
    
    // Touch/swipe support
    this.setupTouchEvents();
  }
  
  setupTouchEvents() {
    if (!Device.isTouchDevice()) return;
    
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    
    this.container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });
    
    this.container.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      // Only handle horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          this.prev();
        } else {
          this.next();
        }
      }
    });
  }
  
  prev() {
    this.currentIndex = this.currentIndex === 0 ? 
      this.cards.length - 1 : 
      this.currentIndex - 1;
    this.updateCarousel();
  }
  
  next() {
    this.currentIndex = this.currentIndex === this.cards.length - 1 ? 
      0 : 
      this.currentIndex + 1;
    this.updateCarousel();
  }
  
  goTo(index) {
    this.currentIndex = index;
    this.updateCarousel();
  }
  
  updateCarousel() {
    // Update cards
    this.cards.forEach((card, index) => {
      if (index === this.currentIndex) {
        DOM.addClass(card, 'active');
      } else {
        DOM.removeClass(card, 'active');
      }
    });
    
    // Update indicators
    this.indicators.forEach((indicator, index) => {
      if (index === this.currentIndex) {
        DOM.addClass(indicator, 'active');
      } else {
        DOM.removeClass(indicator, 'active');
      }
    });
  }
  
  startAutoplay() {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
      this.next();
    }, this.autoplayDelay);
  }
  
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
}

// ===================================
// CONTACT FORM MODULE
// ===================================

class ContactForm {
  constructor() {
    this.form = DOM.query('.contact-form');
    this.inputs = DOM.queryAll('.form-input, .form-select, .form-textarea');
    this.submitBtn = DOM.query('.form-submit');
    
    this.isSubmitting = false;
    
    if (this.form) {
      this.init();
    }
  }
  
  init() {
    this.bindEvents();
    this.setupValidation();
  }
  
  bindEvents() {
    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    // Input validation
    this.inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }
  
  setupValidation() {
    this.validators = {
      required: (value) => value.trim() !== '',
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      phone: (value) => /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, '')),
      minLength: (value, min) => value.length >= min
    };
  }
  
  validateField(field) {
    const value = field.value;
    const rules = field.dataset.validate?.split('|') || [];
    const errorElement = field.parentNode.querySelector('.form-error');
    
    let isValid = true;
    let errorMessage = '';
    
    for (const rule of rules) {
      const [validator, param] = rule.split(':');
      
      if (validator === 'required' && !this.validators.required(value)) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório';
        break;
      } else if (validator === 'email' && value && !this.validators.email(value)) {
        isValid = false;
        errorMessage = 'Digite um email válido';
        break;
      } else if (validator === 'phone' && value && !this.validators.phone(value)) {
        isValid = false;
        errorMessage = 'Digite um telefone válido';
        break;
      } else if (validator === 'minLength' && value && !this.validators.minLength(value, parseInt(param))) {
        isValid = false;
        errorMessage = `Mínimo de ${param} caracteres`;
        break;
      }
    }
    
    // Update field state
    if (isValid) {
      DOM.removeClass(field, 'invalid');
      DOM.addClass(field, 'valid');
      if (errorElement) errorElement.textContent = '';
    } else {
      DOM.removeClass(field, 'valid');
      DOM.addClass(field, 'invalid');
      if (errorElement) errorElement.textContent = errorMessage;
    }
    
    return isValid;
  }
  
  clearFieldError(field) {
    DOM.removeClass(field, 'invalid');
    const errorElement = field.parentNode.querySelector('.form-error');
    if (errorElement) errorElement.textContent = '';
  }
  
  validateForm() {
    let isValid = true;
    
    this.inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  async handleSubmit() {
    if (this.isSubmitting) return;
    
    if (!this.validateForm()) {
      this.showMessage('Por favor, corrija os erros no formulário.', 'error');
      return;
    }
    
    this.isSubmitting = true;
    this.updateSubmitButton(true);
    
    try {
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData.entries());
      
      // Simulate API call
      await this.submitToAPI(data);
      
      this.showMessage('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
      this.form.reset();
      this.inputs.forEach(input => {
        DOM.removeClass(input, 'valid');
        DOM.removeClass(input, 'invalid');
      });
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showMessage('Erro ao enviar mensagem. Tente novamente.', 'error');
    } finally {
      this.isSubmitting = false;
      this.updateSubmitButton(false);
    }
  }
  
  async submitToAPI(data) {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  }
  
  updateSubmitButton(isLoading) {
    if (isLoading) {
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = `
        <span class="spinner"></span>
        Enviando...
      `;
    } else {
      this.submitBtn.disabled = false;
      this.submitBtn.innerHTML = `
        Enviar Mensagem
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      `;
    }
  }
  
  showMessage(message, type) {
    // Create or update message element
    let messageEl = DOM.query('.form-message');
    
    if (!messageEl) {
      messageEl = DOM.create('div', { className: 'form-message' });
      this.form.appendChild(messageEl);
    }
    
    messageEl.className = `form-message alert alert-${type}`;
    messageEl.textContent = message;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 5000);
  }
}

// ===================================
// WHATSAPP FORM MODULE
// ===================================

class WhatsAppForm {
  constructor() {
    this.forms = DOM.queryAll('.whatsapp-form');
    this.phoneNumber = '5511914823015'; // Default phone number
    
    if (this.forms.length > 0) {
      this.init();
    }
  }
  
  init() {
    this.bindEvents();
  }
  
  bindEvents() {
    this.forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit(form);
      });
    });
  }
  
  handleSubmit(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Build WhatsApp message
    let message = 'Olá! Gostaria de solicitar um orçamento:\n\n';
    
    Object.entries(data).forEach(([key, value]) => {
      if (value.trim()) {
        const label = this.getFieldLabel(key);
        message += `*${label}:* ${value}\n`;
      }
    });
    
    message += '\nAguardo retorno. Obrigado!';
    
    // Open WhatsApp
    this.openWhatsApp(message);
  }
  
  getFieldLabel(fieldName) {
    const labels = {
      name: 'Nome',
      email: 'Email',
      phone: 'Telefone',
      company: 'Empresa',
      service: 'Serviço',
      budget: 'Orçamento',
      message: 'Mensagem',
      project: 'Projeto'
    };
    
    return labels[fieldName] || fieldName;
  }
  
  openWhatsApp(message) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
  }
}

// ===================================
// MAIN APPLICATION
// ===================================

class App {
  constructor() {
    this.modules = {};
    this.loadingScreen = DOM.query('#loading-screen');
    this.isLoaded = false;
    
    this.init();
  }
  
  async init() {
    console.log('🚀 Prodgio website loading...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }
  
  async start() {
    try {
      // Initialize modules
      await this.initializeModules();
      
      // Hide loading screen
      await this.hideLoadingScreen();
      
      // Setup global events
      this.setupGlobalEvents();
      
      console.log('✅ Prodgio website loaded successfully');
      this.isLoaded = true;
      
    } catch (error) {
      console.error('❌ Error loading website:', error);
    }
  }
  
  async initializeModules() {
    // Initialize modules in order
    this.modules.navigation = new Navigation();
    this.modules.heroEffects = new HeroEffects();
    this.modules.portfolio = new Portfolio();
    this.modules.testimonials = new Testimonials();
    this.modules.contactForm = new ContactForm();
    this.modules.whatsappForm = new WhatsAppForm();
    
    // Small delay to ensure everything is initialized
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  async hideLoadingScreen() {
    if (this.loadingScreen) {
      // Minimum loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      DOM.addClass(this.loadingScreen, 'hidden');
      
      // Remove from DOM after animation
      setTimeout(() => {
        if (this.loadingScreen.parentNode) {
          this.loadingScreen.parentNode.removeChild(this.loadingScreen);
        }
      }, 500);
    }
  }
  
  setupGlobalEvents() {
    // Back to top button
    const backToTopBtn = DOM.query('.back-to-top');
    if (backToTopBtn) {
      window.addEventListener('scroll', Performance.throttle(() => {
        if (window.scrollY > 500) {
          DOM.show(backToTopBtn);
        } else {
          DOM.hide(backToTopBtn);
        }
      }, 100));
      
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Close any open modals or menus
        if (this.modules.navigation?.isMenuOpen) {
          this.modules.navigation.closeMobileMenu();
        }
      }
    });
    
    // Performance monitoring
    if (window.performance && window.performance.mark) {
      window.performance.mark('app-loaded');
    }
  }
}

// ===================================
// INITIALIZE APPLICATION
// ===================================

// Start the application
const app = new App();

// Export for debugging
window.ProdgioApp = app;

