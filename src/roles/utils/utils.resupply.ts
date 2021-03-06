import {pickupNearestRessource} from "./utils.carry";
import {mineNextEnergyResource, minersAlive} from "./utils.mine";

export function resupplyStructures(creep: Creep) {
  let targets = creep.room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return structure.structureType === STRUCTURE_SPAWN &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    }
  });
  if (targets.length === 0) {
    targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_TOWER &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
    });
  }
  if (targets.length === 0) {
    targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
    });
  }
  if (targets.length > 0
    && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0
    && !creep.memory.upgrading) {
    creep.memory.working = true;
    creep.say("Supplying");
  }
  if (targets.length === 0 || creep.store[RESOURCE_ENERGY] === 0)
    creep.memory.working = false;
  if (creep.memory.working) {
    const target = creep.pos.findClosestByRange(targets) as AnyStructure;
    const transfer = creep.transfer(target, RESOURCE_ENERGY);
    if (transfer === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, {visualizePathStyle: {stroke: "#ffffff"}});
    }
    return true;
  } else {
    if (minersAlive()) {
      const pickupResult = pickupNearestRessource(creep);
      if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0
        || (!pickupResult && creep.store[RESOURCE_ENERGY] > 0)) {
        creep.memory.working = true;
        return true;
      }
      return pickupResult;
    } else {
      mineNextEnergyResource(creep);
      if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
        creep.memory.working = true;
      }
      return true;
    }
  }
}
