import { DOMParser, HTMLDocument } from "jsr:@b-fuze/deno-dom";

enum TraduccionES {
    Titulo = "Título",
    Año = "Año",
    Director = "Director",
    Reparto = "Reparto",
    Generos = "Géneros",
    Calificación = "Calificación",
    Sinopsis = "Sinopsis",
    Votos = "votos",
    FichaCompleta = "Ver ficha completa"
}
enum TraduccionEN {
    Titulo = "Title",
    Año = "Year",
    Director = "Director",
    Reparto = "Casting",
    Generos = "Genres",
    Calificación = "Rating",
    Sinopsis = "Synopsis",
    Votos = "votes",
    FichaCompleta = "View full entry"
}

enum Idioma {
    es = "es",
    en = "en",
}

const Traduccion = {
    es: TraduccionES,
    en: TraduccionEN,
};

interface InlineModeSolicitud {
    type: string;
    id: string;
    title: string;
    description: string;
    thumb_url: string;
    input_message_content: {
        message_text: string;
        parse_mode: string;
        link_preview_options: {
            show_above_text: boolean;
            prefer_large_media: boolean;
        };
    };
}

interface TelegramEntidad {
    offset: number;
    length: number;
    type: string;
}

enum Comandos {
    Start,
    Mensaje,
    Foro,
    Message,
    Forum,
}

class FilmAffinity {
    url: string;
    doc: HTMLDocument | null;
    error: string | null;
    idioma: Idioma;
    formato: string;

    private constructor(url: string, idioma: Idioma, formato: string) {
        this.url = url;
        this.doc = null;
        this.error = null;
        this.idioma = idioma;
        this.formato = formato;
    }

    static async crear(
        url: string,
        idioma: string,
        formato: string,
    ): Promise<FilmAffinity> {
        let i = Idioma.es;
        if (idioma == "en") {
            i = Idioma.en;
        }
        const instancia = new FilmAffinity(url, i, formato);
        await instancia.parsearDocumento();
        return instancia;
    }

    private async parsearDocumento() {
        try {
            const f = await fetch(this.url);
            const t = await f.text();
            this.doc = new DOMParser().parseFromString(t, "text/html");
        } catch (error) {
            this.error = `error crítico parseando el documento: ${error}`;
        }
    }

    private extraerTextoSelector(selector: string): string | null {
        if (this.doc == null) {
            return null;
        }
        const $elemento = this.doc.querySelector(selector);
        if ($elemento == null) {
            return null;
        }
        return $elemento.textContent.trim();
    }

    private extraerTextoSelectorAll(selector: string): string | null {
        const coleccion: string[] = [];
        if (this.doc == null) {
            return null;
        }
        const $coincidencias = this.doc.querySelectorAll(selector);
        for (const $c of $coincidencias) {
            coleccion.push($c.textContent.trim());
        }
        if (coleccion.length == 0) {
            return null;
        }
        return coleccion.join(", ");
    }

    private extraerAtributoSelector(
        selector: string,
        atributo: string,
    ): string | null {
        if (this.doc == null) {
            return null;
        }
        const $elemento = this.doc.querySelector(selector);
        if ($elemento == null) {
            return null;
        }
        const atr = $elemento.getAttribute(atributo);
        if (atr == null) {
            return null;
        }
        return atr.trim();
    }

    recuperarTitulo(): string | null {
        return this.extraerTextoSelector(`h1#main-title span[itemprop="name"]`);
    }

    recuperarTipo(): string | null {
        return this.extraerTextoSelector(`h1#main-title span.movie-type`);
    }

    recuperarAño(): string | null {
        return this.extraerTextoSelector(
            `dl.movie-info dd[itemprop="datePublished"]`,
        );
    }

    recuperarDireccion(): string | null {
        return this.extraerTextoSelectorAll(
            `dl.movie-info .directors span[itemprop="name"]`,
        );
    }

    recuperarReparto(): string | null {
        return this.extraerTextoSelectorAll(`dl.movie-info .credits .nb a`);
    }

    recuperarGeneros(): string | null {
        return this.extraerTextoSelectorAll(
            `dl.movie-info dd.card-genres span[itemprop="genre"] a`,
        );
    }

    recuperarSinopsis(): string | null {
        return this.extraerTextoSelector(
            `dl.movie-info dd[itemprop="description"]`,
        );
    }

    recuperarCalificacion(): string | null {
        return this.extraerTextoSelector(`#movie-rat-avg`);
    }

