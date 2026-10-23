import express from 'express';

const app = express();
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? 'localhost';

app.use(express.json());

app.get('/', (_request, response) => {
	response.json({ message: 'API du projet intégration' });
});
app.listen(port, host, () => {
    console.log(`Serveur lancé sur http://${host}:${port}`);
});

