import { Vector3Builder, Vector3Utils } from "./minecraft-math";
import { EasingType, world, system } from "@minecraft/server";

// Some codes are adapted from setCameraRelativeToPlayerEyes.ts on jayledev script API website
function getAbsoluteLocationFromViewAnchor(
    anchor,
    location,
    viewDirection
) {
    const dirz = new Vector3Builder(viewDirection);
    const dirx = new Vector3Builder(dirz.z, 0, -dirz.x);
    const diry = Vector3Utils.cross(dirz, dirx);
    const xo = Vector3Utils.scale(dirx, anchor.x);
    const yo = Vector3Utils.scale(diry, anchor.y);
    const zo = Vector3Utils.scale(dirz, anchor.z);

    return new Vector3Builder(location).add(xo).add(yo).add(zo);
}

function setCamera(player, anchorX, anchorY, anchorZ) {
    const headLocation = player.getHeadLocation();
    const viewDirection = player.getViewDirection();
    const anchor = new Vector3Builder(anchorX, anchorY, anchorZ);
    const location = getAbsoluteLocationFromViewAnchor(anchor, headLocation, viewDirection);

    player.camera.setCamera("minecraft:free", {
        location: location,
        rotation: player.getRotation(), 
        easeOptions: {
            easeTime: 0.1,
            easeType: EasingType.Linear,
        },
    });
}

function toggleCameraStatus(player) {
    const cameraStatus = player.getDynamicProperty("ostc") || false;
    player.setDynamicProperty("ostc", !cameraStatus);
    return !cameraStatus;
}

function ostc(player, anchorX, anchorY, anchorZ) {
    const newStatus = toggleCameraStatus(player);

    if (newStatus) {
        player.sendMessage("§bThe camera is now §l§aON§r§b!");
        system.runInterval(() => {
            if (!player.getDynamicProperty("ostc")) {
                return;
            }
            setCamera(player, anchorX, anchorY, anchorZ);
        }, 0.1);
    } else {
        system.run(()=>player.camera.clear());
        player.sendMessage("§bThe camera is now §l§cOFF§r§b!");
    }
}

export { ostc };