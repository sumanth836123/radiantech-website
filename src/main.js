document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 2. HERO 3D SPATIAL PARALLAX MOUSE TRACKING ENGINE
  // ==========================================================================
  const heroSpatialStage = document.getElementById('heroSpatialStage');
  const arGrid = document.querySelector('.ar-hud-spatial-grid');
  const physicalProduct = document.querySelector('.physical-product-anchor');

  if (heroSpatialStage && arGrid && physicalProduct) {
    heroSpatialStage.addEventListener('mousemove', (e) => {
      const rect = heroSpatialStage.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotateY = (x / (rect.width / 2)) * 10;
      const rotateX = -(y / (rect.height / 2)) * 10;

      arGrid.style.transform = `translateZ(-40px) rotateY(${rotateY * 0.8}deg) rotateX(${rotateX * 0.8}deg)`;
      physicalProduct.style.transform = `translateX(-50%) translateZ(40px) rotateY(${rotateY * 0.4}deg) rotateX(${rotateX * 0.4}deg)`;
    });

    heroSpatialStage.addEventListener('mouseleave', () => {
      arGrid.style.transform = `translateZ(-40px) rotateY(-6deg) rotateX(3deg)`;
      physicalProduct.style.transform = `translateX(-50%) translateZ(40px) rotateY(0deg) rotateX(0deg)`;
    });
  }


  // ==========================================================================
  // 3. MOBILE MENU NAVIGATION TOGGLE
  // ==========================================================================
  const menuBtn = document.querySelector('.menu-btn');
  const navMenu = document.querySelector('.nav nav');

  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }


  // ==========================================================================
  // 5. PRODUCT FILTER TABS (products.html)
  // ==========================================================================
  const filterTabs = document.querySelectorAll('.filter-tab');
  const productCards = document.querySelectorAll('.product-card-item');

  if (filterTabs.length > 0 && productCards.length > 0) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const category = tab.getAttribute('data-filter');

        productCards.forEach(card => {
          if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }


  // ==========================================================================
  // 7. TECHNOLOGY LAYER INTERACTIVE SELECTOR (technology.html)
  // ==========================================================================
  const layerItems = document.querySelectorAll('.layer-item');
  if (layerItems.length > 0) {
    layerItems.forEach(item => {
      item.addEventListener('click', () => {
        layerItems.forEach(l => l.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }


  // ==========================================================================
  // 8. FAQ ACCORDIONS (contact.html)
  // ==========================================================================
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(q => {
    q.addEventListener('click', () => {
      const parent = q.closest('.faq-item');
      if (parent) {
        parent.classList.toggle('open');
      }
    });
  });


  // ==========================================================================
  // 9. INTERACTIVE CONTACT FORM & FILE UPLOAD (contact.html)
  // ==========================================================================
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const dropZoneText = dropZone ? dropZone.querySelector('p') : null;
  const dropZoneDefault = dropZoneText ? dropZoneText.textContent : '';

  const contactForm = document.getElementById('contactForm');
  const FALLBACK_EMAIL = 'connect@radiantechsys.com';
  const MAX_FILE_BYTES = 10 * 1024 * 1024;

  if (contactForm) {
    const submitBtn = contactForm.querySelector('.submit-btn');
    const statusEl = document.getElementById('formStatus');
    const btnLabel = submitBtn ? submitBtn.innerHTML : '';

    const setStatus = (text, kind) => {
      if (!statusEl) return;
      statusEl.textContent = text;
      statusEl.className = 'form-status' + (kind ? ' form-status--' + kind : '');
    };

    const readFile = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      setStatus('', '');

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const endpoint = contactForm.dataset.endpoint;
      if (!endpoint) {
        setStatus('Our online form is being set up. Please email us at ' + FALLBACK_EMAIL + '.', 'error');
        return;
      }

      const val = (id) => (document.getElementById(id)?.value || '').trim();
      const interestEl = document.getElementById('serviceInterest');
      const payload = {
        firstName: val('firstName'),
        lastName: val('lastName'),
        email: val('workEmail'),
        phone: val('phoneNum'),
        company: val('companyName'),
        interest: interestEl ? interestEl.options[interestEl.selectedIndex].text : '',
        message: val('messageText'),
        website: val('website'),
        page: location.href
      };

      const file = fileInput && fileInput.files[0];
      if (file && file.size > MAX_FILE_BYTES) {
        setStatus('The attached file is larger than 10 MB. Please attach a smaller file or email it to ' + FALLBACK_EMAIL + '.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending…';

      try {
        if (file) {
          payload.file = { name: file.name, type: file.type, data: await readFile(file) };
        }
        // text/plain keeps this a "simple" request, which Google Apps Script accepts from any website
        const res = await fetch(endpoint, { method: 'POST', body: JSON.stringify(payload) });
        const result = await res.json();
        if (!result.ok) throw new Error(result.error || 'Submission failed');

        contactForm.reset();
        if (dropZoneText) dropZoneText.textContent = dropZoneDefault;
        submitBtn.innerHTML = '✓ Message Sent';
        submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        setStatus('Thank you! Your message has been received. Our team will get back to you within 24 hours.', 'success');
        setTimeout(() => {
          submitBtn.style.background = '';
          submitBtn.innerHTML = btnLabel;
          submitBtn.disabled = false;
        }, 5000);
      } catch (err) {
        console.error(err);
        submitBtn.innerHTML = btnLabel;
        submitBtn.disabled = false;
        setStatus('Sorry, your message could not be sent. Please try again, or email us at ' + FALLBACK_EMAIL + '.', 'error');
      }
    });
  }


  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#0878df';
      dropZone.style.background = '#e0f2fe';
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#cbd5e1';
        dropZone.style.background = '#f8fafc';
      });
    });

    // a dropped file is attached to the form, the same as choosing it with "browse"
    dropZone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0 && dropZoneText) {
        const f = fileInput.files[0];
        dropZoneText.textContent = `Attached File: ${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)`;
      }
    });
  }


});
