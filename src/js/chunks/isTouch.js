const isTouch = () => {
  if ((('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) && window.screen.width <= 600) {
    console.log('touch event is true');
    return true;
  }
  console.log('touch event is false');
  return false;
};

export default isTouch;
