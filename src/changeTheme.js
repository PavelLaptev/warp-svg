const changeTheme = () => {
  const app = document.getElementById("app");
  const swither = document.getElementById("switch-theme");

  swither.addEventListener("change", e => {
    app.classList.toggle("dark-theme");
  });
};

export default changeTheme;
