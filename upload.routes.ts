import { Router } from 'express';
import { generateStandardFileName, getUploadUrl } from './backblaze.service';

const router = Router();

router.post('/presigned', async (req, res) => {
  try {
    const { filename, metadata } = req.body;

    if (!filename || !metadata) {
      return res.status(400).json({ error: 'Filename e metadata são obrigatórios' });
    }

    const { fullPath } = generateStandardFileName(filename, {
      area: metadata.area || 'GERAL',
      nucleo: metadata.nucleo,
      tema: metadata.tema || 'GERAL',
      status: metadata.status || 'ENTRADA_BRUTO',
    });

    console.log('Nome padronizado:', fullPath);

    const uploadData = await getUploadUrl(fullPath);

    res.json({
      success: true,
      data: {
        presignedUrl: uploadData.uploadUrl,
        authorizationToken: uploadData.authorizationToken,
        filePath: fullPath,
        headers: {
          'Authorization': uploadData.authorizationToken,
          'X-Bz-File-Name': encodeURIComponent(fullPath),
          'Content-Type': req.body.contentType || 'application/octet-stream',
          'X-Bz-Content-Sha1': 'do_not_verify',
        }
      }
    });

  } catch (error: any) {
    console.error('Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/complete', async (req, res) => {
  res.json({ success: true, data: { message: 'Upload confirmado' } });
});

router.get('/test', async (req, res) => {
  try {
    const { authorizeB2 } = await import('./backblaze.service');
    const auth = await authorizeB2();
    res.json({ success: true, message: 'Conexão OK', data: { apiUrl: auth.apiUrl } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
