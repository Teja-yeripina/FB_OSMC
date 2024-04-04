const form = document.getElementById("loginForm");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("loginAdminEmail").value.trim(); // Trim email
  const password = document.getElementById("loginPassword").value.trim(); // Trim password

  const data = {
    email,
    password,
  };

  try {
    const response = await fetch("/adminLogin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      window.location.href = "/admin_HP.html";
    } else {
      document.getElementById("loginError").innerText =
        "Invalid email or password";
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("loginError").innerText =
      "An error occurred during login";
  }
});