    recuperarNumeroVotos(): string | null {
        return this.extraerTextoSelector(
            `#movie-count-rat span[itemprop="ratingCount"]`,
        );
    }

    recuperarPoster(): string | null {
        return this.extraerAtributoSelector(
            `#movie-main-image-container img[itemprop="image"]`,
            "src",
        );
    }

    recuperarFilmAffinityId(): string | null {
        return this.extraerAtributoSelector(`#stream-wrapper`, "data-movie-id");
    }

    crearTituloIdentificativo(): string {
        const titulo = this.recuperarTitulo() ?? "";
        const año = this.recuperarAño() ?? "";
        const director = this.recuperarDireccion() ?? "";
        return `${titulo} (${año}) de ${director}`;
    }

    crearMensajeTelegram(): string {
        if (this.error != null) {
            return this.error;
        }
        const traduccion = Traduccion[this.idioma];
        const crearURL = (url: string | null, contenido: string): string => {
            if (url == null) {
                return "";
            }
            if (this.formato == "html") {
                return `<a href="${url}">${contenido}</a>`;
            } else {
                return `[URL=${url}]${contenido}[/URL]`;
            }
        };
        const crearImg = (url: string | null): string => {
            if (url == null) {
                return ""
            }
            return `[IMG]${url}[/IMG]\n`;

        }
        const formatearParrafo = (
            icono: string,
            traduccion: string | null,
            dato: string | null,
        ) => {
            if (dato == null) {
                return "";
            }
            let traduccionFormateada = "";
            if (traduccion) {
                if (this.formato == "html") {
                    traduccionFormateada = `<strong>${traduccion}</strong>: `;
                } else {
                    traduccionFormateada = `[b]${traduccion}[/b]: `;
                }
            }

            return `${icono} ${traduccionFormateada} ${dato}`;
        };
        let poster = ""
        if (this.formato == "html") {
            poster = crearURL(this.recuperarPoster(), "&#8205;");
        } else {
            poster = crearImg(this.recuperarPoster())
        }
        const titulo = formatearParrafo("🎞", traduccion.Titulo, this.recuperarTitulo());
        const año = formatearParrafo("📅", traduccion.Año, this.recuperarAño());
        const generos = formatearParrafo(
            "🏷️",
            traduccion.Generos,
            this.recuperarGeneros(),
        );

        let calificacion = formatearParrafo(
            "⭐",
            traduccion.Calificación,
            this.recuperarCalificacion(),
        );
        const votos = this.recuperarNumeroVotos();
        if (calificacion != "" && votos != null) {
            calificacion += ` (${votos} ${traduccion.Votos})`;
        }
        const directores = formatearParrafo(
            "🎬",
            traduccion.Director,
            this.recuperarDireccion(),
        );
        const reparto = formatearParrafo(
            "🎭",
            traduccion.Reparto,
            this.recuperarReparto(),
        );
        const sinopsis = formatearParrafo(
            "📝",
            traduccion.Sinopsis,
            this.recuperarSinopsis(),
        );
        const ficha = crearURL(this.url, `🔗 ${traduccion.FichaCompleta}`);

        const mensaje = [
            poster,
            titulo,
            "\n",
            año,
            "\n",
            generos,
            "\n",
            calificacion,
            "\n",
            directores,
            "\n",
            reparto,
            "\n\n",
            sinopsis,
            "\n\n",
            ficha,
        ];

        return mensaje.join("");
    }
}

async function responderStart(solicitud: any) {
    const mensaje = `🎬 ¡Hola, cinéfilo! 🎬

¿Te gustaría compartir una ficha de película o serie de FilmAffinity? ¡Estoy aquí para ayudarte! 😊

Solo tienes que usar uno de estos comandos seguido del término que deseas buscar:
- /mensaje {mi_búsqueda}
- /message {mi_búsqueda}
- /foro {mi_búsqueda}
- /forum {mi_búsqueda}

Luego, selecciona la coincidencia en FilmAffinity para obtener la ficha correspondiente 🔍

📝 Detalles de los comandos:
- /mensaje y /message: devolverán la ficha (español/inglés) como un mensaje de Telegram, ideal para reenviar o copiar y pegar.
- /foro y /forum: devolverán la ficha (español/inglés) en formato BBCODE, idóneo para usar en foros.

¡Recuerda! Solo responderé a los comandos mencionados que tengan algún término de búsqueda 🤖

Visita este <a href="https://github.com/antikorps/filmaffinity_ficha_telegram_bot">repositorio</a> si quieres ver cómo funciono ⚙️⚙️⚙️`;
    const solicitudMensaje = {
        chat_id: solicitud.message.from.id,
        text: mensaje,
        parse_mode: "html",
        link_preview_options: {
            is_disabled: true
        }
    };

    await enviarMensajeTelegram(solicitudMensaje, "sendMessage");
}

