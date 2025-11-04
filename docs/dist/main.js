"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function extractImageFromDescription(description) {
    const imgMatch = description.match(/<img\s+src=['"]([^'"]+)['"]/);
    return imgMatch ? imgMatch[1] : "";
}
function getFirstItem(feedUrl_1) {
    return __awaiter(this, arguments, void 0, function* (feedUrl, useDescriptionForImage = false) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        try {
            const response = yield fetch(`https://corsproxy.io/?${encodeURIComponent(feedUrl)}`);
            const xmlText = yield response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, "application/xml");
            // Los de Reddit son Atom, por lo que lo tratamos así por el momento (TODO:meter campo en feeds.txt para indicar tipo)
            const isAtom = feedUrl.includes("reddit.com");
            let item = null;
            if (isAtom) {
                // Para Atom, buscamos el primer <entry>
                item = xml.querySelector("entry");
            }
            else {
                // Si es RSS, buscamos el primer <item>
                item = xml.querySelector("item");
            }
            if (!item) {
                console.error("No se encontró el elemento <entry> o <item> en el feed.");
                return null;
            }
            const title = (_b = (_a = item.querySelector("title")) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : "";
            // Para Atom (Reddit), revisamos todos los enlaces posibles
            let link = "";
            if (isAtom) {
                link = (_d = (_c = item.querySelector("link")) === null || _c === void 0 ? void 0 : _c.getAttribute("href")) !== null && _d !== void 0 ? _d : "";
            }
            else {
                // En RSS normal, buscamos el primer <link>
                link = (_f = (_e = item.querySelector("link")) === null || _e === void 0 ? void 0 : _e.textContent) !== null && _f !== void 0 ? _f : "";
                console.log("Link de RSS:", link); // Log de RSS
            }
            // Imagen
            let imageUrl = "";
            if (isAtom) {
                // En Atom, la imagen puede estar en el contenido de la entrada (<content>)
                const content = (_h = (_g = item.querySelector("content")) === null || _g === void 0 ? void 0 : _g.textContent) !== null && _h !== void 0 ? _h : "";
                const imgMatch = content.match(/<img[^>]+src=['"]([^'"]+)['"]/);
                if (imgMatch)
                    imageUrl = imgMatch[1];
            }
            else {
                // En RSS, buscamos la imagen en <media:content> o <enclosure>
                const media = item.querySelector("media\\:content, enclosure");
                if (media)
                    imageUrl = (_j = media.getAttribute("url")) !== null && _j !== void 0 ? _j : "";
            }
            // Si no encontramos una imagen, tratamos de obtenerla desde la descripción (si está habilitado)
            if (!imageUrl && useDescriptionForImage) {
                const description = (_l = (_k = item.querySelector("description")) === null || _k === void 0 ? void 0 : _k.textContent) !== null && _l !== void 0 ? _l : "";
                const match = description.match(/<img[^>]+src=['"]([^'"]+)['"]/);
                if (match)
                    imageUrl = match[1];
            }
            // Fecha
            const pubDateRaw = (_o = (_m = item.querySelector("pubDate")) === null || _m === void 0 ? void 0 : _m.textContent) !== null && _o !== void 0 ? _o : "";
            const pubDateObj = pubDateRaw ? new Date(pubDateRaw) : null;
            const pubDate = pubDateObj ? formatDate(pubDateObj) : "";
            return { title, link, imageUrl, pubDate };
        }
        catch (error) {
            console.error("Error cargando feed:", feedUrl, error);
            return null;
        }
    });
}
function formatDate(date) {
    const pad = (n) => n.toString().padStart(2, "0");
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}
function loadFeeds() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Contenedor donde se generarán los feeds
            const container = document.getElementById("feeds-container");
            if (!container)
                return;
            container.style.display = "none";
            const loading = document.getElementById("loading-container");
            if (loading)
                loading.style.display = "block"; // mostrar spinner
            // Leer feeds.txt
            const feedsTxt = yield fetch("feeds.txt").then(res => res.text());
            const lines = feedsTxt.split("\n").map(line => line.trim()).filter(line => line);
            // Mapear feeds a objetos { title, url, defaultImage }
            const feedsWithImages = lines.map(line => {
                const [title, url, defaultImage] = line.split(",");
                return { title, url, defaultImage };
            });
            // Limpiar solo este contenedor
            container.innerHTML = "";
            const itemsPerRow = 3;
            for (let i = 0; i < feedsWithImages.length; i += itemsPerRow) {
                const rowDiv = document.createElement("div");
                rowDiv.className = "row";
                for (let j = i; j < i + itemsPerRow && j < feedsWithImages.length; j++) {
                    const feed = feedsWithImages[j];
                    const colDiv = document.createElement("div");
                    colDiv.className = "col-md-4 portfolio-item";
                    colDiv.setAttribute("data-feed", String(j));
                    colDiv.innerHTML = `
          <a target="_blank" href="#"><img class="img-responsive" src="#"></a>
          <h3>${feed.title}</h3>
          <p><a target="_blank" href="##">Título</a></p>
          <p class="pubdate"></p>
        `;
                    rowDiv.appendChild(colDiv);
                }
                container.appendChild(rowDiv);
            }
            // Array para indicar si usar <description> para la imagen
            const descriptionImageFlags = feedsWithImages.map(feed => feed.url.includes("meneame") || feed.url.includes("mediatize"));
            // Obtener items
            const items = yield Promise.all(feedsWithImages.map((feed, idx) => getFirstItem(feed.url, descriptionImageFlags[idx])));
            // Actualizar contenido de cada feed
            items.forEach((feedItem, index) => {
                if (!feedItem)
                    return;
                const container = document.querySelector(`.portfolio-item[data-feed="${index}"]`);
                if (!container)
                    return;
                const linkEl = container.querySelector("a");
                const imgEl = container.querySelector("img");
                const titleEl = container.querySelector("p a");
                const pubDateEl = container.querySelector("p.pubdate");
                const finalImage = feedItem.imageUrl || feedsWithImages[index].defaultImage;
                if (linkEl)
                    linkEl.href = feedItem.link;
                if (imgEl)
                    imgEl.src = finalImage;
                if (titleEl) {
                    titleEl.textContent = feedItem.title;
                    titleEl.href = feedItem.link;
                }
                if (pubDateEl)
                    pubDateEl.textContent = feedItem.pubDate;
            });
            // Ocultar spinner una vez cargados los feeds
            if (loading)
                loading.style.display = "none";
            container.style.display = "block";
        }
        catch (error) {
            console.error("Error leyendo feeds.txt o actualizando DOM:", error);
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    loadFeeds();
    const dt = new Date();
    const footer = document.getElementById("getCurrentDate");
    if (footer)
        footer.textContent = dt.getFullYear().toString();
});
let refreshIntervalId;
function startAutoRefresh(intervalMs) {
    if (refreshIntervalId !== undefined) {
        clearInterval(refreshIntervalId);
    }
    if (intervalMs > 0) {
        refreshIntervalId = window.setInterval(() => {
            loadFeeds();
        }, intervalMs);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    loadFeeds();
    const dt = new Date();
    const footer = document.getElementById("getCurrentDate");
    if (footer)
        footer.textContent = dt.getFullYear().toString();
    const select = document.getElementById("refreshSelect");
    if (!select) {
        console.error("No se encontró el select de refresco");
        return;
    }
    // valor por defecto
    select.value = "300000"; // 5 minutos
    startAutoRefresh(Number(select.value));
    select.addEventListener("change", () => {
        startAutoRefresh(Number(select.value));
    });
});
