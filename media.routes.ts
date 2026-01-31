import { Router } from 'express';
import { listFiles } from './backblaze.service';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { prefix = '' } = req.query;
    const files = await listFiles(prefix as string);
    res.json({ success: true, data: files, total: files.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
