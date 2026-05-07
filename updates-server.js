/**
 * Servidor de OTA Updates para Streamflix
 * Roda em: https://soothing-lamentation366.runable.site/updates
 * 
 * Funciona com Expo Updates - atualiza app sem precisar recompilar APK
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();

// Diretório onde os bundles são armazenados
const UPDATES_DIR = path.join(process.cwd(), 'public/updates');
const CURRENT_UPDATE_FILE = path.join(UPDATES_DIR, 'current.json');

// Garante que o diretório existe
if (!fs.existsSync(UPDATES_DIR)) {
  fs.mkdirSync(UPDATES_DIR, { recursive: true });
}

/**
 * GET /updates
 * Retorna o manifest de atualização para o app
 * Expo chama isso automaticamente ao abrir o app
 */
app.get('/updates', (req, res) => {
  try {
    // Lê a atualização atual
    let currentUpdate = {
      runtimeVersion: '1.0.0',
      id: 'default',
      createdAt: new Date().toISOString(),
      launchAsset: {
        url: 'https://soothing-lamentation366.runable.site/updates/bundle.js',
        contentType: 'application/javascript',
      },
      assets: [
        {
          url: 'https://soothing-lamentation366.runable.site/updates/assets.bundle',
          contentType: 'application/octet-stream',
          hash: 'sha256-' + crypto.randomBytes(32).toString('hex'),
          key: 'assets',
        },
      ],
      metadata: {
        updateGroup: 'streamflix-main',
        'expo-runtime-version': '1.0.0',
      },
    };

    // Se existe arquivo de update customizado, usa ele
    if (fs.existsSync(CURRENT_UPDATE_FILE)) {
      try {
        const custom = JSON.parse(fs.readFileSync(CURRENT_UPDATE_FILE, 'utf8'));
        currentUpdate = { ...currentUpdate, ...custom };
      } catch (e) {
        console.error('Erro ao ler atualização customizada:', e.message);
      }
    }

    res.json(currentUpdate);
  } catch (error) {
    console.error('Erro ao servir update:', error);
    res.status(500).json({ error: 'Erro ao buscar atualização' });
  }
});

/**
 * POST /updates/publish
 * Publica uma nova atualização
 * Uso: curl -X POST http://localhost:3000/updates/publish -H "Content-Type: application/json" -d '{"version":"1.0.5"}'
 */
app.post('/updates/publish', express.json(), (req, res) => {
  try {
    const { version, changelog, assets } = req.body;

    if (!version) {
      return res.status(400).json({ error: 'versão obrigatória' });
    }

    const updateData = {
      runtimeVersion: version,
      id: `update-${Date.now()}`,
      createdAt: new Date().toISOString(),
      changelog: changelog || '',
      launchAsset: {
        url: `https://soothing-lamentation366.runable.site/updates/bundle-${version}.js`,
        contentType: 'application/javascript',
      },
      assets: assets || [
        {
          url: `https://soothing-lamentation366.runable.site/updates/assets-${version}.bundle`,
          contentType: 'application/octet-stream',
          key: 'assets',
        },
      ],
      metadata: {
        updateGroup: 'streamflix-main',
        'expo-runtime-version': version,
      },
    };

    fs.writeFileSync(CURRENT_UPDATE_FILE, JSON.stringify(updateData, null, 2));

    res.json({
      success: true,
      message: `Atualização ${version} publicada`,
      update: updateData,
    });
  } catch (error) {
    console.error('Erro ao publicar atualização:', error);
    res.status(500).json({ error: 'Erro ao publicar atualização' });
  }
});

/**
 * GET /updates/status
 * Retorna status da atualização atual
 */
app.get('/updates/status', (req, res) => {
  try {
    let current = null;
    if (fs.existsSync(CURRENT_UPDATE_FILE)) {
      current = JSON.parse(fs.readFileSync(CURRENT_UPDATE_FILE, 'utf8'));
    }

    res.json({
      currentUpdate: current,
      updatesDir: UPDATES_DIR,
      hasCustomUpdate: fs.existsSync(CURRENT_UPDATE_FILE),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /updates/:file
 * Serve bundles de atualização
 */
app.get('/updates/:file', (req, res) => {
  try {
    const filePath = path.join(UPDATES_DIR, req.params.file);

    // Segurança: evita path traversal
    if (!filePath.startsWith(UPDATES_DIR)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'Arquivo não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /updates/rollback
 * Volta pra atualização anterior
 */
app.delete('/updates/rollback', (req, res) => {
  try {
    if (fs.existsSync(CURRENT_UPDATE_FILE)) {
      fs.unlinkSync(CURRENT_UPDATE_FILE);
      res.json({ success: true, message: 'Voltado pra versão padrão' });
    } else {
      res.json({ message: 'Já está na versão padrão' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Updates rodando na porta ${PORT}`);
  console.log(`📡 Updates endpoint: https://soothing-lamentation366.runable.site/updates`);
  console.log(`📊 Status: https://soothing-lamentation366.runable.site/updates/status`);
});
