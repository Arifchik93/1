
// ==UserScript==
// @name         Create Main Trigger Button
// @namespace    https://github.com/Arifchik93/
// @version      1.2
// @description  Скрипт для создания кнопки триггера
// @author       Arifchik93
// @match        http://10.16.0.48/prod/*
// @match        https://template.softrust.ru/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @connect      githack.com
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Конфигурация
    const CONFIG = {
        fields: {
            'gostValue1': 'ФИО пациента',
            'gostValue2': 'дата взятия',
            'gostValue3': 'дата рождения',
            'gostValue4': '№ страхового полиса',
            'multiLineTextDiv5|Проведено|before': 'диагноз',
            'multiLineTextDiv5|Проведено|after': 'способ взятия материала'
        },
        randomFields: {
            'singleLineTextInput4': { type: 'range', min: 60, max: 90, step: 4 },
            'singleLineTextInput5': { type: 'list', values: [110, 115, 120, 125] },
            'singleLineTextInput10': { type: 'list', values: [70, 75, 80, 85] },
            'singleLineTextInput7': { type: 'range', min: 14, max: 18, step: 1 }
        },
        autoButtonsMode: localStorage.getItem('autoButtonsMode') === 'true' || false,
        // Целевые признаки для обнаружения правильной страницы
        targetSelectors: [
            '#gostValue11',
            '.gost-value',
            'input[type="text"]',
            'textarea',
            'div[contenteditable="true"]'
        ]
    };

    // Главная функция инициализации
    function init() {
        console.log('Скрипт инициализирован. Поиск целевой страницы...');

        // Проверяем наличие нужных элементов с задержкой
        setTimeout(() => {
            if (isTargetPage()) {
                console.log('Целевая страница обнаружена. Создание интерфейса...');
                createMainTriggerButton();
                updateRandomFields();

                // Загружаем кнопки возле полей при инициализации
                if (CONFIG.autoButtonsMode) {
                    loadAndCreateFieldButtons();
                }
            } else {
                console.log('Целевая страница не обнаружена. Повторная проверка через 2 секунды...');
                // Повторная проверка через 2 секунды
                setTimeout(() => {
                    if (isTargetPage()) {
                        createMainTriggerButton();
                        updateRandomFields();
                    }
                }, 2000);
            }
        }, 1000);
    }

    // Улучшенная проверка целевой страницы
    function isTargetPage() {
        // Проверка 1: Наличие характерных полей
        const hasFormFields = checkForFormFields();
        if (hasFormFields) return true;

        // Проверка 2: Наличие URL признаков
        const currentUrl = window.location.href;
        const urlPatterns = [
            /prod\/.*/,
            /\/form\//,
            /\/document\//,
            /\/create\//
        ];

        for (const pattern of urlPatterns) {
            if (pattern.test(currentUrl)) {
                console.log('Целевая страница обнаружена по URL:', currentUrl);
                return true;
            }
        }

        // Проверка 3: Наличие медицинских терминов на странице
        const medicalTerms = [
            'пациент',
            'диагноз',
            'материал',
            'исследование',
            'медицинск'
        ];

        const pageText = document.body.textContent.toLowerCase();
        for (const term of medicalTerms) {
            if (pageText.includes(term)) {
                console.log('Целевая страница обнаружена по термину:', term);
                return true;
            }
        }

        return false;
    }

    // Проверка наличия полей формы
    function checkForFormFields() {
        // Проверка в основном документе
        for (const selector of CONFIG.targetSelectors) {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    console.log(`Найдены элементы: ${selector} (${elements.length} шт.)`);
                    return true;
                }
            } catch (e) {
                console.log('Ошибка при поиске элементов:', e);
            }
        }

        // Проверка во фреймах
        const frames = document.getElementsByTagName('iframe');
        for (let i = 0; i < frames.length; i++) {
            try {
                const frameDoc = frames[i].contentDocument || frames[i].contentWindow.document;
                for (const selector of CONFIG.targetSelectors) {
                    const elements = frameDoc.querySelectorAll(selector);
                    if (elements.length > 0) {
                        console.log(`Найдены элементы во фрейме: ${selector}`);
                        return true;
                    }
                }
            } catch (e) {
                // Игнорируем ошибки доступа к фреймам
                console.log('Нет доступа к фрейму:', e);
            }
        }

        return false;
    }

    // Создание главной кнопки триггера (упрощенная версия для начала)
    function createMainTriggerButton() {
        // Удаляем старый контейнер если есть
        const oldContainer = document.getElementById('mainTriggerButtonsContainer');
        if (oldContainer) {
            oldContainer.remove();
        }

        // Создаем простой индикатор чтобы убедиться что скрипт работает
        const debugIndicator = document.createElement('div');
        debugIndicator.textContent = 'Скрипт активен';
        debugIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: green;
            color: white;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
            z-index: 99999;
            display: none;
        `;
        document.body.appendChild(debugIndicator);

        const container = document.createElement('div');
        container.id = 'mainTriggerButtonsContainer';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;

        // Создаем кнопки по очереди для отладки
        const buttons = [
            {
                text: '⚙️',
                color: CONFIG.autoButtonsMode ? '#4CAF50' : '#FF9800',
                title: CONFIG.autoButtonsMode ? 'Авто-кнопки: ВКЛ' : 'Авто-кнопки: ВЫКЛ',
                action: toggleAutoButtonsMode
            },
            {
                text: '🧪',
                color: '#9C27B0',
                title: 'Направление на цитологическое исследование',
                action: () => {
                    console.log('Кнопка цитологии нажата');
                    saveFormData();
                    processAndPrintTemplate('ONABOUTVLENOE');
                }
            },
            {
                text: '☑',
                color: '#9C27B0',
                title: 'НА ВК и эпикриз',
                action: () => {
                    console.log('Кнопка ВК нажата');
                    processAndPrintTemplate('VK+epicriz');
                }
            },
            {
                text: 'R',
                color: '#9C27B0',
                title: 'Реестр',
                action: () => {
                    console.log('Кнопка реестра нажата');
                    displayDataFrame();
                }
            },
            {
                text: 'С',
                color: '#9C27B0',
                title: 'согласие',
                action: () => {
                    console.log('Кнопка согласия нажата');
                    processAndPrintTemplate('coglasie');
                }
            }
        ];

        buttons.forEach((btn, index) => {
            setTimeout(() => {
                const button = document.createElement('button');
                button.innerHTML = btn.text;
                button.title = btn.title;
                button.style.cssText = `
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: ${btn.color};
                    color: white;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    font-size: 16px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s;
                `;

                button.addEventListener('mouseenter', () => {
                    button.style.transform = 'scale(1.1)';
                });

                button.addEventListener('mouseleave', () => {
                    button.style.transform = 'scale(1)';
                });

                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    btn.action();
                });

                container.appendChild(button);

                // Показываем индикатор когда все кнопки созданы
                if (index === buttons.length - 1) {
                    debugIndicator.style.display = 'block';
                    setTimeout(() => {
                        debugIndicator.style.display = 'none';
                    }, 3000);
                }
            }, index * 100);
        });

        document.body.appendChild(container);
        console.log('Кнопки созданы');

        if (CONFIG.autoButtonsMode) {
            createButtonsFromExternalConfig();
        }
    }

    // Переключение режима авто-кнопок
    function toggleAutoButtonsMode() {
        CONFIG.autoButtonsMode = !CONFIG.autoButtonsMode;
        localStorage.setItem('autoButtonsMode', CONFIG.autoButtonsMode.toString());

        const toggleBtn = document.querySelector('#mainTriggerButtonsContainer button:first-child');
        if (toggleBtn) {
            toggleBtn.style.backgroundColor = CONFIG.autoButtonsMode ? '#4CAF50' : '#FF9800';
            toggleBtn.title = CONFIG.autoButtonsMode ? 'Авто-кнопки: ВКЛ' : 'Авто-кнопки: ВЫКЛ';
        }

        if (CONFIG.autoButtonsMode) {
            createButtonsFromExternalConfig();
            loadAndCreateFieldButtons();
        } else {
            const tools = document.querySelector('.global-tools-container');
            if (tools) tools.remove();

            removeFieldButtons();
        }
    }

    // Загрузка и создание кнопок возле полей
    async function loadAndCreateFieldButtons() {
        try {
            const response = await fetch(`https://raw.githubusercontent.com/Arifchik93/1/main/CAOP.txt?t=${Date.now()}`);
            const configText = await response.text();
            const processedConfig = configText.replace(/{current_date}/g, new Date().toLocaleDateString());
            const config = JSON.parse(processedConfig);

            processFieldsForButtons(window, config);

        } catch (e) {
            console.error('Ошибка при загрузке конфигурации для кнопок полей:', e);
        }
    }

    // Обработка фреймов для создания кнопок возле полей
    function processFieldsForButtons(win, config) {
        try {
            // Сначала обрабатываем основной документ
            for (const fieldId in config.fields) {
                if (fieldId === 'multiple') continue;

                const element = win.document.getElementById(fieldId);
                if (element && !element.nextElementSibling?.classList?.contains('field-buttons')) {
                    createFieldButtonsForElement(element, config.fields[fieldId]);
                }
            }

            // Затем рекурсивно обрабатываем фреймы
            if (win.frames && win.frames.length > 0) {
                for (let i = 0; i < win.frames.length; i++) {
                    try {
                        // Используем try-catch для каждого фрейма отдельно
                        processFieldsForButtons(win.frames[i], config);
                    } catch (e) {
                        console.log('Нет доступа к фрейму #' + i + ':', e);
                        continue;
                    }
                }
            }
        } catch (e) {
            console.error('Ошибка при обработке фрейма:', e);
        }
    }

    // Создание кнопок для конкретного элемента
    function createFieldButtonsForElement(element, buttonConfigs) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'field-buttons';
        buttonContainer.style.cssText = `
            display: inline-block;
            margin-left: 10px;
            vertical-align: middle;
        `;

        buttonConfigs.forEach(buttonConfig => {
            const button = document.createElement('button');
            button.textContent = buttonConfig.name;
            button.style.cssText = `
                margin: 2px;
                padding: 3px 6px;
                font-size: 11px;
                cursor: pointer;
                background-color: #e0e0e0;
                border: 1px solid #ccc;
                border-radius: 3px;
            `;

            button.addEventListener('click', () => {
                insertText(element, buttonConfig.text);
            });

            buttonContainer.appendChild(button);
        });

        element.insertAdjacentElement('afterend', buttonContainer);
    }

    // Удаление кнопок возле полей
    function removeFieldButtons() {
        // Удаляем из основного документа
        const mainButtons = document.querySelectorAll('.field-buttons');
        mainButtons.forEach(btn => btn.remove());

        // Удаляем из фреймов
        const frames = document.getElementsByTagName('iframe');
        for (let frame of frames) {
            try {
                const frameDoc = frame.contentDocument || frame.contentWindow.document;
                const frameButtons = frameDoc.querySelectorAll('.field-buttons');
                frameButtons.forEach(btn => btn.remove());
            } catch (e) {
                console.log('Нет доступа к фрейму для удаления кнопок:', e);
            }
        }
    }

    // Создание кнопок из внешней конфигурации (панель инструментов)
    async function createButtonsFromExternalConfig() {
        try {
            const response = await fetch(`https://raw.githubusercontent.com/Arifchik93/1/main/CAOP.txt?t=${Date.now()}`);
            const configText = await response.text();
            const processedConfig = configText.replace(/{current_date}/g, new Date().toLocaleDateString());
            const config = JSON.parse(processedConfig);

            const tools = document.querySelector('.global-tools-container');
            if (tools) tools.remove();

            const container = document.createElement('div');
            container.className = 'global-tools-container';
            container.style.cssText = `
                position: fixed;
                top: 50%;
                right: 10px;
                transform: translateY(-50%);
                z-index: 9999;
                background: rgba(240, 240, 240, 0.95);
                padding: 10px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                backdrop-filter: blur(5px);
                border: 1px solid #ddd;
                max-height: 80vh;
                overflow-y: auto;
                min-width: 150px;
            `;

            // Заголовок
            const header = document.createElement('div');
            header.textContent = 'Инструменты';
            header.style.cssText = `
                font-weight: bold;
                margin-bottom: 10px;
                text-align: center;
                color: #333;
                font-size: 14px;
            `;
            container.appendChild(header);

            // Кнопка закрытия
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                background: none;
                border: none;
                font-size: 16px;
                cursor: pointer;
                color: #999;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            closeBtn.addEventListener('click', () => container.remove());
            container.appendChild(closeBtn);

            // Комплексные кнопки
            if (config.fields?.multiple) {
                config.fields.multiple.forEach(buttonConfig => {
                    const button = document.createElement('button');
                    button.textContent = buttonConfig.name;
                    button.style.cssText = `
                        display: block;
                        margin: 8px 0;
                        padding: 8px 12px;
                        cursor: pointer;
                        width: 100%;
                        background: rgba(100, 149, 237, 0.9);
                        color: white;
                        border: none;
                        border-radius: 4px;
                        font-size: 12px;
                    `;

                    button.addEventListener('click', () => {
                        for (const fieldId in buttonConfig.fields) {
                            const element = getElementByIdRecursive(fieldId);
                            if (element) insertText(element, buttonConfig.fields[fieldId]);
                        }
                    });

                    container.appendChild(button);
                });

                // Добавляем кнопку очистки полей
                const clearButton = document.createElement('button');
                clearButton.textContent = 'Очистить все поля';
                clearButton.style.cssText = `
                    display: block;
                    margin: 8px 0;
                    padding: 8px 12px;
                    cursor: pointer;
                    width: 100%;
                    background: rgba(244, 67, 54, 0.9);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 12px;
                    margin-top: 15px;
                `;

                clearButton.addEventListener('click', () => {
                    const fieldsToClear = [
                        "multiLineTextDiv6",
                        "multiLineTextDiv1",
                        "multiLineTextDiv2",
                        "singleLineTextInput4",
                        "singleLineTextInput5",
                        "singleLineTextInput10",
                        "singleLineTextInput7",
                        "singleLineTextInput8",
                        "multiLineTextDiv3",
                        "multiLineTextDiv5",
                        "multiLineTextDiv4"
                    ];

                    fieldsToClear.forEach(fieldId => {
                        const element = getElementByIdRecursive(fieldId);
                        if (element) {
                            insertText(element, '', true);
                        }
                    });
                });

                container.appendChild(clearButton);
            }

            document.body.appendChild(container);

        } catch (e) {
            console.error('Ошибка при загрузке конфигурации:', e);
        }
    }

    // Обновление случайных полей
    function updateRandomFields() {
        for (const fieldId in CONFIG.randomFields) {
            const element = getElementByIdRecursive(fieldId);
            if (element) {
                const randomValue = getRandomValue(CONFIG.randomFields[fieldId]);
                insertText(element, randomValue, true);
            }
        }
    }

    // Получение элемента по ID рекурсивно
    function getElementByIdRecursive(id) {
        // Сначала ищем в основном документе
        let element = document.getElementById(id);
        if (element) return element;

        // Затем ищем во фреймах
        const frames = document.getElementsByTagName('iframe');
        for (let frame of frames) {
            try {
                const frameDoc = frame.contentDocument || frame.contentWindow.document;
                element = frameDoc.getElementById(id);
                if (element) return element;
            } catch (e) {
                console.log('Нет доступа к фрейму при поиске элемента', id, ':', e);
            }
        }

        return null;
    }

    // Генерация случайных значений
    function getRandomValue(fieldConfig) {
        if (fieldConfig.type === 'range') {
            const { min, max, step } = fieldConfig;
            const steps = Math.floor((max - min) / step);
            const randomStep = Math.floor(Math.random() * (steps + 1));
            return (min + randomStep * step).toString();
        } else if (fieldConfig.type === 'list') {
            const randomIndex = Math.floor(Math.random() * fieldConfig.values.length);
            return fieldConfig.values[randomIndex].toString();
        }
        return '';
    }

    // Вставка текста в элемент
    function insertText(element, text, clear = false) {
        if (!element) return;

        try {
            if (clear) {
                if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                    element.value = text;
                } else {
                    element.textContent = text;
                }
            } else {
                if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                    element.value += text;
                } else {
                    element.textContent += text;
                }
            }

            // Инициируем события для обновления формы
            const event = new Event('input', { bubbles: true });
            element.dispatchEvent(event);

            const changeEvent = new Event('change', { bubbles: true });
            element.dispatchEvent(changeEvent);
        } catch (e) {
            console.error('Ошибка при вставке текста:', e);
        }
    }

    // Сохранение данных формы
    function saveFormData() {
        try {
            const data = {};

            Object.keys(CONFIG.fields).forEach(id => {
                data[id] = getComplexValue(id);
            });

            const storage = JSON.parse(localStorage.getItem('formDataStorage') || '[]');
            storage.push({
                name: 'Медицинская карта',
                date: new Date().toISOString(),
                data: data
            });

            localStorage.setItem('formDataStorage', JSON.stringify(storage));
            console.log('Данные сохранены:', data);
            return data;
        } catch (e) {
            console.error('Ошибка при сохранении данных:', e);
            return {};
        }
    }

    // Получение значения из сложного поля
    function getComplexValue(id) {
        try {
            if (id.includes('|')) {
                const [realId, marker, position] = id.split('|').map(p => p.trim());
                const element = getElementByIdRecursive(realId);
                if (!element) return '';

                const content = element.value || element.textContent || '';
                const markerIndex = content.indexOf(marker);
                if (markerIndex === -1) return '';

                return position === 'before'
                    ? content.substring(0, markerIndex).trim()
                    : content.substring(markerIndex + marker.length).trim();
            }

            const element = getElementByIdRecursive(id);
            return element ? (element.value || element.textContent || '').trim() : '';
        } catch (e) {
            console.error('Ошибка при получении значения поля', id, ':', e);
            return '';
        }
    }

    // Обработка и печать шаблона
    async function processAndPrintTemplate(templateName) {
        try {
            console.log('Загрузка шаблона:', templateName);
            const response = await fetch(`https://raw.githubusercontent.com/Arifchik93/1/main/${templateName}.html?t=${Date.now()}`);
            if (!response.ok) throw new Error(`Шаблон "${templateName}" не найден (${response.status})`);

            let templateHtml = await response.text();
            console.log('Шаблон загружен, размер:', templateHtml.length, 'символов');

            // Замена плейсхолдеров
            const placeholders = templateHtml.match(/\{([^}]+)\}/g) || [];
            const uniquePlaceholders = [...new Set(placeholders)];
            console.log('Найдено плейсхолдеров:', uniquePlaceholders.length);

            for (const placeholder of uniquePlaceholders) {
                const value = getComplexValue(placeholder.slice(1, -1));
                if (value) {
                    const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    templateHtml = templateHtml.replace(new RegExp(escapedPlaceholder, 'g'), value);
                }
            }

            // Печать
            const printWindow = window.open('', '_blank');
            printWindow.document.open();
            printWindow.document.write(templateHtml);
            printWindow.document.close();

            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                setTimeout(() => {
                    printWindow.close();
                    console.log('Печать завершена');
                }, 1000);
            }, 500);

        } catch (error) {
            console.error('Ошибка при обработке шаблона:', error);
            alert('Ошибка: ' + error.message);
        }
    }

    // Отображение таблицы с данными
    function displayDataFrame() {
        try {
            const storageData = JSON.parse(localStorage.getItem('formDataStorage') || '[]');
            console.log('Загрузка данных для реестра:', storageData.length, 'записей');

            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
            `;

            const content = document.createElement('div');
            content.style.cssText = `
                background: white;
                padding: 20px;
                border-radius: 8px;
                max-width: 90%;
                max-height: 90%;
                overflow: auto;
                box-shadow: 0 0 20px rgba(0,0,0,0.3);
            `;

            content.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">Сохраненные записи (${storageData.length})</h3>
                    <div>
                        <button id="deleteAllBtn" style="margin-right: 10px; padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Удалить все
                        </button>
                        <button id="printAllBtn" style="margin-right: 10px; padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Печать
                        </button>
                        <button id="closeBtn" style="padding: 8px 16px; background: #777; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Закрыть
                        </button>
                    </div>
                </div>
                ${createTableHtml(storageData)}
            `;

            modal.appendChild(content);
            document.body.appendChild(modal);

            // Обработчики событий
            content.querySelector('#printAllBtn').addEventListener('click', () => printAllRecords(storageData));
            content.querySelector('#deleteAllBtn').addEventListener('click', deleteAllRecords);
            content.querySelector('#closeBtn').addEventListener('click', () => modal.remove());

            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });

        } catch (e) {
            console.error('Ошибка при отображении реестра:', e);
            alert('Ошибка при отображении реестра: ' + e.message);
        }
    }

    // Создание HTML таблицы
    function createTableHtml(data) {
        if (data.length === 0) return '<p>Нет сохраненных данных</p>';

        let html = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px; background: #f2f2f2;">№</th>
                        <th style="border: 1px solid #ddd; padding: 8px; background: #f2f2f2;">Дата</th>
                        ${Object.values(CONFIG.fields).map(name =>
                            `<th style="border: 1px solid #ddd; padding: 8px; background: #f2f2f2;">${name}</th>`
                        ).join('')}
                        <th style="border: 1px solid #ddd; padding: 8px; background: #f2f2f2; width: 40px;"></th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach((record, index) => {
            html += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${new Date(record.date).toLocaleDateString()}</td>
                    ${Object.keys(CONFIG.fields).map(id =>
                        `<td style="border: 1px solid #ddd; padding: 8px;">${record.data[id] || '—'}</td>`
                    ).join('')}
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                        <button class="deleteRecordBtn" data-index="${index}" style="background: none; border: none; color: #f44336; cursor: pointer; font-size: 18px; padding: 0; width: 24px; height: 24px;">
                            ×
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;

        // Добавляем обработчики для кнопок удаления
        setTimeout(() => {
            document.querySelectorAll('.deleteRecordBtn').forEach(button => {
                button.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    deleteRecord(index);
                });
            });
        }, 100);

        return html;
    }

    // Удаление одной записи
    function deleteRecord(index) {
        try {
            const storage = JSON.parse(localStorage.getItem('formDataStorage') || '[]');
            if (index >= 0 && index < storage.length) {
                storage.splice(index, 1);
                localStorage.setItem('formDataStorage', JSON.stringify(storage));

                // Обновляем таблицу
                const modal = document.querySelector('div[style*="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5)"]');
                if (modal) modal.remove();
                displayDataFrame();
            }
        } catch (e) {
            console.error('Ошибка при удалении записи:', e);
        }
    }

    // Удаление всех записей
    function deleteAllRecords() {
        if (confirm('Вы уверены, что хотите удалить все записи?')) {
            localStorage.setItem('formDataStorage', '[]');
            const modal = document.querySelector('div[style*="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5)"]');
            if (modal) modal.remove();
            displayDataFrame();
        }
    }

    // Печать всех записей
    function printAllRecords(data) {
        try {
            const printWindow = window.open('', '_blank');
            printWindow.document.open();
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Учетная ведомость биоматериалов</title>
                    <style>
                        body { font-family: Arial; margin: 20px; }
                        h2 { text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #000; padding: 8px; }
                        th { background-color: #f2f2f2; }
                        @media print {
                            body { margin: 0; }
                            @page { margin: 20mm; }
                        }
                    </style>
                </head>
                <body>
                    <h2>Учетная ведомость биоматериалов, направленных на цитологический анализ</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>№ ЦИ</th>
                                ${Object.values(CONFIG.fields).map(name => `<th>${name}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map((record, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    ${Object.keys(CONFIG.fields).map(id =>
                                        `<td>${record.data[id] || '—'}</td>`
                                    ).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
                </html>
            `);
            printWindow.document.close();

            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                setTimeout(() => printWindow.close(), 1000);
            }, 500);
        } catch (e) {
            console.error('Ошибка при печати:', e);
            alert('Ошибка при печати: ' + e.message);
        }
    }

    // Запуск скрипта с улучшенной инициализацией
    console.log('Скрипт Create Main Trigger Button загружен');

    // Запускаем инициализацию
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Также запускаем инициализацию при динамических изменениях
    const observer = new MutationObserver(function(mutations) {
        // Проверяем, не появились ли целевые элементы
        if (!document.getElementById('mainTriggerButtonsContainer') && isTargetPage()) {
            createMainTriggerButton();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();