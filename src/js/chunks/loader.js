const loader = () => {
  window.onload = function () {
    document.getElementById('app').style.opacity = 1;
    document.getElementById('loader').style.display = 'none';
  };
};

export default loader;
