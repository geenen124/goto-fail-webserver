import index from "./index";
import timeline from "./timeline";
import uploadScp from "./upload-scp";
import users from "./users";
import presets from "./presets";
import shotCaller from "./shot-caller";
import director from "./director";
import cameraControl from "./camera-control";

// Module used to attach all routes to the correct urls
module.exports.addRoutes = (app) => {
    app.use("/", index);
    app.use("/timeline", timeline);
    app.use("/upload-scp", uploadScp);
    app.use("/", users);
    app.use("/presets", presets);
    app.use("/camera-control", cameraControl);
    app.use("/shot-caller", shotCaller);
    app.use("/director", director);
};
