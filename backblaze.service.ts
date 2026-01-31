import axios from 'axios';
import crypto from 'crypto';

const B2_CONFIG = {
  accountId: process.env.B2_ACCOUNT_ID || '',
  applicationKey: process.env.B2_APPLICATION_KEY || '',
  bucketId: process.env.B2_BUCKET_ID || '',
  apiUrl: 'https://api005.backblazeb2.com',
};

export const FOLDER_STRUCTURE = {
  ENTRADA: '00_ENTRADA',
  CATALOGADO: '01_CATALOGADO',
  PRODUCAO: '02_PRODUCAO',
  PUBLICADO: '03_PUBLICADO',
  ARQUIVADO: '04_ARQUIVADO',
} as const;

let authCache: any = null;

export async function authorizeB2() {
  if (authCache && authCache.expiresAt > Date.now()) {
    return { authorizationToken: authCache.token, apiUrl: authCache.apiUrl };
  }

  const authString = Buffer.from(`${B2_CONFIG.accountId}:${B2_CONFIG.applicationKey}`).toString('base64');
  
  const response = await axios.get(`${B2_CONFIG.apiUrl}/b2api/v2/b2_authorize_account`, {
    headers: { Authorization: `Basic ${authString}` },
  });

  authCache = {
    token: response.data.authorizationToken,
    apiUrl: response.data.apiInfo.storageApi.apiUrl,
    expiresAt: Date.now() + 23 * 60 * 60 * 1000,
  };

  return { authorizationToken: authCache.token, apiUrl: authCache.apiUrl };
}

export function generateStandardFileName(originalName: string, metadata: any) {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, '0');
  const dia = String(now.getDate()).padStart(2, '0');
  const uuid = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
  const extensao = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  
  const slugify = (text: string) => 
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  const areaSlug = slugify(metadata.area);
  const nucleoSlug = metadata.nucleo ? slugify(metadata.nucleo) : 'GERAL';
  const temaSlug = slugify(metadata.tema);
  const statusSlug = slugify(metadata.status);
  
  const fileName = `${ano}_${mes}_${dia}_${areaSlug}_${nucleoSlug}_${temaSlug}_${statusSlug}_${uuid}.${extensao}`;
  const folderPath = `${FOLDER_STRUCTURE.ENTRADA}/${ano}/${mes}/${dia}`;
  
  return { fileName, folderPath, fullPath: `${folderPath}/${fileName}` };
}

export async function getUploadUrl(filePath: string) {
  const auth = await authorizeB2();
  const response = await axios.post(
    `${auth.apiUrl}/b2api/v2/b2_get_upload_url`,
    { bucketId: B2_CONFIG.bucketId },
    { headers: { Authorization: auth.authorizationToken } }
  );
  
  return {
    uploadUrl: response.data.uploadUrl,
    authorizationToken: response.data.authorizationToken,
    filePath,
  };
}

export async function listFiles(prefix: string = '') {
  const auth = await authorizeB2();
  const response = await axios.post(
    `${auth.apiUrl}/b2api/v2/b2_list_file_names`,
    { bucketId: B2_CONFIG.bucketId, prefix, maxFileCount: 1000 },
    { headers: { Authorization: auth.authorizationToken } }
  );
  return response.data.files || [];
}
