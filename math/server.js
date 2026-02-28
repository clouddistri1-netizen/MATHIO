const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const os = require('os');
const { v4: uuidv4 } = require('uuid'); // Install using: npm install uuid
const cookieParser = require('cookie-parser'); // Install using: npm install cookie-parser

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); // This must be before your routes

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/basics', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'howToPlay.html'));
});


app.get('/index', (req, res) => {


    // Check if the `clientId` cookie exists
    let clientIdentifier = req.cookies.clientId;

    if (!clientIdentifier) {
        // Generate a new UUID if the `clientId` cookie does not exist
        clientIdentifier = uuidv4();

        // Set the `clientId` cookie
        res.cookie('clientId', clientIdentifier, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 365 * 3 }); // 1 year
    }

  const playerName = req.query.playerName;
  if (!playerName) {
    return res.status(400).send('Nome do jogador é obrigatório!');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/game', (req, res) => {
  const playerName = req.query.playerName;
  if (!playerName) {
    return res.status(400).send('Nome do jogador é obrigatório!');
  }
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

app.get('/blitz', (req, res) => {
    const playerName = req.query.playerName;
    if (!playerName) {
      return res.status(400).send('Nome do jogador é obrigatório!');
    }
    res.sendFile(path.join(__dirname, 'public', 'blitz.html'));
  });

  app.get('/grandPrix', (req, res) => {
    const playerName = req.query.playerName;
    if (!playerName) {
      return res.status(400).send('Nome do jogador é obrigatório!');
    }
    res.sendFile(path.join(__dirname, 'public', 'grandPrix.html'));
  });



  app.post('/save-score', express.json(), (req, res) => {
    const { playerName, score } = req.body;

    if (!playerName || !score) {
        return res.status(400).send('Nome do jogador e pontuação são obrigatórios!');
    }

    try {
        // Get the MAC address from the network interfaces
        const networkInterfaces = os.networkInterfaces();
        const macAddress = req.cookies.clientId;

        if (!macAddress) {
            return res.status(500).send('Erro ao obter o endereço MAC.');
        }

        // Generate a 6-character hash code from the MAC address
        const macHash = crypto.createHash('md5').update(macAddress + playerName).digest('hex').slice(0, 6).toUpperCase();

        const filePath = path.join(__dirname, 'public', 'data', 'zen_record_list.txt');

        // Read the file, insert the new score, and save it in an ordered way
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
                console.error('Erro ao ler o arquivo:', err);
                return res.status(500).send('Erro ao salvar pontuação.');
            }

            // Split the content into lines, filter empty lines, and add the new record
            let records = data ? data.split('\n').filter(line => line.trim() !== '') : [];
            records.push(`${playerName} : ${score} : #${macHash}`);

            // Sort the scores in descending order
            records.sort((a, b) => {
                const [, scoreA] = a.split(' : ').map(x => x.trim());
                const [, scoreB] = b.split(' : ').map(x => x.trim());
                return parseInt(scoreB) - parseInt(scoreA); // Descending
            });

            // Write the file with the sorted records
            fs.writeFile(filePath, records.join('\n') + '\n', 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error('Erro ao salvar pontuação:', writeErr);
                    return res.status(500).send('Erro ao salvar pontuação.');
                }
                res.status(200).send('Pontuação salva com sucesso!');
            });
        });
    } catch (error) {
        console.error('Erro ao obter o endereço MAC:', error);
        res.status(500).send('Erro ao salvar pontuação.');
    }
});
  
  
app.post('/save-score-blitz', express.json(), (req, res) => {
  const { playerName, score } = req.body;

  if (!playerName || !score) {
      return res.status(400).send('Nome do jogador e pontuação são obrigatórios!');
  }

  try {
      // Get the MAC address from the network interfaces
      const networkInterfaces = os.networkInterfaces();
      const macAddress = req.cookies.clientId;

      if (!macAddress) {
          return res.status(500).send('Erro ao obter o endereço MAC.');
      }

      // Generate a 6-character hash code from the MAC address
      const macHash = crypto.createHash('md5').update(macAddress + playerName).digest('hex').slice(0, 6).toUpperCase();

      const filePath = path.join(__dirname, 'public', 'data', 'blitz_record_list.txt');

      // Read the file, insert the new score, and save it in an ordered way
      fs.readFile(filePath, 'utf8', (err, data) => {
          if (err && err.code !== 'ENOENT') {
              console.error('Erro ao ler o arquivo:', err);
              return res.status(500).send('Erro ao salvar pontuação.');
          }

          // Split the content into lines, filter empty lines, and add the new record
          let records = data ? data.split('\n').filter(line => line.trim() !== '') : [];
          records.push(`${playerName} : ${score} : #${macHash}`);

          // Sort the scores in descending order
          records.sort((a, b) => {
              const [, scoreA] = a.split(' : ').map(x => x.trim());
              const [, scoreB] = b.split(' : ').map(x => x.trim());
              return parseInt(scoreB) - parseInt(scoreA); // Descending
          });

          // Write the file with the sorted records
          fs.writeFile(filePath, records.join('\n') + '\n', 'utf8', (writeErr) => {
              if (writeErr) {
                  console.error('Erro ao salvar pontuação:', writeErr);
                  return res.status(500).send('Erro ao salvar pontuação.');
              }
              res.status(200).send('Pontuação salva com sucesso!');
          });
      });
  } catch (error) {
      console.error('Erro ao obter o endereço MAC:', error);
      res.status(500).send('Erro ao salvar pontuação.');
  }
});

