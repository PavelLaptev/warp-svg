const checkAndRoundNumber = (numA, numB) => {
  // console.log(Math.round(numA / numB))
  return Math.round(numA / numB) === Infinity ? 0 : Math.round(numA / numB);
};

const generateMeshPoints = (width, height, amount) => {
  const myArray = [...Array(amount).keys()];
  // let amountPartWidth = width / amount
  // console.log(amountPartWidth)

  let myleft = myArray
    .map((item, i) => {
      return [0, checkAndRoundNumber(height, i)];
    })
    .reverse();

  myleft.unshift(myleft.pop());

  let myBottom = myArray
    .map((item, i) => {
      return [checkAndRoundNumber(width, i), height];
    })
    .reverse();

  // myBottom.unshift(myBottom.pop());
  myBottom.pop();
  // myBottom.shift()

  let myRight = myArray.map((item, i) => {
    return [width, checkAndRoundNumber(height, i)];
  });
  // .reverse();

  myRight.shift();
  // myRight.unshift(myRight.pop());
  // myRight.pop()
  myRight.shift();
  myRight.reverse();
  // myRight.unshift()

  let myTop = [...Array(amount).keys()]
    .map((item, i) => {
      return [checkAndRoundNumber(width, i), 0];
    })
    .reverse();

  // myTop.shift()
  myTop.unshift(myTop.pop());

  myTop.reverse();
  myTop.pop();

  let myArr = [...myleft, ...myBottom, ...myRight, ...myTop];

  // console.log(myArr);
  // console.log(remove_duplicates_es6([...myleft, ...myBottom, ...myRight, ...myTop]))
  return myArr;
};

export default generateMeshPoints;
