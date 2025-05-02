import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeProductList } from './index.mjs';

const app = express();
const PORT = 3000;

// Para __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para permitir CORS sin dependencias
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permitir todas las solicitudes de cualquier dominio
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Métodos permitidos
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Encabezados permitidos
  next();
});

// Servir archivos estáticos (opcional, si tienes una carpeta 'public' para archivos estáticos)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para el scraping
app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Falta URL' });

  try {
    const data = await scrapeProductList(url);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno de scraping' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
