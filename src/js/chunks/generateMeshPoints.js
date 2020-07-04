const generateMeshPoints = (width, height, amount) => {
  const checkAndRoundNumber = (length, index) => {
    return (length / amount) * index;
  };

  const myArray = [...Array(amount).keys()];

  let myleft = myArray.map((item, i) => {
    return [0, checkAndRoundNumber(height, i)];
  });

  let myBottom = myArray.map((item, i) => {
    return [checkAndRoundNumber(width, i), height];
  });

  let myRight = myArray
    .map((item, i) => {
      return [width, checkAndRoundNumber(height, ++i)];
    })
    .reverse();

  let myTop = [...Array(amount).keys()]
    .map((item, i) => {
      return [checkAndRoundNumber(width, ++i), 0];
    })
    .reverse();

  return [...myleft, ...myBottom, ...myRight, ...myTop];
};

export default generateMeshPoints;
