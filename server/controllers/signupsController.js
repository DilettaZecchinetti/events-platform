export const signupForEvents = async (req, res) => {
  try {
    const { userName, email, eventId } = req.body;

    console.log("User signed up:", { userName, email, eventId });

    res.status(201).json({ message: "Sign-up recorder! " });
  } catch (err) {
    res.status(500).json({ message: "Failed to record sign-up " });
  }
};
