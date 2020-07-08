const dropZone = (callback) => {
  const loadBtn = document.getElementById('load-svg-btn');
  const loadInput = document.getElementById('load-svg-input');

  const toggleDropZone = (e, hideZonePreview) => {
    e.stopPropagation();
    e.preventDefault();
    dropZonePreview.classList.toggle('show');
    // hideZonePreview(dropZonePreview);
    typeof hideZonePreview === 'function' && hideZonePreview(dropZonePreview);
  };

  const dropEvent = (e, file, hideZonePreview) => {
    toggleDropZone(e, hideZonePreview);

    const fileReader = new FileReader();
    fileReader.readAsText(file);

    // console.log(e.type);
    fileReader.onload = () => {
      try {
        callback(fileReader.result);
      } catch (err) {
        console.error(err);
      }
    };
  };

  const dropZonePreview = document.getElementsByClassName(
    'dropzone-preview',
  )[0];

  const clickOnLoadInput = () => {
    loadInput.click();
  };

  window.addEventListener('dragenter', toggleDropZone);
  window.addEventListener('dragleave', toggleDropZone);
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('dragstart', (e) => e.preventDefault());
  window.addEventListener('drageend', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => dropEvent(e, e.dataTransfer.files[0]));

  loadBtn.addEventListener('click', clickOnLoadInput);
  loadInput.addEventListener('change', (e) => dropEvent(e, e.target.files[0], (zone) => { zone.classList.toggle('show'); }));
};

export default dropZone;
