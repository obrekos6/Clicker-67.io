(function() {
    // ========== КОНСТАНТЫ ==========
    const STORAGE_KEY = 'clicker67';
    const SOUND_POOL_SIZE = 10;
    const SOUND_URL = 'https://image2url.com/r2/default/audio/1771312855502-5e7036d1-9027-47b7-8b8b-53bd8b990434.mp3';
    const PIN_CODE = '67';
    
    const BASE_PRICES = {
        CLICK: 670,      // 67 * 10
        AUTO: 6700,      // 67 * 100
        SPEED: 67000     // 67 * 1000
    };

    // ========== СОСТОЯНИЕ ИГРЫ ==========
    let state = {
        balance: 0,
        clickLevel: 1,
        autoLevel: 0,
        speedLevel: 1,
        currentMode: 'hands',
        totalPrestige: 0
    };

    // ========== DOM ЭЛЕМЕНТЫ ==========
    const elements = {
        score: document.getElementById('scoreValue'),
        clickPower: document.getElementById('clickPower'),
        autoPower: document.getElementById('autoPower'),
        speedLevel: document.getElementById('speedLevel'),
        clickUpgradeInfo: document.getElementById('clickUpgradeInfo'),
        autoUpgradeInfo: document.getElementById('autoUpgradeInfo'),
        speedUpgradeInfo: document.getElementById('speedUpgradeInfo'),
        clickUpgradeBtn: document.getElementById('clickUpgradeBtn'),
        autoUpgradeBtn: document.getElementById('autoUpgradeBtn'),
        speedUpgradeBtn: document.getElementById('speedUpgradeBtn'),
        clickArea: document.getElementById('clickArea'),
        floatingContainer: document.getElementById('floatingContainer'),
        resetBtn: document.getElementById('resetBtn'),
        prestigeBtn: document.getElementById('prestigeBtn'),
        modeHands: document.getElementById('modeHands'),
        modeFeet: document.getElementById('modeFeet'),
        pinModal: document.getElementById('pinModal'),
        pinInput: document.getElementById('pinInput'),
        pinSubmit: document.getElementById('pinSubmit'),
        pinCancel: document.getElementById('pinCancel')
    };

    // ========== ЗВУКОВАЯ СИСТЕМА ==========
    const soundPool = [];
    let currentSoundIndex = 0;

    // Инициализация звуков
    for (let i = 0; i < SOUND_POOL_SIZE; i++) {
        const audio = new Audio(SOUND_URL);
        audio.preload = 'auto';
        audio.volume = 0.5; // Уменьшаем громкость
        soundPool.push(audio);
    }

    function playClickSound() {
        const audio = soundPool[currentSoundIndex];
        audio.pause();
        audio.currentTime = 0;
        audio.play().catch(() => {}); // Игнорируем ошибки автовоспроизведения
        currentSoundIndex = (currentSoundIndex + 1) % SOUND_POOL_SIZE;
    }

    // ========== ИНТЕРВАЛ АВТОКЛИКЕРА ==========
    let autoInterval = null;
    let autoAmount = 0;

    // ========== УТИЛИТЫ ==========
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Генерация чисел из последовательности 67, 676, 6767, 67676...
    function generateSequenceNumber(level, isAuto = false) {
        if (level === 0) return 0;
        let str = '67';
        for (let i = 1; i < level; i++) {
            str += (i % 2 === 1) ? '6' : '7';
        }
        return parseInt(str, 10);
    }

    // Экспоненциальный расчет цены (x15 каждый уровень)
    function calculatePrice(basePrice, level) {
        return Math.floor(basePrice * Math.pow(15, level - 1));
    }

    // ========== ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ==========
    function updateUI() {
        const clickPower = generateSequenceNumber(state.clickLevel);
        const autoAmt = generateSequenceNumber(state.autoLevel, true);
        
        // Обновляем основные показатели
        elements.score.textContent = formatNumber(state.balance);
        elements.clickPower.textContent = clickPower;
        elements.autoPower.textContent = autoAmt;
        elements.speedLevel.textContent = state.speedLevel.toFixed(1) + 'x';

        // Обновляем информацию об улучшениях
        elements.clickUpgradeInfo.innerHTML = `ур.${state.clickLevel} (+${clickPower})`;
        elements.autoUpgradeInfo.innerHTML = `ур.${state.autoLevel} (+${autoAmt}/сек)`;
        elements.speedUpgradeInfo.innerHTML = `ур.${state.speedLevel} (${state.speedLevel.toFixed(1)}x)`;

        // Обновляем цены
        elements.clickUpgradeBtn.textContent = `цена: ${formatNumber(calculatePrice(BASE_PRICES.CLICK, state.clickLevel + 1))}`;
        elements.autoUpgradeBtn.textContent = `цена: ${formatNumber(calculatePrice(BASE_PRICES.AUTO, state.autoLevel + 1))}`;
        elements.speedUpgradeBtn.textContent = `цена: ${formatNumber(calculatePrice(BASE_PRICES.SPEED, state.speedLevel + 1))}`;

        // Обновляем состояние кнопок (доступность покупки)
        updateButtonsState();
        
        saveGame();
    }

    function updateButtonsState() {
        const clickPrice = calculatePrice(BASE_PRICES.CLICK, state.clickLevel + 1);
        const autoPrice = calculatePrice(BASE_PRICES.AUTO, state.autoLevel + 1);
        const speedPrice = calculatePrice(BASE_PRICES.SPEED, state.speedLevel + 1);

        elements.clickUpgradeBtn.disabled = state.balance < clickPrice;
        elements.autoUpgradeBtn.disabled = state.balance < autoPrice;
        elements.speedUpgradeBtn.disabled = state.balance < speedPrice;
    }

    // ========== АВТОКЛИКЕР ==========
    function updateAutoClick() {
        if (autoInterval) clearInterval(autoInterval);
        
        autoAmount = generateSequenceNumber(state.autoLevel, true);
        
        if (autoAmount > 0) {
            autoInterval = setInterval(() => {
                state.balance += autoAmount;
                updateUI();
            }, 1000);
        }
    }

    // ========== ВИЗУАЛЬНЫЕ ЭФФЕКТЫ ==========
    function createFloatingEffect(amount) {
        const floatingDiv = document.createElement('div');
        floatingDiv.classList.add('floating-item');

        const partsContainer = document.createElement('div');
        partsContainer.classList.add('dancing-parts');

        // Левая часть (6)
        const leftUnit = document.createElement('div');
        leftUnit.classList.add('part-unit', 'left');
        
        const leftDigit = document.createElement('span');
        leftDigit.textContent = '6';
        
        const leftEmoji = document.createElement('div');
        leftEmoji.classList.add('part-emoji');
        leftEmoji.textContent = state.currentMode === 'hands' ? '🫴' : '🦶';
        
        leftUnit.appendChild(leftDigit);
        leftUnit.appendChild(leftEmoji);

        // Правая часть (7)
        const rightUnit = document.createElement('div');
        rightUnit.classList.add('part-unit', 'right');
        
        const rightDigit = document.createElement('span');
        rightDigit.textContent = '7';
        
        const rightEmoji = document.createElement('div');
        rightEmoji.classList.add('part-emoji');
        rightEmoji.textContent = state.currentMode === 'hands' ? '🫴' : '🦶';
        
        rightUnit.appendChild(rightDigit);
        rightUnit.appendChild(rightEmoji);

        // Анимация скорости
        const animSpeed = Math.max(0.25 / state.speedLevel, 0.1);
        leftUnit.style.animationDuration = animSpeed + 's';
        rightUnit.style.animationDuration = animSpeed + 's';

        partsContainer.appendChild(leftUnit);
        partsContainer.appendChild(rightUnit);

        // Бонус
        const plus = document.createElement('div');
        plus.classList.add('plus-big');
        plus.textContent = `+${amount}`;

        floatingDiv.appendChild(partsContainer);
        floatingDiv.appendChild(plus);

        elements.floatingContainer.appendChild(floatingDiv);

        // Автоматическое удаление
        setTimeout(() => {
            if (floatingDiv.parentNode) {
                floatingDiv.remove();
            }
        }, 2000);
    }

    // ========== СИСТЕМА ПИН-КОДА ==========
    function requestPin(callback) {
        elements.pinModal.classList.remove('hidden');
        elements.pinInput.value = '';
        elements.pinInput.focus();

        const submitHandler = () => {
            if (elements.pinInput.value === PIN_CODE) {
                elements.pinModal.classList.add('hidden');
                callback(true);
            } else {
                alert('Неверный код! Попробуйте снова.');
                elements.pinInput.value = '';
                elements.pinInput.focus();
            }
        };

        const cancelHandler = () => {
            elements.pinModal.classList.add('hidden');
            callback(false);
        };

        elements.pinSubmit.onclick = submitHandler;
        elements.pinCancel.onclick = cancelHandler;

        elements.pinInput.onkeydown = (e) => {
            if (e.key === 'Enter') submitHandler();
            if (e.key === 'Escape') cancelHandler();
        };
    }

    // ========== ПЕРЕКЛЮЧЕНИЕ РЕЖИМА ==========
    function updateModeButtons() {
        if (state.currentMode === 'hands') {
            elements.modeHands.classList.add('active');
            elements.modeFeet.classList.remove('active');
        } else {
            elements.modeFeet.classList.add('active');
            elements.modeHands.classList.remove('active');
        }
    }

    function switchMode(newMode) {
        if (newMode === state.currentMode) return;
        
        requestPin((success) => {
            if (success) {
                state.currentMode = newMode;
                updateModeButtons();
                saveGame();
            }
        });
    }

    // ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
    elements.clickArea.addEventListener('click', (e) => {
        e.stopPropagation();
        const clickPower = generateSequenceNumber(state.clickLevel);
        state.balance += clickPower;
        updateUI();
        createFloatingEffect(clickPower);
        playClickSound();
    });

    elements.clickUpgradeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const price = calculatePrice(BASE_PRICES.CLICK, state.clickLevel + 1);
        
        if (state.balance >= price) {
            state.balance -= price;
            state.clickLevel++;
            updateUI();
        }
    });

    elements.autoUpgradeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const price = calculatePrice(BASE_PRICES.AUTO, state.autoLevel + 1);
        
        if (state.balance >= price) {
            state.balance -= price;
            state.autoLevel++;
            updateAutoClick();
            updateUI();
        }
    });

    elements.speedUpgradeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const price = calculatePrice(BASE_PRICES.SPEED, state.speedLevel + 1);
        
        if (state.balance >= price) {
            state.balance -= price;
            state.speedLevel = Math.round((state.speedLevel + 0.2) * 10) / 10;
            updateUI();
        }
    });

    elements.prestigeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (state.clickLevel > 1 || state.autoLevel > 0 || state.speedLevel > 1) {
            if (confirm('🌟 Переродиться?\n\nВесь прогресс будет сброшен, но вы получите постоянный бонус +67% к силе клика за каждое перерождение.')) {
                state.totalPrestige++;
                state.balance = 0;
                state.clickLevel = 1;
                state.autoLevel = 0;
                state.speedLevel = 1.0;
                
                if (autoInterval) {
                    clearInterval(autoInterval);
                    autoAmount = 0;
                }
                
                updateUI();
                saveGame();
                
                alert(`✨ Перерождение завершено!\nВсего перерождений: ${state.totalPrestige}`);
            }
        } else {
            alert('❌ Нужно хоть немного прокачаться перед перерождением!');
        }
    });

    elements.resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (confirm('⚠️ Сбросить весь прогресс?\n\nЭто действие нельзя отменить!')) {
            state = {
                balance: 0,
                clickLevel: 1,
                autoLevel: 0,
                speedLevel: 1,
                currentMode: 'hands',
                totalPrestige: 0
            };
            
            if (autoInterval) {
                clearInterval(autoInterval);
                autoAmount = 0;
            }
            
            updateModeButtons();
            updateUI();
            saveGame();
        }
    });

    elements.modeHands.addEventListener('click', () => switchMode('hands'));
    elements.modeFeet.addEventListener('click', () => switchMode('feet'));

    // Блокируем всплытие событий на контейнере с эффектами
    elements.floatingContainer.addEventListener('click', (e) => e.stopPropagation());

    // ========== СОХРАНЕНИЕ И ЗАГРУЗКА ==========
    function saveGame() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Не удалось сохранить игру:', e);
        }
    }

    function loadGame() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            
            if (saved) {
                const loadedState = JSON.parse(saved);
                
                // Валидация загруженных данных
                state = {
                    balance: Number(loadedState.balance) || 0,
                    clickLevel: Math.max(1, Number(loadedState.clickLevel) || 1),
                    autoLevel: Math.max(0, Number(loadedState.autoLevel) || 0),
                    speedLevel: Math.max(1, Number(loadedState.speedLevel) || 1),
                    currentMode: loadedState.currentMode === 'feet' ? 'feet' : 'hands',
                    totalPrestige: Number(loadedState.totalPrestige) || 0
                };
            }
        } catch (e) {
            console.warn('Не удалось загрузить сохранение:', e);
        }

        // Применяем загруженное состояние
        updateModeButtons();
        updateAutoClick();
        updateUI();
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    loadGame();

    // Предотвращаем случайный скролл при нажатии на кнопки на мобильных устройствах
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
        });
    });
})();