"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Destination = void 0;
class Destination {
    id;
    name;
    slug;
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
    rating;
    totalReviews;
    viewCount;
    activities;
    phone;
    email;
    website;
    isFeatured;
    constructor(id, name, slug, category, location, distanceKm, price, openHours, description, facilities, tips, images, video, createdAt = new Date(), rating = 0, totalReviews = 0, viewCount = 0, activities = [], phone = '', email = '', website = '', isFeatured = false) {
        this.id = id;
        this.name = name;
        this.slug = slug;
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
        this.rating = rating;
        this.totalReviews = totalReviews;
        this.viewCount = viewCount;
        this.activities = activities;
        this.phone = phone;
        this.email = email;
        this.website = website;
        this.isFeatured = isFeatured;
    }
}
exports.Destination = Destination;
//# sourceMappingURL=destination.entity.js.map