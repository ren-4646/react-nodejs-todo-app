import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query, exec, closePool } from './db';

import type { Request, Response } from 'express';

interface Todo {
    id: number;
    title: string;
    completed: boolean;
    createdAt: Date;
}

dotenv.config();

const port = Number(process.env.PORT) || 3000;

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

function handleServerError(res: Response, err: unknown, message: string = 'サーバーエラー'){
    console.error(err);
    res.status(500).json({ error: message });
}

app.post('/api/todos', async (req: Request, res: Response) => {
    const { title }: { title: string } = req.body;

    if(!title.trim()){
        res.status(400).json({ error: 'ToDoを入力してください。' });
        return;
    }
    if (title.trim().length > 50) {
        res.status(400).json({ error: 'ToDoは50文字以内で入力してください。' });
        return;
    }

    try {
        const sql = 'INSERT INTO todos (title, completed, created_at) VALUES (?, ?, ?)';
        const params = [title, false, new Date()];
        await exec(sql, params);
        res.status(201).json({ message: 'ToDoを追加しました。' });
    } catch(err) {
        handleServerError(res, err)
    }
});

app.put('/api/todos/:id', async (req: Request, res: Response) => {
    const { title, completed }: { title: string, completed: boolean } = req.body;

    if(!title.trim()){
        res.status(400).json({ error: 'ToDoを入力してください。' });
        return;
    }
    if (title.trim().length > 50) {
        res.status(400).json({ error: 'ToDoは50文字以内で入力してください。' });
        return;
    }

    try{
        const sql = 'UPDATE todos SET title = ?, completed = ? WHERE id = ?';
        const params = [title, completed, req.params.id];

        const result =  await exec(sql, params);

        if (result.affectedRows === 0) {
            res.status(404).json({ error: '指定されたToDoが見つかりません。' });
        }

        res.status(201).json({ message: 'ToDoを更新しました。' });

    } catch(err) {
        handleServerError(res, err)
    }
});

app.delete('/api/todos/:id', async (req: Request, res: Response) => {
    try {
        const sql = 'DELETE FROM todos WHERE id = ?';
        const params = [req.params.id];
        const resule = await exec(sql, params);

        if(resule.affectedRows === 0){
            res.status(404).json({ error: '指定されたToDoが見つかりません。' });
            return;
        }

        res.status(200).json({ message: 'ToDoを削除しました。' });
    } catch (err) {
        handleServerError(res, err);
    }

});

app.get('/api/todos', async (req: Request, res: Response) => {

    try {
        const sql = 'SELECT id, title, completed, created_at AS createdAt FROM todos ORDER BY createdAt DESC';
        const rows = await query<Todo>(sql);

        res.status(200).json(rows);
    } catch(err) {
        handleServerError(res, err)
    }
});

// アプリ終了時にDB接続プールを安全に破棄する
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal => {
  process.on(signal, async () => {
    console.log(`\n${signal}を受信。アプリケーションの終了処理中...`);
    await closePool();
    process.exit();
  });
});

app.use((req: Request, res:Response) => {
    res.status(404).set('Content-Type', 'text/html; charset=utf-8');
    res.send('<h1>ページが見つかりませんでした。</h1>');
});

app.listen(port, () => {
 console.log(`Webサーバーが起動しました。`);
});