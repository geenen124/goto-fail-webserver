import express from "express";
import ProjectManager from "../objects/ProjectManager";
import User from "../objects/User";
const router = express.Router(); // eslint-disable-line new-cap

// Set picked user
router.post("/picked-user", (req, res) => {
    // eslint-disable-next-line
    req.session.pickedUser = req.body.pickedUser;
    req.session.save(() => {
        res.json({ success: true });
    });
});

// Get users data
router.get("/get-users", (req, res) => {
    ProjectManager.waitForXML((projectManager) => {
        const data = projectManager.data;
        res.json({
            users: data.scriptingProject.users,
        });
    });
});

// Update users data
router.post("/update-users", (req, res) => {
    ProjectManager.waitForXML((projectManager) => {
        const data = projectManager.data;
        // Check if data exists
        if (data) {
            data.scriptingProject.users =
                req.body.users.map((user) => User.parseFromJson(user));

            ProjectManager.waitForWriteXML(() => {
                res.json({ success: true });
            });
        } else {
            res.json({ success: false });
        }
    });
});

module.exports = router;
