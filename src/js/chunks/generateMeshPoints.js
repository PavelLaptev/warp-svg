const generateMeshPoints = (width, height, amount) => {
  const checkAndRoundNumber = (length, index) => (length / amount) * index;

  const myArray = [...Array(amount).keys()];

  const myleft = myArray.map((item, i) => [0, checkAndRoundNumber(height, i)]);

  const myBottom = myArray.map((item, i) => [checkAndRoundNumber(width, i), height]);

  const myRight = myArray
    .map((item, i) => [width, checkAndRoundNumber(height, ++i)])
    .reverse();

  const myTop = [...Array(amount).keys()]
    .map((item, i) => [checkAndRoundNumber(width, ++i), 0])
    .reverse();

  return [...myleft, ...myBottom, ...myRight, ...myTop];
};

export default generateMeshPoints;
