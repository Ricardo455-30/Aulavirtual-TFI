import axios from "axios";

const API_URL = "http://localhost:8000/auth"; // ajustamos después

export const loginRequest = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
