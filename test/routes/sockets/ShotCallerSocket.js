import app from "../../../app.js";
import socketApp from "../../../routes/sockets/sockets.js";
import ProjectManager from "../../../objects/ProjectManager.js";
import DirectorTimeline from "../../../objects/DirectorTimeline.js";
import DirectorShot from "../../../objects/DirectorShot.js";
import socketClient from "socket.io-client";
import http from "http";
import { expect } from "chai";

describe("Routes: ShotCaller Sockets", () => {
    const options = {
        "path": "/socket.io",
        "force new connection": true
    };

    const socketURL = "http://localhost:3000/shotCallers";

    let client = null;
    let server = null;
    let socketServer = null;

    before(function (done) {
        this.timeout(0);
        server = http.Server(app);
        socketServer = socketApp(server);
        server.listen(3000, () => {
            client = socketClient.connect(socketURL, options);
            client.on("connect", data => {
                client.removeListener("connect");
                done();
            });
        });
    });

    it("Should Be Able To Advance The Count", done => {
        client.on("next_count", data => {
            expect(data.newCount).to.exist;
            done();
        });
        client.emit("advance_count");
    });

    it("Should Be Able To Request The Current Shot", done => {
        client.on("current_director_shot", data => {
            expect(data).to.have.property("currentShot");
            // Ensure running only once for subsequent tests
            client.removeListener("current_director_shot");
            done();
        });
        client.emit("get_current_shot");
    });

    it("Should Be Able To Request Current Shot If No Data Present", done => {
        ProjectManager.waitForXML(projectManager => {
            const tempData = projectManager.data;
            projectManager.data = null;
            client.on("current_director_shot", data => {
                expect(data).to.have.property("currentShot");
                projectManager.data = tempData;
                client.removeListener("current_director_shot");
                done();
            });
            client.emit("get_current_shot");
        });
    });

    it("Should Be Able To Request The Next Shot", done => {
        client.emit("get_next_shot");
        client.on("next_director_shot", data => {
            expect(data).to.have.property("nextShot");
            // Ensure running only once for subsequent tests
            client.removeListener("next_director_shot");
            done();
        });
    });

    it("Should Be Able To Request Next Shot If No Data Present", done => {
        ProjectManager.waitForXML(projectManager => {
            const tempData = projectManager.data;
            projectManager.data = null;
            client.on("next_director_shot", data => {
                expect(data).to.have.property("nextShot");
                projectManager.data = tempData;
                client.removeListener("next_director_shot");
                done();
            });
            client.emit("get_next_shot");
        });
    });

    it ("Should Be Able To Request Current Shot If Shot Is Present", done => {
        ProjectManager.waitForXML(projectManager => {
            const tempData = projectManager.data;
            // Mock director timeline data
            const directorTimeline = new DirectorTimeline("Director Timeline");
            directorTimeline.addDirectorShot(new DirectorShot("Shot", "Description", 0, 1000,
                                                   0, 0, [], []));
            projectManager.data = {
                scriptingProject: {
                    directorTimeline,
                }
            };
            client.on("current_director_shot", data => {
                expect(data.currentShot).to.exist;
                projectManager.data = tempData;
                client.removeListener("current_director_shot");
                done();
            })
            client.emit("get_current_shot");
        });
    });

    it("Should Be Able To Request Current Shot If No Current Shot Present", done => {
        ProjectManager.waitForXML(projectManager => {
            const tempData = projectManager.data;
            // Mock director timeline data
            const directorTimeline = new DirectorTimeline("Director Timeline");
            projectManager.data = {
                scriptingProject: {
                    directorTimeline,
                }
            };

            client.on("current_director_shot", data => {
                expect(data.currentShot).to.be.null;
                projectManager.data = tempData;
                client.removeListener("current_director_shot");
                done();
            })
            client.emit("get_current_shot");
        });
    });

    it("Should Be Able To Request Next Shot If No Next Shot Present", done => {
        ProjectManager.waitForXML(projectManager => {
            const tempData = projectManager.data;
            // Mock director timeline data
            const directorTimeline = new DirectorTimeline("Director Timeline");
            projectManager.data = {
                scriptingProject: {
                    directorTimeline,
                }
            };

            client.on("next_director_shot", data => {
                expect(data.nextShot).to.be.null;
                projectManager.data = tempData;
                client.removeListener("next_director_shot");
                done();
            })
            client.emit("get_next_shot");
        });
    })

    after(function (done) {
        this.timeout(0);
        client.close();
        server.close(() => {
            setImmediate(() => server.emit("close"));
            done();
        });
    });
});
