import isTouch from './isTouch';

const loader = () => {
  window.onload = function () {
    if (!isTouch()) {
      document.getElementById('loader').style.display = 'none';
      document.getElementById('app').style.opacity = 1;
    } else {
      document.getElementById('loader').style.display = 'none';
      document.getElementById('if-mobile').style = {
        display: 'auto',
        opacity: 1,
      };
    }
  };
};

export default loader;
