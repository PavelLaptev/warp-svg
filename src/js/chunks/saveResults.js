import downloadAsFile from './downloadAsFile';

const saveResult = (btn, content) => {
  btn.onclick = () => {
    downloadAsFile(
      new XMLSerializer().serializeToString(content),
      'warped-svg.svg',
    );
  };
};

export default saveResult;
