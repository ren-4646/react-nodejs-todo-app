type Props = {
    isLoggedIn: boolean;
    onClickLogout: () => void;
    onClickLogin: () => void;
    onClickRegister: () => void;
}

function Header({ isLoggedIn, onClickLogout, onClickLogin, onClickRegister }: Props) {
    return (
        <header>
            <nav>
                <h1>Todoアプリ</h1>

                <ul>
                    {isLoggedIn ? (
                        <li>
                            <button onClick={onClickLogout}>ログアウト</button>
                        </li>
                    ) : (
                        <>
                        <li>
                            <button onClick={onClickLogin}>ログイン</button>
                        </li>
                        <li>
                            <button onClick={onClickRegister}>会員登録</button>
                        </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;