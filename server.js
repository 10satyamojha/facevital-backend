require('dotenv').config();
const App = require('./src/app');

const PORT = process.env.PORT || 5000;

const app = new App();
app.start(PORT);
