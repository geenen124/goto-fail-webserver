import express from "express";
import CameraOperator from "../objects/CameraOperator";
const router = express.Router(); // eslint-disable-line new-cap

router.post("/picked-user", (req, res) => {
    // eslint-disable-next-line
    req.session.pickedUser = req.body.pickedUser;

    res.json({ success: true });
});

router.get("/get-users", (req, res) => {
    res.json({ users: [
        new CameraOperator(0, "Jan", [0,1]),
        new CameraOperator(1, "Klaas", [0,2]),
        new CameraOperator(2, "Piet", []),
    ] });
});

module.exports = router;
