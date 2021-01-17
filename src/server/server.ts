import http from 'http';
import path from 'path';
import express from 'express';

class App {
    private server: http.Server;
    private readonly port: number;

    constructor(port: number) {
        this.port = port;
        const app = express();

        // Définition des routes
        app.use(express.static(path.join(__dirname, '../client')));
        app.use('/build/three.module.js', express.static(path.join(__dirname, '../../node_modules/three/build/three.module.js')))
        app.use('/jsm/controls/OrbitControls', express.static(path.join(__dirname, '../../node_modules/three/examples/jsm/controls/OrbitControls.js')))

        // Démarrage du serveur
        this.server = new http.Server(app);
    }

    public start() {
        this.server.listen(this.port, () => {
            console.log('Listening on port ' + this.port + '...');
        });
    }
}

new App(3000).start();
