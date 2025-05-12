export const login = async (req, res) => {
  const { email, password } = req.body;

  if (email === "admin@example.com" && password === "password123") {
    res.status(200).json({ message: "Login successful", role: "staff" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
};
