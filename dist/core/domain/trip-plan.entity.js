"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripPlan = void 0;
const uuid_1 = require("uuid");
class TripPlan {
    userId;
    name;
    startDate;
    endDate;
    peopleCount;
    tripType;
    isPublic;
    destinations;
    schedule;
    budget;
    notes;
    packingList;
    id;
    createdAt;
    constructor(userId, name, startDate, endDate, peopleCount, tripType, isPublic, destinations, schedule, budget, notes = null, packingList = [], id, createdAt) {
        this.userId = userId;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.peopleCount = peopleCount;
        this.tripType = tripType;
        this.isPublic = isPublic;
        this.destinations = destinations;
        this.schedule = schedule;
        this.budget = budget;
        this.notes = notes;
        this.packingList = packingList;
        this.id = id ?? (0, uuid_1.v4)();
        this.createdAt = createdAt ?? new Date();
    }
}
exports.TripPlan = TripPlan;
//# sourceMappingURL=trip-plan.entity.js.map