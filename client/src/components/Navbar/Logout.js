// utils/logout.js or in your Navbar component
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  window.location.href = "/signin"; // or "/" for home
}
