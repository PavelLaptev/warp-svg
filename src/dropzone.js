const dropZone = callback => {
  const dropZonePreview = document.getElementsByClassName(
    "dropzone-preview"
  )[0];

  // console.log(dropZonePreview);

  const toggleDropZone = e => {
    e.stopPropagation();
    e.preventDefault();
    dropZonePreview.classList.toggle("show-dropzone");
    // console.log(e.type);
  };

  const dropEvent = e => {
    toggleDropZone(e);

    let fileReader = new FileReader();
    fileReader.readAsText(e.dataTransfer.files[0]);

    fileReader.onload = () => {
      try {
        callback(fileReader.result);
      } catch (err) {
        console.error(err);
      }
    };
  };

  window.addEventListener("dragenter", toggleDropZone);
  window.addEventListener("dragleave", toggleDropZone);
  window.addEventListener("dragover", e => e.preventDefault());
  window.addEventListener("dragstart", e => e.preventDefault());
  window.addEventListener("drageend", e => e.preventDefault());
  window.addEventListener("drop", dropEvent);
};

export default dropZone;
