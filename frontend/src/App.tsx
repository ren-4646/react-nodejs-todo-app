import { useEffect,  useState } from 'react'
import TodoForm from './components/TodoForm';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Header from './components/Header';
import { fetchTodos, addTodo, updateTodo, deleteTodo } from './api/todo';
import { register, login, logout, fetchLoginStatus } from './api/auth';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Todo一覧を取得し、状態変数を更新
  async function syncTodos() {
    const todos = await fetchTodos();
    setTodos(todos);
  }

  // 認証トークンの有効限切れエラーを処理する関数
  function handleExpired(err: unknown) {
    if((err as Error).message === 'EXPIRED') {
      setIsLoggedIn(false);
      setTodos([]);
      setEditingId(null);
      alert('セッションの有効期限が切れました。再度ログインしてください。');
      return true;
    }
    return false;
  }

  // コンポーネントがマウントされたときの初期化処理
  useEffect(() => {
    async function initApp() {
      const status = await fetchLoginStatus();
      setIsLoggedIn(status);
      if(status) {
          try{
            await syncTodos();
          } catch (err) {
            console.error(err);
            alert('ToDo一覧の取得に失敗しました。');
          }
      }
    }

    initApp();
  }, []);

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        onClickLogout={async () => {
          try {
            await logout();
            setIsLoggedIn(false);
            setTodos([]);
            setEditingId(null);
            alert('ログアウトしました。');
          } catch (err) {
              alert((err as Error).message);
          }
        }}
        onClickLogin={() => setShowRegister(false)}
        onClickRegister={() => setShowRegister(true)}
      />
    <main>
      {isLoggedIn ? (
        <>
          <h2>ToDo一覧</h2>
          <TodoForm
            onSubmit={async (title) => {
              try {
                await addTodo(title);
                await syncTodos();
              } catch (err) {
                if (handleExpired(err)) return;
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
                          if (handleExpired(err)) return;
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
                          if (handleExpired(err)) return;
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
                          if (handleExpired(err)) return;
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
      ) : (
        <section>
          <h2>{showRegister ? '会員登録' : 'ログイン'}</h2>

          {showRegister ? (
            <>
              <RegisterForm
                onSubmit={async (email, password) => {
                  try {
                    await register(email, password);
                    setShowRegister(false);
                    alert('会員登録が完了しました。');
                  } catch (err) {
                    alert((err as Error).message);
                  }
                }}
              />
            </>
        ) : (
          <>
            <LoginForm
              onSubmit={async (email, password) => {
                try {
                  await login(email, password);
                  setIsLoggedIn(true);
                  alert('ログインしました。');
                  await syncTodos();
                } catch (err) {
                  alert((err as Error).message);
                }
              }}
            />
          </>
        )}

        {showRegister ? (
          <>
            <span>すでにアカウントをお持ちですか？</span>
            <button onClick={() => setShowRegister(false)}>ログイン</button>
          </>
        ) : (
          <>
            <span>アカウントをお持ちではありませんか？</span>
            <button onClick={() => setShowRegister(true)}>会員登録</button>
          </>
        )}
      </section>
      )}
    </main>
  </>
  )
}

export default App
