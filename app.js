const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const questionsPath = path.join(__dirname, 'data', 'questions.json');
const usersPath = path.join(__dirname, 'data', 'users.json');

app.get('/quiz/questions', (req, res) => {
  fs.readFile(questionsPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(JSON.parse(data));
  });
});

app.post('/quiz/submit', (req, res) => {
  const { username, answers } = req.body;

  fs.readFile(questionsPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });

    const questions = JSON.parse(data);
    let score = 0;

    questions.forEach((q, index) => {
      if (answers[index] && answers[index] === q.answer) {
        score++;
      }
    });

    const userResult = { username, score, total: questions.length, date: new Date().toISOString() };

    fs.readFile(usersPath, 'utf8', (err, data) => {
      let users = [];
      if (!err && data) {
        try { users = JSON.parse(data); } catch {}
      }

      users.push(userResult);
      fs.writeFile(usersPath, JSON.stringify(users, null, 2), err => {
        if (err) console.error('Erreur écriture users.json :', err);
      });
    });

    res.json({ message: 'Réponses reçues', score });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré : http://localhost:${PORT}`);
});