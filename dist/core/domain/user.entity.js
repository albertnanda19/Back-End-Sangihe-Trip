"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    id;
    name;
    email;
    createdAt;
    constructor(id, name, email, createdAt = new Date()) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = createdAt;
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map