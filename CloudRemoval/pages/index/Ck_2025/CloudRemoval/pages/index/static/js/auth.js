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
    const currentUser = sessionStorage.getItem('currentUser');
    const isProfilePage = window.location.pathname.includes('profile.html');
    
    // Если мы на странице профиля и пользователь не авторизован
    if (isProfilePage && !currentUser) {
        window.location.href = 'index.html'; // Редирект на главную
        return null;
    }
    
    return currentUser ? JSON.parse(currentUser) : null;
}

// Функция выхода из аккаунта
function signOut() {
    sessionStorage.removeItem('currentUser');
    window.location.reload(); // Перезагружаем страницу
} 