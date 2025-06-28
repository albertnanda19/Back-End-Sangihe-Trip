"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Destination = void 0;
class Destination {
    id;
    name;
    category;
    location;
    distanceKm;
    price;
    openHours;
    description;
    facilities;
    tips;
    images;
    video;
    createdAt;
    constructor(id, name, category, location, distanceKm, price, openHours, description, facilities, tips, images, video, createdAt = new Date()) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.location = location;
        this.distanceKm = distanceKm;
        this.price = price;
        this.openHours = openHours;
        this.description = description;
        this.facilities = facilities;
        this.tips = tips;
        this.images = images;
        this.video = video;
        this.createdAt = createdAt;
    }
}
exports.Destination = Destination;
//# sourceMappingURL=destination.entity.js.map