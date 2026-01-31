import { Router } from 'express';
import { FOLDER_STRUCTURE } from './backblaze.service';

const router = Router();

router.get('/', (req, res) => {
  const folders = [
    { id: 'entrada', name: '00 - Entrada (Bruto)', slug: FOLDER_STRUCTURE.ENTRADA, description: 'Uploads iniciais', icon: '📥' },
    { id: 'catalogado', name: '01 - Catalogado', slug: FOLDER_STRUCTURE.CATALOGADO, description: 'Arquivos classificados', icon: '📁' },
    { id: 'producao', name: '02 - Em Produção', slug: FOLDER_STRUCTURE.PRODUCAO, description: 'Em edição', icon: '✂️' },
    { id: 'publicado', name: '03 - Publicado', slug: FOLDER_STRUCTURE.PUBLICADO, description: 'Aprovados', icon: '✅' },
    { id: 'arquivado', name: '04 - Arquivado', slug: FOLDER_STRUCTURE.ARQUIVADO, description: 'Backup', icon: '📦' },
  ];
  res.json({ success: true, data: folders });
});

export default router;
