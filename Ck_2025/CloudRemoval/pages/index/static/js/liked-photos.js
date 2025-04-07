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

        // Сохраняем фото в базу данных
        const photoData = {
            photoUrl: imageSrc,
            date: new Date().toLocaleDateString()
        };
        console.log('Подготовленные данные для сохранения:', photoData);

        const result = await likedPhotosDB.addLikedPhoto(currentUser.id, photoData);
        console.log('Результат сохранения:', result);

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

        // Проверяем авторизацию
        const currentUser = checkAuth();
        if (!currentUser) return;

        // Получаем понравившиеся фото из базы данных
        const likedPhotos = await likedPhotosDB.getUserLikedPhotos(currentUser.id);
        console.log('Полученные фото:', likedPhotos); // Добавляем для отладки

        // Очищаем текущую галерею
        likedGallery.innerHTML = '';

        if (!likedPhotos || likedPhotos.length === 0) {
            likedGallery.innerHTML = '<div class="no-photos">У вас пока нет понравившихся фото</div>';
            return;
        }

        // Добавляем каждое фото в галерею
        likedPhotos.forEach(photo => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${photo.photoUrl}" alt="Понравившееся фото">
                <div class="gallery-item-info">
                    <div class="gallery-item-date">${photo.date}</div>
                    <button class="remove-photo-btn" onclick="removeLikedPhoto(${photo.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                        </svg>
                    </button>
                </div>
            `;
            likedGallery.appendChild(galleryItem);
        });
    } catch (error) {
        console.error('Ошибка при обновлении галереи:', error);
    }
}

// Функция для удаления понравившегося фото
async function removeLikedPhoto(photoId) {
    try {
        await likedPhotosDB.removeLikedPhoto(photoId);
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