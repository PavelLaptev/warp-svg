import downloadAsFile from "./downloadAsFile";

const saveResult = (btn, content) => {
  btn.onclick = () => {
    downloadAsFile(
      new XMLSerializer().serializeToString(content),
      "testSVG.svg"
    );
  };
};

export default saveResult;
