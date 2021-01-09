"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
class App {
    constructor(port) {
        this.port = port;
        const app = express_1.default();
        // Définition des routes
        app.use(express_1.default.static(path_1.default.join(__dirname, '../client')));
        app.use('/three.module.js', express_1.default.static(path_1.default.join(__dirname, '../../node_modules/three/build/three.module.js')));
        // Démarrage du serveur
        this.server = new http_1.default.Server(app);
    }
    start() {
        this.server.listen(this.port, () => {
            console.log('Listening on port ' + this.port + '...');
        });
    }
}
new App(3000).start();
//# sourceMappingURL=server.js.map