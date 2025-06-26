"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseMessage = exports.RESPONSE_MESSAGE = void 0;
const common_1 = require("@nestjs/common");
exports.RESPONSE_MESSAGE = 'response_message';
const ResponseMessage = (message) => (0, common_1.SetMetadata)(exports.RESPONSE_MESSAGE, message);
exports.ResponseMessage = ResponseMessage;
//# sourceMappingURL=response.decorator.js.map