// База данных детей
const children = [
  { id: "AlievaN77", name: "Алиева Николь" },
  { id: "ZhuravlevaE96", name: "Журавлева Ева" },
  { id: "IvanushkinM09", name: "Иванушкин Марк" },
  { id: "KaisinaK55", name: "Кайсина Кира" },
  { id: "KapitonovM17", name: "Капитонов Михаил" },
  { id: "OstapchukA15", name: "Остапчук Арсений" },
  { id: "SalyakinA30", name: "Салякин Алексей" },
  { id: "ShilinM81", name: "Шилин Максим" },
  { id: "AnaevB73", name: "Анаев Борис" },
  { id: "BaranovD88", name: "Баранов Даниил" },
  { id: "DjahayaS42", name: "Джахая Сандро" },
  { id: "ZhuravlevaA51", name: "Журавлева Аврора" },
  { id: "KazaryanA12", name: "Казарян Артемий" },
  { id: "KuznetsovA68", name: "Кузнецов Арсений" },
  { id: "PantileykoA24", name: "Пантилейко Артем" },
  { id: "RutskiyY33", name: "Руцкий Ян" },
  { id: "StepanenkoM65", name: "Степаненко Мия" },
  { id: "ChzhouS77", name: "Чжоу Шуянь" },
  { id: "SavinovaE32", name: "Савинова Елизавета" },
  { id: "ZicinL25", name: "Цыцин Лука" },
  { id: "SavinovI64", name: "Савинов Илья" }
];

let currentPhotos = [];
let currentIndex = 0;
let selectedChild = '';

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    showStatus('Выберите фото для начала работы', 'info');
});

function setupEventListeners() {
    // Выбор ребенка
    document.querySelectorAll('.child-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectedChild = this.getAttribute('data-id');
            document.querySelectorAll('.child-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Автоматически сохраняем при выборе ребенка
            if (currentPhotos.length > 0) {
                savePhoto();
            }
        });
    });

    // Загрузка файлов
    const fileInput = document.getElementById('photoInput');
    fileInput.addEventListener('change', handleFileSelect);
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Фильтруем только поддерживаемые форматы
    const supportedFiles = files.filter(file => {
        const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic';
        const isSupported = file.type.startsWith('image/') && 
                           !file.type.includes('heic') && 
                           !file.type.includes('heif');
        return isSupported || isHeic;
    });

    if (supportedFiles.length === 0) {
        showStatus('❌ Нет поддерживаемых фото форматов (HEIC пока не поддерживается)', 'error');
        return;
    }

    if (supportedFiles.length < files.length) {
        showStatus(`⚠️ Загружено ${supportedFiles.length} из ${files.length} файлов (HEIC пропущены)`, 'warning');
    }

    currentPhotos = supportedFiles;
    currentIndex = 0;
    showTaggerSection();
    showCurrentPhoto();
}

function showTaggerSection() {
    document.getElementById('taggerSection').style.display = 'block';
    document.querySelector('.upload-section').style.display = 'none';
    updateProgress();
}

async function showCurrentPhoto() {
    if (currentIndex >= currentPhotos.length) {
        showStatus('🎉 Все фото обработаны!', 'success');
        
        // Показываем кнопку для нового сеанса
        const newSessionBtn = document.createElement('button');
        newSessionBtn.textContent = '🔄 Новые фото';
        newSessionBtn.className = 'upload-btn';
        newSessionBtn.onclick = function() {
            document.getElementById('taggerSection').style.display = 'none';
            document.querySelector('.upload-section').style.display = 'block';
            document.getElementById('photoInput').value = '';
            showStatus('Выберите фото для начала работы', 'info');
        };
        
        const statusDiv = document.getElementById('status');
        statusDiv.appendChild(newSessionBtn);
        return;
    }

    const file = currentPhotos[currentIndex];
    
    try {
        // Проверяем формат файла
        if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
            // Для HEIC файлов показываем сообщение о невозможности предпросмотра
            document.getElementById('photoPreview').src = '';
            document.getElementById('photoPreview').style.display = 'none';
            showStatus('📷 HEIC фото (предпросмотр недоступен) - выберите ребенка для сохранения', 'warning');
        } else {
            // Для обычных форматов
            document.getElementById('photoPreview').style.display = 'block';
            const dataUrl = await readFileAsDataURL(file);
            document.getElementById('photoPreview').src = dataUrl;
            showStatus('Выберите ребенка - фото сохранится автоматически', 'info');
        }
        
        selectedChild = '';
        document.querySelectorAll('.child-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
    } catch (error) {
        console.error('Error showing photo:', error);
        showStatus('Ошибка загрузки фото', 'error');
    }
}

// Функция для чтения файла как DataURL с Promise
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}

async function savePhoto() {
    const lessonNumber = document.getElementById('lessonNumber').value;
    const file = currentPhotos[currentIndex];
    const child = children.find(c => c.id === selectedChild);
    
    if (!child) {
        showStatus('Ошибка: ребенок не найден', 'error');
        return;
    }

    // Создаем имя файла
    let extension = file.name.split('.').pop();
    let fileToSave = file;
    
    // Если HEIC, меняем расширение на jpg и предупреждаем пользователя
    if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
        extension = 'jpg';
        showStatus('⚠️ HEIC файл будет сохранен как JPG. Оригинальное качество может измениться.', 'warning');
    }
    
    const fileName = `${selectedChild}.${extension}`;
    
    // Скачиваем файл
    const url = URL.createObjectURL(fileToSave);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus(`✅ Сохранено: ${fileName}`, 'success');
    
    // Переходим к следующему фото
    currentIndex++;
    updateProgress();
    setTimeout(showCurrentPhoto, 1000);
}

function skipPhoto() {
    currentIndex++;
    updateProgress();
    showCurrentPhoto();
}

function updateProgress() {
    const progress = (currentIndex / currentPhotos.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

function showStatus(message, type = '') {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    // Удаляем старые кнопки если есть
    const oldBtn = statusDiv.querySelector('button');
    if (oldBtn) {
        oldBtn.remove();
    }
}