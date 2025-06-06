"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server/server"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const PORT = process.env.PORT || 3001;
// Start the server
server_1.default.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
});
