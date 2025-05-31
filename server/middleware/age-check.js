const ageCheck = (req, res, next) => {
    const { age } = req.body;

    if (!age) {
        return res.status(400).json({ message: "Age is required." });
    }

    if (age < 18) {
        return res.status(403).json({ message: "You must be at least 18 years old." });
    }

    next();
};

module.exports = ageCheck;