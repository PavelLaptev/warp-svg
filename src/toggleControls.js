const toggleControls = () => {
  const showInfoBtn = document.getElementById('show-info');
  const infoBlock = document.getElementById('info-block');
  const showSettingsBtn = document.getElementById('show-settings');
  const settingsBlock = document.getElementById('settings-block');

  // let showSettings = true;
  // let showInfo = true

  // const igToggle = (flag, elArr) => {
  //   elArr.map(i => {
  //     if (flag) {
  //       i.classList.add("active")
  //     } else {
  //       i.classList.remove()
  //     }
  //   })
  // }

  // const toggleClasses = (target, elArr, classArr) => {
  //   // console.log(elArr);
  //   elArr.map((item, i) => {
  //     target.addEventListener('click', () => {
  //       console.log(classArr[i]);
  //       item.classList.toggle(classArr[i]);
  //       item.classList.toggle(classArr[i]);
  //     });
  //   });
  // };

  // toggleClasses(showInfoBtn, [showInfoBtn, infoBlock], ['active', 'hide']);

  showInfoBtn.addEventListener('click', (e) => {
    e.target.classList.toggle('active');
    infoBlock.classList.toggle('hide');
  });

  showSettingsBtn.addEventListener('click', (e) => {
    e.target.classList.toggle('active');
    settingsBlock.classList.toggle('hide');
  });

  infoBlock
    .getElementsByClassName('close-btn')[0]
    .addEventListener('click', () => {
      showInfoBtn.classList.toggle('active');
      infoBlock.classList.toggle('hide');
    });

  settingsBlock
    .getElementsByClassName('close-btn')[0]
    .addEventListener('click', () => {
      showSettingsBtn.classList.toggle('active');
      settingsBlock.classList.toggle('hide');
    });

  // console.log(infoBlock.getElementsByClassName("close-btn")[0]);
};

export default toggleControls;
