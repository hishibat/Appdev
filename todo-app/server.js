const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'todos.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// データファイルの初期化
function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ todos: [], completed: [] }, null, 2));
  }
}

// データの読み込み
function readData() {
  initDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

// データの保存
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API: すべてのタスクを取得
app.get('/api/todos', (req, res) => {
  const data = readData();
  res.json(data);
});

// API: 新しいタスクを追加
app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'タスクの内容を入力してください' });
  }

  const data = readData();
  const newTodo = {
    id: Date.now().toString(),
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  data.todos.unshift(newTodo);
  saveData(data);
  res.status(201).json(newTodo);
});

// API: タスクを完了にする
app.put('/api/todos/:id/complete', (req, res) => {
  const { id } = req.params;
  const data = readData();

  const todoIndex = data.todos.findIndex(t => t.id === id);
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'タスクが見つかりません' });
  }

  const [completedTodo] = data.todos.splice(todoIndex, 1);
  completedTodo.completedAt = new Date().toISOString();
  data.completed.unshift(completedTodo);

  saveData(data);
  res.json(completedTodo);
});

// API: 完了タスクを元に戻す
app.put('/api/todos/:id/restore', (req, res) => {
  const { id } = req.params;
  const data = readData();

  const completedIndex = data.completed.findIndex(t => t.id === id);
  if (completedIndex === -1) {
    return res.status(404).json({ error: 'タスクが見つかりません' });
  }

  const [restoredTodo] = data.completed.splice(completedIndex, 1);
  delete restoredTodo.completedAt;
  data.todos.unshift(restoredTodo);

  saveData(data);
  res.json(restoredTodo);
});

// API: タスクを削除
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const data = readData();

  // アクティブなタスクから検索
  let todoIndex = data.todos.findIndex(t => t.id === id);
  if (todoIndex !== -1) {
    data.todos.splice(todoIndex, 1);
    saveData(data);
    return res.json({ message: '削除しました' });
  }

  // 完了タスクから検索
  todoIndex = data.completed.findIndex(t => t.id === id);
  if (todoIndex !== -1) {
    data.completed.splice(todoIndex, 1);
    saveData(data);
    return res.json({ message: '削除しました' });
  }

  res.status(404).json({ error: 'タスクが見つかりません' });
});

// サーバー起動（外部アクセス許可）
app.listen(PORT, '0.0.0.0', () => {
  initDataFile();
  console.log(`🚀 To Do アプリが起動しました: http://localhost:${PORT}`);
  console.log(`📱 外部からのアクセス: http://<IPアドレス>:${PORT}`);
});
