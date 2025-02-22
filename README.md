# FilmAffinity Telegram Bot

¡Bienvenido al repositorio del FilmAffinity Telegram Bot! Este bot te permite buscar y compartir fichas de películas y series directamente desde FilmAffinity. Está alojado en Val Town y listo para ayudarte a encontrar la información que necesitas.

## Características

- **Búsqueda de Películas y Series:** Encuentra fichas detalladas de películas y series.
- **Formatos de Salida:** Obtén la información en diferentes formatos según tus necesidades.
- **Soporte Multilenguaje:** Comandos disponibles en español e inglés.
- **Modo Inline:** Permite buscar y compartir fichas directamente desde cualquier chat sin necesidad de iniciar una conversación con el bot.

## Cómo Interactuar con el Bot

El bot responde a una serie de comandos que puedes usar para buscar y compartir fichas de películas y series. Aquí tienes una guía de cómo usarlo:

### Comandos Disponibles

- **/mensaje {mi_búsqueda}**: Devuelve la ficha en formato de mensaje de Telegram en español.
- **/message {mi_búsqueda}**: Devuelve la ficha en formato de mensaje de Telegram en inglés.
- **/foro {mi_búsqueda}**: Devuelve la ficha en formato BBCODE para usar en foros en español.
- **/forum {mi_búsqueda}**: Devuelve la ficha en formato BBCODE para usar en foros en inglés.

### Modo Inline

Para usar el bot en modo inline, simplemente escribe `@nombre_del_bot` seguido de tu término de búsqueda en cualquier chat. El bot te mostrará una lista de coincidencias directamente en el chat.

### Pasos para Usar el Bot

1. **Iniciar el Bot:**
   - Envía el comando `/start` para iniciar la interacción con el bot.

2. **Buscar una Película o Serie:**
   - Usa uno de los comandos mencionados seguido del término de búsqueda. Por ejemplo:
     ```
     /mensaje Clerks
     ```

3. **Seleccionar la Coincidencia:**
   - El bot te mostrará una lista de coincidencias. Selecciona la que deseas para obtener la ficha correspondiente.


## Alojamiento

Este bot está alojado en Val Town, lo que garantiza una alta disponibilidad y rendimiento.


## Pasos para crear tu propio Bot

### 1. Crear el Bot en @BotFather

1. **Abrir Telegram** y buscar `@BotFather`.
2. **Iniciar una conversación** con `@BotFather` y usar el comando `/newbot`.
3. **Seguir las instrucciones** para crear un nuevo bot. Te pedirá que elijas un nombre y un nombre de usuario para tu bot.
4. **Guardar el token** que `@BotFather` te proporcionará. Este token es único para tu bot y lo necesitarás para configurar el webhook.

### 2. Habilitar el Modo Inline

1. **En la conversación con @BotFather**, usa el comando `/setinline` seguido del nombre de usuario de tu bot.
2. **Configura el lugar de feedback** para tu bot usando el comando `/setinlinefeedback` seguido del nombre de usuario de tu bot.

### 3. Establecer el Webhook

1. **Obtén la URL** que Val Town te proporciona para tu servicio HTTP.
2. **Configura el webhook** para tu bot usando la siguiente URL:
```
https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook?url={URL_PROPORCIONADA_POR_VAL_TOWN}
```
Reemplaza `{TELEGRAM_BOT_TOKEN}` con el token que obtuviste de `@BotFather` y `{URL_PROPORCIONADA_POR_VAL_TOWN}` con la URL que Val Town te proporcionó.

### 4. Guardar el Token en Val Town

1. **Accede a tu proyecto en Val Town**.
2. **Añade una variable de entorno** con el nombre `TG_BOT_FILMAFFINITY` y el valor del token que obtuviste de `@BotFather`.

### 5. Copiar/Pegar el Contenido del Script

1. **Copia el contenido** del archivo `filmaffinity_ficha_telegram_bot.ts`.
2. **Pega el contenido** en el editor de código de Val Town.
3. **Guarda los cambios** y asegúrate de que el script esté configurado para ejecutarse como un servicio HTTP.

## Contribuir

Si deseas contribuir al desarrollo de este bot, siéntete libre de hacer un fork de este repositorio y enviar tus pull requests. ¡Toda ayuda es bienvenida!

¡Espero que disfrutes usando el FilmAffinity Telegram Bot! Si tienes alguna pregunta o sugerencia, no dudes en abrir un issue en este repositorio.
