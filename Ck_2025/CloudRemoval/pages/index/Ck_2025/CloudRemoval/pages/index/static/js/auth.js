// Функция для авторизации пользователя
async function signIn(username, password) {
    try {
        // Получаем пользователя по email (используем как username)
        const user = await userDB.getUserByEmail(username);
        
        if (!user) {
            alert('Пользователь не найден');
            return false;
        }
        
        // В реальном приложении здесь должна быть проверка хеша пароля
        if (user.password === password) {
            // Сохраняем информацию о входе в sessionStorage
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            // Возвращаемся на главную страницу
            window.location.href = 'index.html';
            return true;
        } else {
            alert('Неверный пароль');
            return false;
        }
    } catch (error) {
        console.error('Ошибка при входе:', error);
        alert('Произошла ошибка при входе');
        return false;
    }
}

// Функция для регистрации нового пользователя
async function signUp(username, password) {
    try {
        // Проверяем, не существует ли уже пользователь
        const existingUser = await userDB.getUserByEmail(username);
        
        if (existingUser) {
            alert('Пользователь с таким email уже существует');
            return false;
        }
        
        // Создаем нового пользователя
        const userData = {
            email: username,
            username: username.split('@')[0], // Создаем username из email
            password: password, // В реальном приложении пароль должен быть захеширован
            registrationDate: new Date().toLocaleDateString()
        };
        
        // Добавляем пользователя в базу данных
        const userId = await userDB.addUser(userData);
        
        if (userId) {
            // Автоматически входим после регистрации
            userData.id = userId;
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
            window.location.href = 'index.html';
            return true;
        }
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        alert('Произошла ошибка при регистрации');
        return false;
    }
}

// Функция для проверки авторизации
function checkAuth() {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    return user;
}

// Функция для выхода из системы
function signOut() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Функция для проверки прав доступа
function checkAccess() {
    const user = checkAuth();
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Экспортируем функции
window.checkAuth = checkAuth;
window.signOut = signOut;
window.checkAccess = checkAccess; 