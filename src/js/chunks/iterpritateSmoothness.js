const iterpritateSmoothness = (val) => {
  const newVal = Number(val);
  if (newVal === 0) {
    return 400;
  }
  if (newVal === 100) {
    return 200;
  }
  if (newVal === 200) {
    return 80;
  }
  if (newVal === 300) {
    return 30;
  }
  if (newVal === 400) {
    return 10;
  }
  return null;
};

export default iterpritateSmoothness;
