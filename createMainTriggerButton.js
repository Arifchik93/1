// Главная кнопка для запуска скрипта
function createMainTriggerButton() {
  const buttonsContainer = document.createElement('div');
  Object.assign(buttonsContainer.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '10000',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  });

  // Основная кнопка активации инструментов
  const triggerBtn = document.createElement('button');
  Object.assign(triggerBtn.style, {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });
  triggerBtn.innerHTML = '⚙️';
  triggerBtn.title = 'Активировать инструменты';

  // Кнопка для цитологического исследования
  const cytologyBtn = document.createElement('button');
  Object.assign(cytologyBtn.style, {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#9C27B0',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });
  cytologyBtn.innerHTML = '🧪';
  cytologyBtn.title = 'Направление на цитологическое исследование';

  // Обработчики событий
  triggerBtn.addEventListener('click', function() {
    createButtonsFromExternalConfig();
    buttonsContainer.style.display = 'none'; // Скрываем контейнер после нажатия
  });

  cytologyBtn.addEventListener('click', function() {
    processAndPrintTemplate('ONABOUTVLENOE');
    buttonsContainer.style.display = 'none'; // Скрываем контейнер после нажатия
  });

  // Добавляем кнопки в контейнер
  buttonsContainer.appendChild(cytologyBtn);
  buttonsContainer.appendChild(triggerBtn);
  
  document.body.appendChild(buttonsContainer);
}

// Основная функция создания кнопок
async function createButtonsFromExternalConfig() {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`https://raw.githubusercontent.com/Arifchik93/1/main/CAOP.txt?t=${Date.now()}`);
    const configText = await response.text();
    const processedConfig = configText.replace(/{current_date}/g, new Date().toLocaleDateString());
    const config = JSON.parse(processedConfig);

    function insertTextToElement(element, text, clear = false) {
      if (!element) return;
      
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
      
      const event = new Event('change', { bubbles: true });
      element.dispatchEvent(event);
    }

    // Создаем контейнер для комплексных кнопок на главной странице
    const globalContainer = document.createElement('div');
    Object.assign(globalContainer.style, {
      position: 'fixed',
      top: '50%',
      right: '10px',
      transform: 'translateY(-50%)',
      zIndex: '9999',
      backgroundColor: 'rgba(240, 240, 240, 0.9)',
      padding: '10px',
      borderRadius: '5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(5px)',
      border: '1px solid #ddd',
      maxHeight: '80vh',
      overflowY: 'auto'
    });

    // Заголовок панели
    const header = document.createElement('div');
    header.textContent = 'Инструменты';
    Object.assign(header.style, {
      fontWeight: 'bold',
      marginBottom: '10px',
      textAlign: 'center',
      color: '#333'
    });
    globalContainer.appendChild(header);

    // Кнопка закрытия
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: '5px',
      right: '5px',
      background: 'none',
      border: 'none',
      fontSize: '16px',
      cursor: 'pointer',
      color: '#999'
    });
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(globalContainer);
      createMainTriggerButton(); // Восстанавливаем главную кнопку
    });
    globalContainer.appendChild(closeBtn);

    // Измененный обработчик комплексных кнопок:
if (config.fields.multiple) {
  config.fields.multiple.forEach(buttonConfig => {
    const button = document.createElement('button');
    button.textContent = buttonConfig.name;
    Object.assign(button.style, {
      display: 'block',
      margin: '8px 0',
      padding: '8px 12px',
      cursor: 'pointer',
      width: '100%',
      backgroundColor: 'rgba(100, 149, 237, 0.8)',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      transition: 'background-color 0.3s'
    });

    button.addEventListener('click', () => {
      // Проходим по всем полям в конфигурации кнопки
      for (const fieldId in buttonConfig.fields) {
        const fieldText = buttonConfig.fields[fieldId];
        
        // Функция для обработки всех окон и фреймов
        const processWindow = (win) => {
          try {
            const elements = win.document.querySelectorAll(`#${fieldId}`);
            elements.forEach(element => {
              insertTextToElement(element, fieldText);
            });
            
            // Обрабатываем вложенные фреймы
            for (let i = 0; i < win.frames.length; i++) {
              try {
                processWindow(win.frames[i]);
              } catch (e) {
                console.log('Нет доступа к фрейму:', e);
              }
            }
          } catch (e) {
            console.error(`Ошибка при обработке поля ${fieldId}:`, e);
          }
        };
        
        processWindow(window);
      }
    });
    
    globalContainer.appendChild(button);
  });
}

    document.body.appendChild(globalContainer);

    // Обработка обычных кнопок (возле полей)
    function processFrames(win) {
      try {
        for (const fieldId in config.fields) {
          if (fieldId === 'multiple') continue;
          
          const element = win.document.getElementById(fieldId);
          if (element) {
            const buttonContainer = win.document.createElement('div');
            Object.assign(buttonContainer.style, {
              display: 'inline-block',
              marginLeft: '10px',
              verticalAlign: 'top'
            });
            
            config.fields[fieldId].forEach(buttonConfig => {
              const button = win.document.createElement('button');
              button.textContent = buttonConfig.name;
              Object.assign(button.style, {
                margin: '2px',
                padding: '3px 6px',
                fontSize: '12px',
                cursor: 'pointer'
              });
              
              button.addEventListener('click', () => {
                insertTextToElement(element, buttonConfig.text);
              });
              
              buttonContainer.appendChild(button);
            });
            
            element.insertAdjacentElement('afterend', buttonContainer);
          }
        }
        
        for (let i = 0; i < win.frames.length; i++) {
          try {
            processFrames(win.frames[i]);
          } catch (e) {
            console.log('Нет доступа к фрейму:', e);
          }
        }
      } catch (e) {
        console.error('Ошибка при обработке фрейма:', e);
      }
    }
    
    processFrames(window);

  } catch (e) {
    console.error('Ошибка при загрузке конфигурации:', e);
  }
}

// Создаем главную кнопку-триггер при загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createMainTriggerButton);
} else {
  createMainTriggerButton();
}


