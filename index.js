const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

const dbPath = path.join(__dirname, 'db.json');

const loadMessages = () => {
    if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, 'utf-8');
        return JSON.parse(data);
    }
    return [];
};

const saveMessages = (messages) => {
    fs.writeFileSync(dbPath, JSON.stringify(messages, null, 2));
};

app.post('/messages', (req, res) => {
    const { author, message } = req.body;

    if (!author || !message) {
        return res.status(400).json({ error: 'Author and message must be present in the request' });
    }

    const messages = loadMessages();
    const newMessage = {
        id: crypto.randomUUID(),
        author,
        message,
        datetime: new Date().toISOString(),
    };

    messages.push(newMessage);
    saveMessages(messages);

    res.status(201).json(newMessage);
});

app.get('/messages', (req, res) => {
    const messages = loadMessages();
    const { datetime } = req.query;

    if (datetime) {
        const date = new Date(datetime);
        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: 'Invalid datetime' });
        }

        const filteredMessages = messages.filter(msg => new Date(msg.datetime) > date);
        return res.json(filteredMessages);
    }

    const lastMessages = messages.slice(-30);
    res.json(lastMessages);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});