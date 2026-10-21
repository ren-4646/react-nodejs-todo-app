import { useEffect,  useState } from 'react'
import TodoForm from './components/TodoForm';


interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
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

  async function addTodo(title: string) {
    const res = await fetch(`${apiUrl}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) throw new Error('ToDoの追加に失敗しました。');
  }

  async function updateTodo(id: number, title: string, completed: boolean) {
    const res = await fetch('${apiUrl}/todos/${id}', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, completed }),
    });

    if (!res.ok) throw new Error('ToDoの更新に失敗しました。');
  }

  async function deleteTodo(id:number) {
    const res = await fetch('${apiUrl}/todos', {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('ToDoの削除に失敗しました。');
  }

  return (
    <>
      <h2>ToDo一覧</h2>
      <TodoForm
        onSubmit={async (title) => {
          try {
            await addTodo(title);
            await syncTodos();
          } catch (err) {
            alert((err as Error).message);
          }
        }}
      />

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {editingId === todo.id ? (
              <>
              <TodoForm
                  onSubmit={async (title) => {
                    try {
                      await updateTodo(todo.id, title, todo.completed);
                      setEditingId(null);
                      await syncTodos();
                    } catch (err) {
                      alert((err as Error).message);
                    }
                  }}
                  initialTitle={todo.title}
                  submitLabel="更新"
                />
                <button onClick={() => setEditingId(null)}>キャンセル</button>
              </>
            ) : (
              <>
                <strong>{todo.title}</strong>
                （作成日時: {new Date(todo.createdAt).toLocaleString('ja-JP')}）
                <button
                  onClick={async () => {
                    try {
                      await updateTodo(todo.id, todo.title, !todo.completed);
                      await syncTodos();
                    } catch (err) {
                      alert((err as Error).message);
                    }
                  }}
                  style={{ marginRight: '0.5em' }}
                >
                  {todo.completed ? '✅' : '☐'}
                </button>
                <button
                  onClick={() => setEditingId(todo.id)}
                  style={{ marginRight: '0.5em' }}
                >
                  編集
                </button>
                <button
                  onClick={async () => {
                    if (!confirm('本当に削除しますか？')) return;

                    try {
                      await deleteTodo(todo.id);
                      await syncTodos();
                    } catch (err) {
                      alert((err as Error).message);
                    }
                  }}
                >
                  削除
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}

export default App
