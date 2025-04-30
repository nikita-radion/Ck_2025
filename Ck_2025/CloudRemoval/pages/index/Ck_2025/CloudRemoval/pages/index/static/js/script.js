let isScrolling = false;
let currentSectionIndex = 0;
const sections = document.querySelectorAll('section, header');
const scrollDelay = 1200;


function scrollToSection(index) {
    if (index >= 0 && index < sections.length) {
        isScrolling = true;
        sections[index].scrollIntoView({ behavior: 'smooth' });

        // setTimeout(() => {
        //     isScrolling = false;
        // }, scrollDelay);
    }
}


window.addEventListener('wheel', (event) => {
    if (isScrolling) return;

    if (event.deltaY > 0) {
        currentSectionIndex = Math.min(currentSectionIndex + 1, sections.length - 1);
    } else {
        currentSectionIndex = Math.max(currentSectionIndex - 1, 0);
    }

    scrollToSection(currentSectionIndex);
});


// const video = document.getElementById('bg-video');
// video.play();

// if (pauseButton) {
//     pauseButton.addEventListener('click', function() {
//         if (video.paused) {
//             video.play();
//             pauseButton.textContent = 'Pause';
//         } else {
//             video.pause();
//             pauseButton.textContent = 'Play';
//         }
//     });
// }

// Функционал обработки изображений
document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generate-btn');
    const fileInput = document.getElementById('file-input');
    const resultPlaceholder = document.querySelector('.result-placeholder');
    const processingIndicator = document.querySelector('.processing-indicator');
    const processedResult = document.querySelector('.processed-result');
    const actionButtons = document.querySelector('.action-buttons');
    const processedImage = document.getElementById('processed-image');
    
    let uploadedImage = null;
    
    // Обработка загрузки файла
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedImage = event.target.result;
                // Показываем, что файл был загружен
                document.querySelector('.file-input-label').textContent = file.name;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Обработка нажатия на кнопку Generate
    generateBtn.addEventListener('click', async function() {
        if (!uploadedImage) {
            alert('Пожалуйста, сначала загрузите изображение');
            return;
        }
        
        try {
            // Скрываем текст-заполнитель
            resultPlaceholder.style.display = 'none';
            
            // Показываем индикатор загрузки
            processingIndicator.style.display = 'block';
            processedResult.style.display = 'none';
            actionButtons.style.display = 'none';
            
            // Создаем canvas для обработки изображения
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                // Устанавливаем размеры canvas
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Применяем базовую обработку (имитация удаления облаков)
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Простой алгоритм для имитации удаления облаков
                for (let i = 0; i < data.length; i += 4) {
                    // Увеличиваем яркость и контрастность
                    data[i] = Math.min(255, data[i] * 1.2);     // R
                    data[i + 1] = Math.min(255, data[i + 1] * 1.2); // G
                    data[i + 2] = Math.min(255, data[i + 2] * 1.2); // B
                }
                
                ctx.putImageData(imageData, 0, 0);
                
                // Сохраняем обработанное изображение
                const processedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
                
                // Скрываем индикатор загрузки
                processingIndicator.style.display = 'none';
                
                // Показываем результат
                processedImage.src = processedImageUrl;
                processedResult.style.display = 'block';
                
                // Показываем кнопки действий
                actionButtons.style.display = 'flex';
                
                // Сохраняем URL в localStorage для возможности повторной обработки
                localStorage.setItem('lastProcessedImage', processedImageUrl);
            };
            
            img.onerror = function() {
                throw new Error('Ошибка при загрузке изображения');
            };
            
            img.src = uploadedImage;
            
        } catch (error) {
            console.error('Ошибка при обработке изображения:', error);
            processingIndicator.style.display = 'none';
            resultPlaceholder.style.display = 'block';
            resultPlaceholder.textContent = 'Произошла ошибка при обработке изображения';
            alert('Произошла ошибка при обработке изображения. Пожалуйста, попробуйте еще раз.');
        }
    });

    // Добавляем обработчик для кнопки перегенерации
    const reprocessBtn = document.querySelector('.reprocess-btn');
    if (reprocessBtn) {
        reprocessBtn.addEventListener('click', function() {
            const lastProcessedImage = localStorage.getItem('lastProcessedImage');
            if (lastProcessedImage) {
                processedImage.src = lastProcessedImage;
                processedResult.style.display = 'block';
                actionButtons.style.display = 'flex';
            } else if (uploadedImage) {
                generateBtn.click();
            } else {
                alert('Пожалуйста, сначала загрузите изображение');
            }
        });
    }
});

// Плавная прокрутка для внутренних ссылок в навигации
document.addEventListener('DOMContentLoaded', function() {
    // Выбираем все ссылки в навигации и dropdown меню
    const navLinks = document.querySelectorAll('.navbar-nav a.nav-link, .dropdown-menu a.dropdown-item');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Проверяем, является ли ссылка внутренней (начинается с #)
            const href = this.getAttribute('href');
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    // Плавная прокрутка к секции
                    targetSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Если на мобильном устройстве, закрываем меню
                    const navbarCollapse = document.querySelector('.navbar-collapse');
                    if (navbarCollapse.classList.contains('show')) {
                        const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                        bsCollapse.hide();
                    }
                }
            }
        });
    });
});

// Изменение стиля навбара при прокрутке
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});

// Обработка клика по ссылке "Контакты"
document.addEventListener('DOMContentLoaded', function() {
    const contactLink = document.querySelector('a[href="#contact"]');
    
    contactLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        const footer = document.getElementById('contact');
        footer.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Закрываем меню на мобильных устройствах
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse.classList.contains('show')) {
            const bsCollapse = new bootstrap.Collapse(navbarCollapse);
            bsCollapse.hide();
        }
    });
});