async function enviarMensajeTelegram(solicitud: any, endpoint: string) {
    try {
        const response = await fetch(`${telegramBaseUrl}/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(solicitud),
        });

        if (!response.ok) {
            console.error(
                "Error enviando mensaje a Telegram:",
                await response.text(),
            );
        }
    } catch (error) {
        console.error("Error al enviar mensaje a Telegram:", error);
    }
}

async function analizarPaginaModoInline(
    url: string,
): Promise<InlineModeSolicitud | null> {
    const fa = await FilmAffinity.crear(url, "es", "html");
    return {
        type: "article",
        id: fa.recuperarFilmAffinityId() ?? Date.now().toString(),
        title: fa.crearTituloIdentificativo(),
        description: fa.recuperarSinopsis() ?? "",
        thumb_url: fa.recuperarPoster() ?? "",
        input_message_content: {
            message_text: fa.crearMensajeTelegram(),
            parse_mode: "HTML",
            link_preview_options: {
                show_above_text: true,
                prefer_large_media: true,
            },
        },
    };
}

interface DataRespuestaFA {
    id: string;
    descriptor: string;
}

async function realizarBusquedaFilmAffinity(
    idioma: string,
    busqueda: string,
): Promise<DataRespuestaFA[] | null> {
    const f = await fetch(
        `https://www.filmaffinity.com/${idioma}/search-ac2.w2.ajax.php?action=searchTerm`,
        {
            "headers": {
                "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0",
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "Accept-Language": "es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                "Pragma": "no-cache",
                "Cache-Control": "no-cache",
            },
            "referrer": "https://www.filmaffinity.com/es/main.html",
            "body": new URLSearchParams({
                "dataType": "json",
                "term": busqueda,
            }),
            "method": "POST",
        },
    );
    const r = await f.json();
    if (r.results.movies == null) {
        return null;
    }

    const dataRespuestaFA: DataRespuestaFA[] = [];
    for (const [indice, resultado] of r.results.movies.entries()) {
        if (indice == 5) {
            break;
        }

        if (resultado.id == null) {
            continue;
        }
        const resultadoDoc = new DOMParser().parseFromString(
            resultado.label,
            "text/html",
        );
        const titulo = resultadoDoc.querySelector(".title")?.textContent ?? "";
        const director = resultadoDoc.querySelector(".director")?.textContent
            ?? "";
        dataRespuestaFA.push({
            id: resultado.id,
            descriptor: `${titulo} de ${director}`,
        });
    }
    return dataRespuestaFA;
}

async function manejarModoInline(solicitud: any) {
    const inlineQuery = solicitud.inline_query;
    if (inlineQuery == null) {
        return;
    }
    const busqueda = inlineQuery.query;

    const dataRespuestaFA = await realizarBusquedaFilmAffinity("es", busqueda);
    if (dataRespuestaFA == null) {
        return;
    }

    const promesas: Promise<InlineModeSolicitud | null>[] = [];
    for (const data of dataRespuestaFA) {
        promesas.push(
            analizarPaginaModoInline(
                `https://www.filmaffinity.com/es/film${data.id}.html`,
            ),
        );
    }
    const peliculas = await Promise.all(promesas);
    const resultados: InlineModeSolicitud[] = [];
    for (const pelicula of peliculas) {
        if (pelicula == null) {
            continue;
        }
        resultados.push(pelicula);
    }

    enviarMensajeTelegram({
        inline_query_id: inlineQuery.id,
        results: resultados,
    }, "answerInlineQuery");
}

async function responderMensaje(
    chatId: number,
    dataRespuestaFA: DataRespuestaFA[],
    idioma: string,
    formato: string,
) {
    const inlineKeyboard = [];
    for (const data of dataRespuestaFA) {
        inlineKeyboard.push([{
            text: data.descriptor,
            callback_data: `${data.id}###${idioma}###${formato}`,
        }]);
    }
    const mensaje = {
        chat_id: chatId,
        text: `He encontrado las siguientes coincidencias. Si no es una de ellas intenta una búsqueda más específica.`,
        reply_markup: {
            inline_keyboard: inlineKeyboard,
        },
    };

    await enviarMensajeTelegram(mensaje, "sendMessage");
}

async function manejarCallbackQuery(solicitud: any) {
    const data = solicitud.callback_query.data;
    const [id, idioma, formato] = data.split("###");

    const fa = await FilmAffinity.crear(
        `https://www.filmaffinity.com/${idioma}/film${id}.html`,
        idioma,
        formato,
    );
    let parse_mode = "";
    if (formato == "html") {
        parse_mode = "html"
    }
    const mensaje = {
        chat_id: solicitud.callback_query.message.chat.id,
        text: fa.crearMensajeTelegram(),
        parse_mode: parse_mode
    };
    await enviarMensajeTelegram(mensaje, "sendMessage");
}

function parsearComando(cadena: string): Comandos | null {
    switch (cadena) {
        case "/start":
            return Comandos.Start;
        case "/mensaje":
            return Comandos.Mensaje;
        case "/foro":
            return Comandos.Foro;
        case "/forum":
            return Comandos.Forum;
        default:
            return null;
    }
}

const telegramApiKey = Deno.env.get("TG_BOT_FILMAFFINITY");
const telegramBaseUrl = `https://api.telegram.org/bot${telegramApiKey}`;

export default async function (req: Request): Promise<Response> {
    try {
        const cuerpo = await req.text();
        const solicitud = JSON.parse(cuerpo);
        console.log(solicitud);
        

        // INLINE
        if (solicitud.inline_query != null) {
            await manejarModoInline(solicitud);
            return new Response("ok", { status: 200 });
        }

        // CALLBACK
        if (solicitud.callback_query != null) {
            await manejarCallbackQuery(solicitud);
            return new Response("ok", { status: 200 });
        }

        if (solicitud.message.via_bot != null) {
            return new Response("ok", { status: 200 });
        }

        // Solo se van a gestionar mensajes de texto
        const texto: string | null = solicitud.message.text;
        if (texto == null) {
            return new Response("ok", { status: 200 });
        }

        // GESTIÓN COMANDO
        let comando = "";
        let argumento = "";

        if (
            solicitud.message != null && solicitud.message.entities != null
            && Array.isArray(solicitud.message.entities)
        ) {
            const entidades: TelegramEntidad[] = solicitud.message.entities;
            for (const entidad of entidades) {
                if (entidad.offset == 0 && entidad.type == "bot_command") {
                    comando = texto.substring(entidad.offset, entidad.length)
                        .trim();
                    argumento = texto.substring(entidad.length, texto.length)
                        .trim();
                }
            }
        }

        if (comando == "") {
            // Solo respondo a comandos
            await responderStart(solicitud)
            return new Response("ok", { status: 200 });
        }

        const c = parsearComando(comando);
        switch (c) {
            case Comandos.Start:
                await responderStart(solicitud);
                break;

            case Comandos.Mensaje: {
                const dataRespuestaFA = await realizarBusquedaFilmAffinity(
                    "es",
                    argumento,
                );
                if (dataRespuestaFA == null) {
                    return new Response("ok", { status: 200 });
                }
                await responderMensaje(
                    solicitud.message.from.id,
                    dataRespuestaFA,
                    "es",
                    "html",
                );
                break;
            }

            case Comandos.Foro: {
                const dataRespuestaFA = await realizarBusquedaFilmAffinity(
                    "es",
                    argumento,
                );
                if (dataRespuestaFA == null) {
                    return new Response("ok", { status: 200 });
                }
                await responderMensaje(
                    solicitud.message.from.id,
                    dataRespuestaFA,
                    "es",
                    "bbcode",
                );
                break;
            }

            case Comandos.Message: {
                const dataRespuestaFA = await realizarBusquedaFilmAffinity(
                    "en",
                    argumento,
                );
                if (dataRespuestaFA == null) {
                    return new Response("ok", { status: 200 });
                }
                await responderMensaje(
                    solicitud.message.from.id,
                    dataRespuestaFA,
                    "en",
                    "html",
                );
                break;
            }

            case Comandos.Forum: {
                const dataRespuestaFA = await realizarBusquedaFilmAffinity(
                    "en",
                    argumento,
                );
                if (dataRespuestaFA == null) {
                    return new Response("ok", { status: 200 });
                }
                await responderMensaje(
                    solicitud.message.from.id,
                    dataRespuestaFA,
                    "en",
                    "bbcode",
                );
                break;
            }

            default:
                return new Response("ok", { status: 200 });
        }
    } catch (error) {
        console.log(error);
    }

    return new Response("ok", { status: 200 });
}
