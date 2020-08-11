const downloadAsFile = (content, filename, contentType) => {
  if (!contentType) contentType = 'application/octet-stream';
  const a = document.createElement('a');
  const blob = new Blob([content], { type: contentType });
  a.href = window.URL.createObjectURL(blob);
  a.download = filename;
  a.click();
};

export default downloadAsFile;
