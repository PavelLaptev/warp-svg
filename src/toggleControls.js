const toggleControls = () => {
  const showInfoBtn = document.getElementById("show-info");
  const infoBlock = document.getElementById("info-block");
  const showSettingsBtn = document.getElementById("show-settings");
  const settingsBlock = document.getElementById("settings-block");

  showInfoBtn.addEventListener("click", e => {
    e.target.classList.toggle("active");
    infoBlock.classList.toggle("hide");
  });

  showSettingsBtn.addEventListener("click", e => {
    e.target.classList.toggle("active");
    settingsBlock.classList.toggle("hide");
  });

  infoBlock
    .getElementsByClassName("close-btn")[0]
    .addEventListener("click", () => {
      showInfoBtn.classList.toggle("active");
      infoBlock.classList.toggle("hide");
    });

  settingsBlock
    .getElementsByClassName("close-btn")[0]
    .addEventListener("click", () => {
      showSettingsBtn.classList.toggle("active");
      settingsBlock.classList.toggle("hide");
    });

  // console.log(infoBlock.getElementsByClassName("close-btn")[0]);
};

export default toggleControls;
