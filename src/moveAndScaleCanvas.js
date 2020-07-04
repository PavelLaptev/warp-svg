import Draggable from 'gsap/Draggable';

const moveAndScaleCanvas = (movingElement) => {
  const canvasDrag = Draggable.create(movingElement, {
    trigger: document.body,
    cursor: 'auto',
  });

  canvasDrag[0].disable();

  // "SPACE" KEY PRESSED
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space') {
      canvasDrag[0].enable();
      document.body.style.cursor = 'grab';
    }
  });

  document.addEventListener('keyup', function (e) {
    if (e.code === 'Space') {
      canvasDrag[0].disable();
      document.body.style.cursor = 'default';
    }
  });

  // const zoomElement = document.getElementById('scale-wrap');
  // let zoom = 1;

  // document.addEventListener(
  //   'wheel',
  //   function (e) {
  //     if (e.wheelDelta > 0) {
  //       movingElement.style.transform = `scale(${(zoom += 0.01)})`;
  //       // console.log(e);
  //     } else {
  //       movingElement.style.transform = `scale(${(zoom -= 0.01)})`;
  //     }
  //   },
  //   { passive: false }
  // );

  // document.addEventListener('scroll', function (e) {
  //   console.log(window.scrollY);
  // });
};

export default moveAndScaleCanvas;
