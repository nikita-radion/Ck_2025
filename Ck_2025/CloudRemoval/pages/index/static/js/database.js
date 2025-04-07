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

const userDB = {
    // Добавление нового пользователя
    addUser: function(userData) {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('База данных не инициализирована'));
                return;
            }

            // Проверяем обязательные поля
            if (!userData.username || !userData.password || !userData.email || !userData.name || !userData.surname) {
                reject(new Error('Не все обязательные поля заполнены'));
                return;
            }

            const transaction = db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            
            // Проверяем уникальность username
            const usernameIndex = store.index('username');
            const usernameRequest = usernameIndex.get(userData.username);
            
            usernameRequest.onsuccess = function() {
                if (usernameRequest.result) {
                    reject(new Error('Пользователь с таким именем уже существует'));
                    return;
                }

                // Проверяем уникальность email
                const emailIndex = store.index('email');
                const emailRequest = emailIndex.get(userData.email);
                
                emailRequest.onsuccess = function() {
                    if (emailRequest.result) {
                        reject(new Error('Пользователь с таким email уже существует'));
                        return;
                    }

                    // Если все проверки пройдены, добавляем пользователя
                    const addRequest = store.add(userData);
                    
                    addRequest.onsuccess = function(event) {
                        resolve({ ...userData, id: event.target.result });
                    };
                    
                    addRequest.onerror = function(event) {
                        reject(event.target.error);
                    };
                };
            };
            
            transaction.onerror = function(event) {
                reject(event.target.error);
            };
        });
    },

    // Получение пользователя по email
    getUserByEmail: function(email) {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('База данных не инициализирована'));
                return;
            }

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

    // Получение пользователя по username
    getUserByUsername: function(username) {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('База данных не инициализирована'));
                return;
            }

            const transaction = db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const index = store.index('username');
            
            const request = index.get(username);
            
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
            if (!db) {
                reject(new Error('База данных не инициализирована'));
                return;
            }

            const transaction = db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            
            // Сначала получаем текущие данные пользователя
            const getRequest = store.get(userId);
            
            getRequest.onsuccess = function() {
                const existingUser = getRequest.result;
                if (!existingUser) {
                    reject(new Error('Пользователь не найден'));
                    return;
                }

                // Объединяем существующие данные с новыми
                const updatedUser = { ...existingUser, ...userData };
                
                const putRequest = store.put(updatedUser);
                
                putRequest.onsuccess = function() {
                    resolve(updatedUser);
                };
                
                putRequest.onerror = function(event) {
                    reject(event.target.error);
                };
            };
            
            getRequest.onerror = function(event) {
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
            if (!db) {
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
            
            const request = store.add(photo);
            
            request.onsuccess = function(event) {
                resolve(event.target.result);
            };
            
            request.onerror = function(event) {
                reject(event.target.error);
            };
        });
    },
    
    // Получение всех понравившихся фото пользователя
    getUserLikedPhotos: function(userId) {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('База данных не инициализирована'));
                return;
            }

            const transaction = db.transaction(['likedPhotos'], 'readonly');
            const store = transaction.objectStore('likedPhotos');
            const index = store.index('userId');
            
            const request = index.getAll(userId);
            
            request.onsuccess = function() {
                resolve(request.result);
            };
            
            request.onerror = function(event) {
                reject(event.target.error);
            };
        });
    },
    
    // Удаление понравившегося фото
    removeLikedPhoto: function(photoId) {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('База данных не инициализирована'));
                return;
            }

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