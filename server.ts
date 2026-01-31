import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import routes
import uploadRoutes from './upload.routes';
import mediaRoutes from './media.routes';
import folderRoutes from './folder.routes';

app.use('/api/upload', uploadRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/folders', folderRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor RC Acervo rodando na porta ${PORT}`);
});
