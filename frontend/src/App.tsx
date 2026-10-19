import { useEffect,  useState } from 'react'

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  // APIをリクエスト、Todo一覧を取得
  async function fetchTodos(): Promise<Todo[]> {
    const res = await fetch(`${apiUrl}/todos`);

    if (!res.ok) throw new Error('ToDo一覧の取得に失敗しました。');

    return res.json();
  };

  // Todo一覧を取得し、状態変数を更新
  async function syncTodos() {
    const todos = await fetchTodos();
    setTodos(todos);
  }

  // コンポーネントがマウントされたときの初期化処理
  useEffect(() => {
    async function initApp() {
      try{
        await syncTodos();
      } catch (err) {
        alert((err as Error).message);
      }
    }

    initApp();
  }, []);

  return (
    <>
      <h2>ToDo一覧</h2>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <strong>{todo.title}</strong>
            （作成日時: {new Date(todo.createdAt).toLocaleString('ja-JP')}）
            {todo.completed ? '✅' : ''}
          </li>
        ))}
      </ul>
    </>
  )
}

export default App
