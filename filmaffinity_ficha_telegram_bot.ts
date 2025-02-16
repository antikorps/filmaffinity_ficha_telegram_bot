import { DOMParser, Element } from "jsr:@b-fuze/deno-dom";

interface DetallesPelicula {
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

async function consultarPelicula(filmaffinityId: string): Promise<DetallesPelicula | null> {
  try {
    const endpointFA = `https://www.filmaffinity.com/es/film${filmaffinityId}.html`;
    const f = await fetch(endpointFA, {
      "headers": {
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Priority": "u=0, i",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
      },
      "method": "GET",
    });

    const paginaFA = await f.text();
    const doc = new DOMParser().parseFromString(paginaFA, "text/html");

    const $titulo = doc.querySelector(`span[itemprop="name"]`);
    if ($titulo == null) {
      return null;
    }
    const titulo = $titulo.textContent.trim();
    const $año = doc.querySelector(`dd[itemprop="datePublished"]`);
    const año = $año?.textContent.trim() ?? "";
    const generos: string[] = [];
    const $generos = doc.querySelectorAll(`dd[class="card-genres"] span`);
    for (const $genero of $generos) {
      generos.push($genero.textContent.trim());
    }
    const $puntuacion = doc.querySelector("#movie-rat-avg");
    const puntuacion = $puntuacion?.textContent.trim() ?? "";
    const directores: string[] = [];
    const $directores = doc.querySelectorAll("dd.directors .credits span");
    for (const $director of $directores) {
      directores.push($director.textContent.trim());
    }
    const reparto: string[] = [];
    const $reparto = doc.querySelectorAll(`dd.card-genres span`);
    for (const $r of $reparto) {
      reparto.push($r.textContent.trim());
    }
    const $sinopsis = doc.querySelector(`dd[itemprop="description"]`);
    const sinopsis = $sinopsis?.textContent.trim() ?? "";

    const $poster = doc.querySelector(`img[itemprop="image"]`);
    const poster = $poster?.getAttribute("src") ?? "";

    const resumenTitulo = `${titulo} de ${directores[0]} (${año})`;
    const resumenDescripcion = sinopsis.length > 25 ? `${sinopsis.slice(0, 25)}...` : sinopsis;

    const mensajeFinal = `<a href="${poster}">&#8205;</a>🎞 ${titulo}
📅 <strong>Año</strong>: ${año}
🏷️ <strong>Géneros</strong>: ${generos.join(", ")}
⭐ <strong>Puntuación</strong>: ${puntuacion}
🎬 <strong>Director</strong>: ${directores.join(", ")}
🎭 <strong>Reparto</strong>: ${reparto.join(", ")}
   
📝 <strong>Sinopsis</strong>: ${sinopsis}
   
<a href="${endpointFA}">🔗 Ver ficha completa</a>`;

    return {
      type: "article",
      id: filmaffinityId,
      title: resumenTitulo,
      description: resumenDescripcion,
      thumb_url: poster,
      input_message_content: {
        message_text: mensajeFinal,
        parse_mode: "HTML",
        link_preview_options: {
          show_above_text: true,
          prefer_large_media: true,
        },
      },
    };
  }
  catch (error) {
    console.log(error);
    return null;
  }
}

export default async function(req: Request): Promise<Response> {
  try {
    const texto = await req.text();
    const solicitud = JSON.parse(texto);
    console.log(solicitud);

    const inlineQuery = solicitud.inline_query;
    if (inlineQuery == null) {
      return new Response("sin inline query", { status: 400 });
    }
    const busqueda = inlineQuery.query;

    const f = await fetch("https://www.filmaffinity.com/es/search-ac2.w2.ajax.php?action=searchTerm", {
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
    });

    const r = await f.json();
    if (r.results.movies == null) {
      return new Response("sin resultados", { status: 200 });
    }

    const promesas: Promise<DetallesPelicula | null>[] = [];
    for (const [indice, resultado] of r.results.movies.entries()) {
      if (indice == 5) {
        break;
      }

      if (resultado.id == null) {
        continue;
      }
      promesas.push(consultarPelicula(resultado.id));
    }

    const peliculas = await Promise.all(promesas);
    const resultados: any = [];
    for (const pelicula of peliculas) {
      if (pelicula == null) {
        continue;
      }
      resultados.push(pelicula);
    }

    const telegramApiKey = Deno.env.get("TG_BOT_FILMAFFINITY");
    const telegramApiUrl = `https://api.telegram.org/bot${telegramApiKey}/answerInlineQuery`;

    await fetch(telegramApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inline_query_id: inlineQuery.id,
        results: resultados,
      }),
    });
  }
  catch (error) {
    console.log(`error:${error}`);
  }
  return new Response("ok", { status: 200 });
}
