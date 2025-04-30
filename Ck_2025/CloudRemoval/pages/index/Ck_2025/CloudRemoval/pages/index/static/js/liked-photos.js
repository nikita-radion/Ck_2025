// Функция для сохранения понравившегося фото
async function saveLikedPhoto(imageSrc) {
    try {
        console.log('Начало сохранения фото. URL:', imageSrc);
        
        // Проверяем авторизацию
        const currentUser = checkAuth();
        console.log('Текущий пользователь:', currentUser);
        
        if (!currentUser) {
            console.warn('Пользователь не авторизован');
            alert('Пожалуйста, войдите в систему, чтобы сохранять понравившиеся фото');
            return;
        }

        if (!imageSrc) {
            console.error('URL изображения отсутствует');
            alert('Ошибка: отсутствует URL изображения');
            return;
        }

        // Проверяем, не сохранено ли уже это изображение
        const existingPhotos = await likedPhotosDB.getUserLikedPhotos(currentUser.id);
        const isDuplicate = existingPhotos.some(photo => photo.photoUrl === imageSrc);
        
        if (isDuplicate) {
            alert('Это изображение уже сохранено в понравившихся');
            return;
        }

        // Сохраняем фото в базу данных
        const photoData = {
            photoUrl: imageSrc,
            date: new Date().toLocaleDateString(),
            // Сохраняем само изображение в localStorage для офлайн-доступа
            imageData: imageSrc
        };
        console.log('Подготовленные данные для сохранения:', photoData);

        const result = await likedPhotosDB.addLikedPhoto(currentUser.id, photoData);
        console.log('Результат сохранения:', result);

        // Сохраняем изображение в localStorage
        const storageKey = `liked_photo_${result}`;
        localStorage.setItem(storageKey, imageSrc);

        alert('Фото добавлено в понравившиеся!');
        
        // Если мы на странице профиля, обновляем галерею
        const likedGallery = document.getElementById('liked-gallery');
        if (likedGallery) {
            console.log('Обновляем галерею...');
            await updateLikedGallery();
        }
    } catch (error) {
        console.error('Ошибка при сохранении фото:', error);
        alert('Произошла ошибка при сохранении фото');
    }
}

