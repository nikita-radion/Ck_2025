// Инициализация базы данных
let db;

const request = indexedDB.open('CloudRemovalDB', 1);

request.onerror = function(event) {
    console.error('Ошибка при открытии базы данных:', event.target.error);
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log('База данных успешно открыта');
};

request.onupgradeneeded = function(event) {
    console.log('Создание/обновление структуры базы данных');
    const db = event.target.result;
    
    // Создаем хранилище для пользователей
    if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('email', 'email', { unique: true });
        userStore.createIndex('username', 'username', { unique: true });
        console.log('Создано хранилище users');
    }
    
    // Создаем хранилище для понравившихся фото
    if (!db.objectStoreNames.contains('likedPhotos')) {
        const likedPhotosStore = db.createObjectStore('likedPhotos', { keyPath: 'id', autoIncrement: true });
        likedPhotosStore.createIndex('userId', 'userId', { unique: false });
        likedPhotosStore.createIndex('photoUrl', 'photoUrl', { unique: false });
        console.log('Создано хранилище likedPhotos');
    }
};

// Функции для работы с пользователями
const userDB = {
    // Добавление нового пользователя
    addUser: function(userData) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            
            const request = store.add(userData);
            
            request.onsuccess = function() {
                resolve(request.result);
            };
            
            request.onerror = function(event) {
                reject(event.target.error);
            };
        });
    },
    
    // Получение пользователя по email
    getUserByEmail: function(email) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const index = store.index('email');
            
            const request = index.get(email);
            
            request.onsuccess = function() {
                resolve(request.result);
            };
            
            request.onerror = function(event) {
                reject(event.target.error);
            };
        });
    },
    
    // Обновление данных пользователя
    updateUser: function(userId, userData) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            
            const request = store.put({ ...userData, id: userId });
            
            request.onsuccess = function() {
                resolve(request.result);
            };
            
            request.onerror = function(event) {
                reject(event.target.error);
            };
        });
    }
};

// Функции для работы с понравившимися фото
const likedPhotosDB = {
    // Добавление понравившегося фото
    addLikedPhoto: function(userId, photoData) {
        return new Promise((resolve, reject) => {
            console.log('Попытка сохранить фото:', { userId, photoData });
            
            if (!db) {
                console.error('База данных не инициализирована');
                reject(new Error('База данных не инициализирована'));
                return;
            }

            const transaction = db.transaction(['likedPhotos'], 'readwrite');
            const store = transaction.objectStore('likedPhotos');
            
            const photo = {
                userId: userId,
                photoUrl: photoData.photoUrl,
                date: photoData.date || new Date().toLocaleDateString()
            };
            
            console.log('Сохраняем фото в БД:', photo);
            
            const request = store.add(photo);
            
            request.onsuccess = function(event) {
                console.log('Фото успешно сохранено, ID:', event.target.result);
                resolve(event.target.result);
            };
            
            request.onerror = function(event) {
                console.error('Ошибка при сохранении фото:', event.target.error);
                reject(event.target.error);
            };

            transaction.oncomplete = function() {
                console.log('Транзакция успешно завершена');
            };

            transaction.onerror = function(event) {
                console.error('Ошибка транзакции:', event.target.error);
            };
        });
    },
    
    // Получение всех понравившихся фото пользователя
    getUserLikedPhotos: function(userId) {
        return new Promise((resolve, reject) => {
            console.log('Запрос фото для пользователя:', userId);
            
            if (!db) {
                console.error('База данных не инициализирована');
                reject(new Error('База данных не инициализирована'));
                return;
            }

            const transaction = db.transaction(['likedPhotos'], 'readonly');
            const store = transaction.objectStore('likedPhotos');
            const index = store.index('userId');
            
            const request = index.getAll(userId);
            
            request.onsuccess = function(event) {
                const photos = event.target.result;
                console.log('Получены фото из БД:', photos);
                resolve(photos);
            };
            
            request.onerror = function(event) {
                console.error('Ошибка при получении фото:', event.target.error);
                reject(event.target.error);
            };
        });
    },
    
    // Удаление понравившегося фото
    removeLikedPhoto: function(photoId) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['likedPhotos'], 'readwrite');
            const store = transaction.objectStore('likedPhotos');
            
            const request = store.delete(photoId);
            
            request.onsuccess = function() {
                resolve(true);
            };
            
            request.onerror = function(event) {
                reject(event.target.error);
            };
        });
    }
};

// Экспортируем объекты для работы с базой данных
window.userDB = userDB;
window.likedPhotosDB = likedPhotosDB; 