document.addEventListener('DOMContentLoaded', () => {
  const galleryRunway = document.querySelector('.gallery-runway');
  const navigationArrow = document.querySelector('.navigation-arrow');
  const scrollbar = document.querySelector('.gallery-scrollbar');
  const indicator = document.querySelector('.gallery-scrollbar-indicator');
  let lastHorizontalScrollPosition = 0;

  if (!galleryRunway || !navigationArrow || !scrollbar || !indicator) {
    console.error('One or more essential elements were not found!');
    return;
  }

  function slideGallery(direction) {
    const galleryWrap = galleryRunway.closest('.gallery');
    if (galleryWrap && galleryWrap.classList.contains('full-screen')) return;

    const { scrollLeft, clientWidth } = galleryRunway;
    const newScrollLeft = direction === 'left' ? scrollLeft - clientWidth : scrollLeft +
      clientWidth;
    galleryRunway.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  }

  function centerSecondFigure() {
    const figures = galleryRunway.querySelectorAll('figure');
    if (figures.length < 2) return;

    const secondFigure = figures[1];
    const scrollPosition = secondFigure.offsetLeft - (window.innerWidth - secondFigure
      .offsetWidth) / 2;
    galleryRunway.scrollLeft = scrollPosition;
    lastHorizontalScrollPosition = scrollPosition;
  }

  function getFigureIndexInView() {
    const figures = galleryRunway.querySelectorAll('figure');
    const currentScroll = galleryRunway.scrollLeft;
    const runwayCenter = currentScroll + galleryRunway.clientWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    figures.forEach((figure, index) => {
      const figureMidPoint = figure.offsetLeft + figure.offsetWidth / 2;
      const distance = Math.abs(runwayCenter - figureMidPoint);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  function toggleFullScreen() {
    const galleryWrap = this.closest('.gallery');
    const body = document.body;

    if (galleryWrap.classList.contains('full-screen')) {
      galleryWrap.classList.remove('full-screen');
      navigationArrow.style.display = 'block';
      galleryRunway.scrollLeft = lastHorizontalScrollPosition;
      body.style.overflowY = '';
    } else {
      lastHorizontalScrollPosition = galleryRunway.scrollLeft;
      const figureIndexInView = getFigureIndexInView();
      galleryWrap.classList.add('full-screen');
      navigationArrow.style.display = 'none';
      createGalleryThumbnails(galleryWrap);

      const targetFigure = galleryRunway.querySelectorAll('figure')[figureIndexInView];
      setTimeout(() => targetFigure.scrollIntoView({ behavior: 'smooth' }), 100);
      body.style.overflowY = 'hidden';
    }
  }

  function createGalleryThumbnails(galleryWrap) {
    const thumbnailsContainer = galleryWrap.querySelector('.gallery-thumbnails');
    thumbnailsContainer.innerHTML = '';
    const figures = galleryRunway.querySelectorAll('figure');

    figures.forEach((figure, index) => {
      const thumbnailButton = document.createElement('button');
      thumbnailButton.classList.add('gallery-thumbnail-btn');
      thumbnailButton.dataset.target = `#figure-${index}`;
      figure.id = `figure-${index}`; // Also assigning IDs to figures

      const img = figure.querySelector('img');
      if (img) {
        const thumbnailImage = img.cloneNode(true);
        thumbnailButton.appendChild(thumbnailImage);
      }

      thumbnailButton.addEventListener('click', () => figure
        .scrollIntoView({ behavior: 'smooth' }));
      thumbnailsContainer.appendChild(thumbnailButton);
    });
  }

  function toggleNavigationArrow(mode) {
    if (!galleryRunway.closest('.gallery').classList.contains('full-screen')) {
      navigationArrow.style.display = mode;
    }
  }

  function moveNavigationArrow(e) {
    toggleNavigationArrow('block');
    const posX = e.clientX - navigationArrow.offsetWidth / 2;
    const posY = e.clientY - navigationArrow.offsetHeight / 2;
    const rotation = e.clientX < window.innerWidth / 2 ? ' rotate(180deg)' : '';

    navigationArrow.style.transform = `translate3d(${posX}px, ${posY}px, 0)${rotation}`;
  }

  // Function to set the width of the scrollbar indicator
  const setIndicatorWidth = () => {
    const visibleRatio = galleryRunway.clientWidth / galleryRunway.scrollWidth;
    indicator.style.width = `${visibleRatio * 100}%`;
    updateIndicatorPosition();
  };

  // Function to update the position of the scrollbar indicator
  const updateIndicatorPosition = () => {
    const maxScrollLeft = galleryRunway.scrollWidth - galleryRunway.clientWidth;
    const scrollRatio = galleryRunway.scrollLeft / maxScrollLeft;
    const scrollbarWidth = scrollbar.clientWidth;
    const indicatorWidth = parseFloat(indicator.style.width);
    const newLeft = scrollRatio * (scrollbarWidth - (scrollbarWidth * indicatorWidth / 100));
    indicator.style.left = `${newLeft}px`;
    requestAnimationFrame(updateIndicatorPosition);
  };

  // Function to handle clicks on the scrollbar
  const scrollToClickPosition = (e) => {
    if (e.target === indicator) {
      console.log('Click on indicator - no action taken');
      return;
    }
    const scrollbarRect = scrollbar.getBoundingClientRect();
    const clickPositionRatio = (e.clientX - scrollbarRect.left) / scrollbarRect.width;
    const maxScrollLeft = galleryRunway.scrollWidth - galleryRunway.clientWidth;
    const newScrollLeft = maxScrollLeft * clickPositionRatio;
    galleryRunway.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    const indicatorNewLeft = clickPositionRatio * (scrollbarRect.width - indicator.clientWidth);
    indicator.style.left = `${indicatorNewLeft}px`;
    console.log(`Scrolling to ${newScrollLeft}px which is ${clickPositionRatio * 100}% of the gallery`);
  };

  // Attach event listeners
  scrollbar.addEventListener('click', scrollToClickPosition);
  window.addEventListener('resize', setIndicatorWidth);

  // Initial calls to set things up
  setIndicatorWidth();
  requestAnimationFrame(updateIndicatorPosition);

  // Attach other event listeners (for navigation arrow, open/close buttons, etc.)
  navigationArrow.addEventListener('click', () => {
    const direction = window.innerWidth / 2 > navigationArrow.getBoundingClientRect().right ? 'left' : 'right';
    slideGallery(direction);
  });

  const openButtons = document.querySelectorAll('.gallery-open');
  const closeButtons = document.querySelectorAll('.gallery-close');

  openButtons.forEach(button => button.addEventListener('click', toggleFullScreen));
  closeButtons.forEach(button => button.addEventListener('click', toggleFullScreen));

  const galleryRunwayWrappers = document.querySelectorAll('.gallery-runway-wrap');
  galleryRunwayWrappers.forEach(wrapper => {
    wrapper.addEventListener('mousemove', moveNavigationArrow);
    wrapper.addEventListener('mouseleave', () => toggleNavigationArrow('none'));
  });

  window.addEventListener('load', centerSecondFigure);
});