app.get('/record', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'record.html'));
  });
  
app.get('/zen-records', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'data', 'zen_record_list.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        return res.json({ records: [] });
    }
    const records = data.split('\n').filter((line) => line.trim() !== '');
    res.json({ records });
    });
});

app.get('/blitz-records', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'data', 'blitz_record_list.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        return res.json({ records: [] });
    }
    const records = data.split('\n').filter((line) => line.trim() !== '');
    res.json({ records });
    });
});


app.post('/save-score-grandPrix', express.json(), (req, res) => {
  const { playerName, timeLeft } = req.body;
  const score = timeLeft;

  if (!playerName || !score) {
      return res.status(400).send('Nome do jogador e pontuação são obrigatórios!');
  }

  try {
      // Get the MAC address from the network interfaces
      const networkInterfaces = os.networkInterfaces();
      const macAddress = req.cookies.clientId;

      if (!macAddress) {
          return res.status(500).send('Erro ao obter o endereço MAC.');
      }

      // Generate a 6-character hash code from the MAC address
      const macHash = crypto.createHash('md5').update(macAddress + playerName).digest('hex').slice(0, 6).toUpperCase();

      const filePath = path.join(__dirname, 'public', 'data', 'grandPrix_record_list.txt');

      // Read the file, insert the new score, and save it in an ordered way
      fs.readFile(filePath, 'utf8', (err, data) => {
          if (err && err.code !== 'ENOENT') {
              console.error('Erro ao ler o arquivo:', err);
              return res.status(500).send('Erro ao salvar pontuação.');
          }

          // Split the content into lines, filter empty lines, and add the new record
          let records = data ? data.split('\n').filter(line => line.trim() !== '') : [];
          records.push(`${playerName} : ${score} s : #${macHash}`);

          // Sort the scores in ascending order (lower time is better)
          records.sort((a, b) => {
              const [, scoreA] = a.split(' : ').map(x => x.trim());
              const [, scoreB] = b.split(' : ').map(x => x.trim());
              return parseInt(scoreA) - parseInt(scoreB); // Ascending
          });

          // Write the file with the sorted records
          fs.writeFile(filePath, records.join('\n') + '\n', 'utf8', (writeErr) => {
              if (writeErr) {
                  console.error('Erro ao salvar pontuação:', writeErr);
                  return res.status(500).send('Erro ao salvar pontuação.');
              }
              res.status(200).send('Pontuação salva com sucesso!');
          });
      });
  } catch (error) {
      console.error('Erro ao obter o endereço MAC:', error);
      res.status(500).send('Erro ao salvar pontuação.');
  }
});


app.get('/grandPrix-records', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'data', 'grandPrix_record_list.txt');
  fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
      return res.json({ records: [] });
  }
  const records = data.split('\n').filter((line) => line.trim() !== '');
  res.json({ records });
  });
});


// Endpoint para obter a lista de músicas
app.get('/music-files', (req, res) => {
  const musicDir = path.join(__dirname, 'public/music');
  fs.readdir(musicDir, (err, files) => {
    if (err) {
      res.status(500).send('Erro ao listar arquivos.');
      return;
    }
    // Filtrar apenas arquivos .mp3
    const mp3Files = files.filter(file => file.endsWith('.mp3'));
    res.json(mp3Files);
  });
});

app.get('/player-code', (req, res) => {
    const playerName = req.query.playerName;

    if (!playerName) {
        return res.status(400).send('Nome do jogador é obrigatório!');
    }

    try {
        // Obter o endereço MAC
        const macAddress = req.cookies.clientId;
        if (!macAddress) {
            return res.status(500).send('Erro ao obter o endereço MAC.');
        }

        // Gerar o código baseado no endereço MAC e no nome do jogador
        const macHash = crypto.createHash('md5').update(macAddress + playerName).digest('hex').slice(0, 6).toUpperCase();

        // Retornar o código no formato JSON
        res.json({ playerName, playerCode: macHash });
    } catch (error) {
        console.error('Erro ao obter o endereço MAC:', error);
        res.status(500).send('Erro ao gerar o código do jogador.');
    }
});


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
