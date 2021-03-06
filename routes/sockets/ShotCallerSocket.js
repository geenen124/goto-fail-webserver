/**
 * socket.io handlers for shot callers.
 * Exposes methods to enable broadcasting of shot events.
 */
import log4js from "log4js";
import ProjectManager from "../../objects/ProjectManager";

const logger = log4js.getLogger();

// Fetch the Project's DirectorTimeline
const getDirectorTimeline = callback => {
    ProjectManager.waitForXML((projectManager) => {
        if (projectManager.data) {
            const directorTimeline = projectManager.data.scriptingProject.directorTimeline;
            callback(directorTimeline);
        } else {
            callback(null);
        }
    });
};

/**
 * Class instantiated to handle shot caller events.
 */
class ShotCallerSocket {
    /**
     * Constructor that accepts:
     * io: Socket.io object
     * currentCount: Current Count
     * advanceCountCallBack: Handle For Count Update
     * setCountCallBack: Handle For Count Update
     */
    constructor(io, currentCount, advanceCountCallBack, setCountCallBack) {
        this.namespace = io.of("/shotCallers");
        this.advanceCountCallBack = advanceCountCallBack;
        this.setCountCallBack = setCountCallBack;
        this.currentCount = currentCount;
        this.live = false;

        this.namespace.on("connection", (socket) => {
            logger.info("New Shot Caller Connection");
            // Initialize with Current Server Count
            this.sendNextCount(this.currentCount);
            this.setLive(this.live);

            socket.on("advance_count", () => {
                this.advanceCountCallBack();
            });

            socket.on("get_current_shot", () => {
                getDirectorTimeline((directorTimeline) => {
                    const currentShot = this.findCurrentShot(directorTimeline);

                    logger.info("Sending Current DirectorShot");
                    socket.emit("current_director_shot", {
                        currentShot,
                    });
                });
            });

            socket.on("get_next_shot", () => {
                getDirectorTimeline((directorTimeline) => {
                    logger.info("Sending Next Director Shot");
                    const nextShot = this.findNextShot(directorTimeline);
                    socket.emit("next_director_shot", {
                        nextShot,
                    });
                });
            });

            socket.on("reset_count", () => {
                this.setCountCallBack(0);
            });

            socket.on("decrease_count", () => {
                if (this.currentCount > 0) {
                    this.setCountCallBack(this.currentCount - 1);
                }
            });
        });
    }

    // Set the count and then send updated version to client
    sendNextCount(newCount) {
        logger.info("Sending Shot Caller New Count");
        this.currentCount = newCount;
        this.namespace.emit("next_count", {
            newCount,
        });
    }

    // Find the current DirectorShot
    findCurrentShot(directorTimeline) {
        if (directorTimeline) {
            logger.info(directorTimeline.getDirectorShots());
            const candidates = directorTimeline.getDirectorShots().reverse()
                .filter((shot) => { // eslint-disable-line arrow-body-style
                    return shot.beginCount <= this.currentCount
                        && shot.endCount > this.currentCount;
                });
            logger.info(candidates);
            if (candidates.length === 0) {
                return null;
            }
            return candidates[0];
        }
        return null;
    }

    // Find the next DirectorShot
    findNextShot(directorTimeline) {
        if (directorTimeline) {
            const nextShots = directorTimeline.getDirectorShots()
                .filter((shot) => { // eslint-disable-line arrow-body-style
                    return shot.beginCount > this.currentCount;
                });
            if (nextShots.length !== 0) {
                return nextShots[0];
            }
        }
        return null;
    }

    // Send the updated live value
    setLive(live) {
        this.live = live;
        this.namespace.emit("set_client_live", {
            live,
        });
    }
}

export default ShotCallerSocket;
