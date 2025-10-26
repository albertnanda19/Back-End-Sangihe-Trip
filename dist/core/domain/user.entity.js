"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    id;
    name;
    email;
    firstName;
    lastName;
    avatarUrl;
    createdAt;
    constructor(id, name, email, firstName, lastName, avatarUrl, createdAt = new Date()) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt;
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map