// Функция для обновления галереи понравившихся фото
async function updateLikedGallery() {
    try {
        const likedGallery = document.getElementById('liked-gallery');
        if (!likedGallery) return;

        // Показываем индикатор загрузки
        likedGallery.innerHTML = '<div class="loading-indicator">Загрузка фото...</div>';

        // Проверяем авторизацию
        const currentUser = checkAuth();
        if (!currentUser) {
            likedGallery.innerHTML = '<div class="no-photos">Пожалуйста, войдите в систему</div>';
            return;
        }

        // Получаем понравившиеся фото из базы данных
        const likedPhotos = await likedPhotosDB.getUserLikedPhotos(currentUser.id);
        console.log('Полученные фото:', likedPhotos);

        // Очищаем текущую галерею
        likedGallery.innerHTML = '';

        if (!likedPhotos || likedPhotos.length === 0) {
            likedGallery.innerHTML = '<div class="no-photos">У вас пока нет понравившихся фото</div>';
            return;
        }

        // Создаем контейнер для сетки фото
        const gridContainer = document.createElement('div');
        gridContainer.className = 'gallery-grid';

        // Добавляем каждое фото в галерею
        likedPhotos.forEach((photo, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            
            // Пытаемся получить изображение из localStorage
            const storageKey = `liked_photo_${photo.id}`;
            const cachedImage = localStorage.getItem(storageKey);
            const imageUrl = cachedImage || photo.photoUrl;
            
            galleryItem.innerHTML = `
                <div class="gallery-item-content">
                    <img src="${imageUrl}" alt="Понравившееся фото" 
                         onclick="openPhotoModal('${imageUrl}', ${index})"
                         onerror="handleImageError(this, ${photo.id})">
                    <div class="photo-select" onclick="event.stopPropagation(); togglePhotoSelection(${photo.id}, this)"></div>
                    <div class="gallery-item-info">
                        <div class="gallery-item-date">${photo.date}</div>
                        <button class="remove-photo-btn" onclick="event.stopPropagation(); removeLikedPhoto(${photo.id})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            gridContainer.appendChild(galleryItem);
        });

        likedGallery.appendChild(gridContainer);

        // Сбрасываем режим выбора при обновлении галереи
        cancelSelection();
    } catch (error) {
        console.error('Ошибка при обновлении галереи:', error);
        const likedGallery = document.getElementById('liked-gallery');
        if (likedGallery) {
            likedGallery.innerHTML = '<div class="error-message">Произошла ошибка при загрузке фото</div>';
        }
    }
}

// Функция для обработки ошибок загрузки изображений
function handleImageError(img, photoId) {
    console.error('Ошибка загрузки изображения:', photoId);
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Ошибка загрузки изображения</dGV4dD48L3N2Zz4=';
    img.style.objectFit = 'contain';
    img.style.padding = '1rem';
}

// Функция для удаления понравившегося фото
async function removeLikedPhoto(photoId) {
    try {
        // Удаляем из базы данных
        await likedPhotosDB.removeLikedPhoto(photoId);
        
        // Удаляем из localStorage
        const storageKey = `liked_photo_${photoId}`;
        localStorage.removeItem(storageKey);
        
        await updateLikedGallery();
        alert('Фото удалено из понравившихся');
    } catch (error) {
        console.error('Ошибка при удалении фото:', error);
        alert('Произошла ошибка при удалении фото');
    }
}

// Добавляем обработчик для кнопки "Нравится" на главной странице
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, настраиваем обработчики...');
    
    const likeBtn = document.querySelector('.like-btn');
    console.log('Кнопка лайка найдена:', likeBtn);
    
    if (likeBtn) {
        likeBtn.addEventListener('click', async function() {
            console.log('Клик по кнопке лайка');
            const processedImage = document.getElementById('processed-image');
            console.log('Найдено обработанное изображение:', processedImage);
            
            if (processedImage && processedImage.src) {
                console.log('URL изображения для сохранения:', processedImage.src);
                await saveLikedPhoto(processedImage.src);
            } else {
                console.error('Изображение не найдено или у него нет src');
            }
        });
    } else {
        console.warn('Кнопка лайка не найдена на странице');
    }

    // Обновляем галерею при загрузке страницы профиля
    const likedGallery = document.getElementById('liked-gallery');
    if (likedGallery) {
        console.log('Галерея найдена, обновляем...');
        updateLikedGallery();
    } else {
        console.log('Галерея не найдена (возможно, мы не на странице профиля)');
    }
});

// Добавляем стили для индикатора загрузки
const style = document.createElement('style');
style.textContent = `
    .loading-indicator {
        text-align: center;
        padding: 2rem;
        color: #6c757d;
        font-size: 1.1rem;
    }
    
    .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        padding: 1rem;
    }
    
    .gallery-item {
        position: relative;
        aspect-ratio: 1;
        overflow: hidden;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
    }
    
    .gallery-item:hover {
        transform: translateY(-5px);
    }
    
    .gallery-item-content {
        position: relative;
        width: 100%;
        height: 100%;
    }
    
    .gallery-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        cursor: pointer;
    }
    
    .gallery-item-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,0.7);
        padding: 0.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .gallery-item-date {
        color: white;
        font-size: 0.9rem;
    }
    
    .remove-photo-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        transition: background-color 0.3s ease;
    }
    
    .remove-photo-btn:hover {
        background-color: rgba(255,255,255,0.2);
    }
    
    .error-message {
        text-align: center;
        padding: 2rem;
        color: #dc3545;
        font-size: 1.1rem;
    }
`;
document.head.appendChild(style); 