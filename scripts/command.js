import { world } from "@minecraft/server";
import { ostc } from "./head_camera";

const cmdChar = ";";
const cmdAbbrv = ["over-the-shoulder-cam", "ots", "otscam", "otsc"];
const defaultValues = { // better one: -1.5 0 -2.5
    anchorX: -1.5,
    anchorY: 0,
    anchorZ: -2.5,
};

// Checks if the sender has operator permissions
function requireOp(sender, callback) {
    if (sender.isOp()) {
        callback();
    } else {
        sender.sendMessage("§cYou do not have permission to use this command.");
    }
}

// chat command solve function
function parseCommand(command) {
    const [cmd, subCommand, ...args] = command.split(" ");
    return { cmd, subCommand, args };
}

// Dealt with the chat event
world.beforeEvents.chatSend.subscribe((event) => {
    const { sender, message } = event;

    if (!message.startsWith(cmdChar)) return;

    event.cancel = true;
    const { cmd, subCommand, args } = parseCommand(message.slice(1));
    console.log(JSON.stringify(args))
    if (!cmdAbbrv.includes(cmd)) {
        sender.sendMessage(`§cInvalid command. Type ${cmdChar}${cmdAbbrv[1]} help for a list of otsc commands.`);
        return;
    }

    if (!subCommand) {
        ostc(sender, defaultValues.anchorX, defaultValues.anchorY, defaultValues.anchorZ);
        return;
    }

    switch (subCommand) {
        case "help":
            sender.sendMessage(`
===== §l§aOver The Shoulder Commands§r =====
${cmdChar}${cmdAbbrv[1]} §7- Toggles the camera for yourself§r
${cmdChar}${cmdAbbrv[1]} toggle §7- Toggles the camera for yourself§r
${cmdChar}${cmdAbbrv[1]} toggleAll [on/off]§7- Toggles on or off the camera for all players §l§b[OP]§r
${cmdChar}${cmdAbbrv[1]} set anchor §7- Set the anchor values back to the default values§l§b[OP]§r
${cmdChar}${cmdAbbrv[1]} set anchor <x> <y> <z> §7- Sets the camera anchor §l§b[OP]§r
            `);
            break;

        case "toggle":
            ostc(sender, defaultValues.anchorX, defaultValues.anchorY, defaultValues.anchorZ);
            break;
        case "toggleAll":
            requireOp(sender, () => {
                let globalStatus;
                if (args[0] === "on") {
                    globalStatus = true; 
                } else if (args[0] === "off") { 
                    globalStatus = false; 
                } else {
                    globalStatus = true; // default to on if no argument is provided
                }
        
                world.getPlayers().forEach((player) => {
                    player.setDynamicProperty("otsc", globalStatus);
                    ostc(player, defaultValues.anchorX, defaultValues.anchorY, defaultValues.anchorZ);
                });
        
                sender.sendMessage(`§bToggled ${globalStatus ? "§l§aON" : "§l§cOFF"}§r§b camera for all players.`);
            });
            break;
        
        case "set":
            if (args[0] === "anchor") {
                requireOp(sender, () => {
                    if (args.length === 1) {
                        Object.assign(defaultValues, { anchorX: -0.75, anchorY: 0, anchorZ: -1.5 });
                        sender.sendMessage("§bSet camera anchor back to default values successfully.");
                    } else {
                        
                        const x = Number(args[1])
                        const y = Number(args[2])
                        const z = Number(args[3])
                        if (!isNaN(x) && !isNaN(y) && !isNaN(z)){
                            defaultValues.anchorX = x;
                            defaultValues.anchorY = y;
                            defaultValues.anchorZ = z;
                            sender.sendMessage(`§bSet camera anchor to ${x} ${y} ${z} successfully.`)
                        }
                        else {
                            sender.sendMessage(`§cThe "x", "y" or "z" value is not a number. Type ${cmdChar}${cmdAbbrv[1]} help for a list of otsc commands.`)
                        }
                    }
                });
            } else {
                sender.sendMessage(`§cInvalid command. Type ${cmdChar}${cmdAbbrv[1]} help for a list of otsc commands.`);
            }
            break;

        default:
            sender.sendMessage(`§cInvalid command. Type ${cmdChar}${cmdAbbrv[1]} help for a list of otsc commands.`);
    }
});
