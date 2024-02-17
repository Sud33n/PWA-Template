document.addEventListener("DOMContentLoaded", function() {
  var container = document.querySelector('.imagelist');
  var autoScrollInterval;

  // Function to scroll the container horizontally
  function scrollToNext() {
      // Calculate the width of a single image
      var imageWidth = container.querySelector('img').offsetWidth;

      // Calculate the current scroll position
      var scrollLeft = container.scrollLeft;

      // Calculate the position to scroll to (next image)
      var nextScrollLeft = scrollLeft + imageWidth;

      // Check if reached the end of the container
      if (nextScrollLeft >= container.scrollWidth - container.clientWidth) {
          // Reset scroll position to the beginning without smooth transition
          container.scrollTo({ left: 0, behavior: 'auto' });
      } else {
          // Scroll to the next position with smooth transition
          container.scrollTo({ left: nextScrollLeft, behavior: 'smooth' });
      }
  }

  // Start auto-scrolling every 5 seconds
  function startAutoScroll() {
      autoScrollInterval = setInterval(scrollToNext, 3000);
  }

  // Stop auto-scrolling
  function stopAutoScroll() {
      clearInterval(autoScrollInterval);
  }

  // Start auto-scrolling initially
  startAutoScroll();

  // Pause auto-scrolling when hovering over the container
  container.addEventListener('mouseenter', stopAutoScroll);

  // Resume auto-scrolling when leaving the container
  container.addEventListener('mouseleave', startAutoScroll);

  // Function to update the center image
  function updateCenterImage() {
      var images = document.querySelectorAll('.imagelist > img');
      var containerRect = container.getBoundingClientRect();
      var containerCenterX = containerRect.left + containerRect.width / 2;

      images.forEach(function(image) {
          var imageRect = image.getBoundingClientRect();
          var imageCenterX = imageRect.left + imageRect.width / 2;

          if (Math.abs(imageCenterX - containerCenterX) <= imageRect.width / 2) {
              image.classList.add('enlarged');
          } else {
              image.classList.remove('enlarged');
          }
      });
  }

  // Call the updateCenterImage function when the container is scrolled
  container.addEventListener('scroll', updateCenterImage);
  // Call the updateCenterImage function on page load
  updateCenterImage();

  // Clone the first two images and append them to the end of the image list
  var firstImageClone = container.querySelector('img').cloneNode(true);
  var secondImageClone = container.querySelector('img:nth-child(2)').cloneNode(true);
  container.appendChild(firstImageClone);
  container.appendChild(secondImageClone);

});
