// Theme toggle: an explicit user choice (saved to localStorage) always
// wins; otherwise the site follows prefers-color-scheme automatically
// (see the inline no-flash script in <head> and common.css).
(function () {
  function currentTheme() {
    var attr = document.documentElement.getAttribute('data-theme');
    if (attr) return attr;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function updateIcon(btn) {
    btn.textContent = currentTheme() === 'dark' ? '☀️' : '🌙';
  }
  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    updateIcon(btn);
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      updateIcon(btn);
    });
  });
})();

// Process sections: build a "tap to see up close" grid straight from the
// existing .slide elements (one source of truth for media + captions),
// then wire up the arrow-driven slideshow underneath it. Works for any
// file type - image, video, audio, or a plain file link - because it
// only ever toggles/represents the .slide wrapper, never inspects it.
document.querySelectorAll('[data-slideshow]').forEach(function (show) {
  var slides = Array.prototype.slice.call(show.querySelectorAll('.slide'));
  var prevBtn = show.querySelector('.slide-prev');
  var nextBtn = show.querySelector('.slide-next');
  var currentEl = show.querySelector('.slide-current');
  var totalEl = show.querySelector('.slide-total');
  var index = slides.findIndex(function (s) { return s.classList.contains('is-active'); });
  if (index < 0) index = 0;

  totalEl.textContent = slides.length;

  var grid = document.createElement('div');
  grid.className = 'slide-grid';

  slides.forEach(function (slide, i) {
    var captionEl = slide.querySelector('.slide-caption');
    var img = slide.querySelector('img');
    var isAudio = !!slide.querySelector('audio');
    var isVideo = !!slide.querySelector('video');
    var isFile = !!slide.querySelector('.file-link');

    var item = document.createElement('button');
    item.type = 'button';
    item.className = 'grid-item';

    if (img) {
      var thumb = document.createElement('img');
      thumb.src = img.getAttribute('src');
      thumb.alt = '';
      thumb.loading = 'lazy';
      item.appendChild(thumb);
    } else {
      var icon = document.createElement('span');
      icon.className = 'grid-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = isVideo ? '🎥' : isAudio ? '🎵' : isFile ? '📄' : '✦';
      item.appendChild(icon);
    }

    var cap = document.createElement('span');
    cap.className = 'grid-caption';
    cap.textContent = captionEl ? captionEl.textContent : '';
    item.appendChild(cap);

    item.addEventListener('click', function () {
      index = i;
      render();
      show.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    grid.appendChild(item);
  });

  show.parentNode.insertBefore(grid, show);

  function render() {
    slides.forEach(function (slide, i) {
      var isActive = i === index;
      slide.classList.toggle('is-active', isActive);
      if (!isActive) {
        var media = slide.querySelector('video, audio');
        if (media) media.pause();
      }
    });
    currentEl.textContent = index + 1;
    Array.prototype.forEach.call(grid.children, function (item, i) {
      item.setAttribute('aria-current', i === index ? 'true' : 'false');
    });
  }

  function go(delta) {
    index = (index + delta + slides.length) % slides.length;
    render();
  }

  prevBtn.addEventListener('click', function () { go(-1); });
  nextBtn.addEventListener('click', function () { go(1); });

  render();
});
