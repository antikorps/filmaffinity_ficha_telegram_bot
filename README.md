# Filmaffinity Ficha Telegram Bot

Este bot de Telegram te permite crear y enviar mensajes con fichas de películas de Filmaffinity utilizando el modo inline en tus grupos. Es una herramienta útil para compartir información detallada sobre películas directamente en tus conversaciones de Telegram.

## Características

- **Modo Inline**: Permite buscar y compartir fichas de películas directamente desde la barra de búsqueda de Telegram.
- **Información Detallada**: Proporciona detalles como título, año, géneros, puntuación, director, reparto y sinopsis.
- **Integración con Filmaffinity**: Utiliza la base de datos de Filmaffinity para obtener información precisa y actualizada sobre películas.

## Alojamiento

El código es un script diseñado para ejecutarse en [Val Town](https://val.town/) como un servicio HTTP. Val Town es una plataforma que facilita el despliegue y la ejecución de scripts en la nube.

## Pasos para Configurar el Bot

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

## Ejemplo de Uso

1. **Abre Telegram** y busca tu bot en la barra de búsqueda.
2. **Escribe el nombre de una película** en la barra de búsqueda inline.
3. **Selecciona la película** que deseas compartir de los resultados que aparecen.
4. **Envía el mensaje** con la ficha de la película a tu grupo o conversación.

![captura](https://i.imgur.com/kJszuaL.png)
![captura](https://i.imgur.com/6aLB3Sh.png)
