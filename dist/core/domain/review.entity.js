"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
class Review {
    id;
    userId;
    destinationId;
    rating;
    comment;
    images;
    helpful;
    createdAt;
    updatedAt;
    constructor(id, userId, destinationId, rating, comment, images = [], helpful = 0, createdAt = new Date(), updatedAt = new Date()) {
        this.id = id;
        this.userId = userId;
        this.destinationId = destinationId;
        this.rating = rating;
        this.comment = comment;
        this.images = images;
        this.helpful = helpful;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Review = Review;
//# sourceMappingURL=review.entity.js.map