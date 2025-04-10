const passField = document.getElementById("password");
  const toggleText = document.getElementById("showPass");

  toggleText.addEventListener("click", () => {
    if (passField.type === "password") {
      passField.type = "text";
      toggleText.textContent = "Hide Password";
    } else {
      passField.type = "password";
      toggleText.textContent = "Show Password";
    }
  });