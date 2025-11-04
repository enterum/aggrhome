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
const feeds = [
    "https://www.meneame.net/rss",
    "https://killbait.com/feed-es.php",
    "https://tardigram.com/rss",
    "https://www.mediatize.info/rss"
];
const default_images = [
    "https://www.meneame.net/img/mnm/logo.svg",
    "https://killbait.com/assets/images/logo/5.png",
    "https://tardigram.com/media/cache/resolve/post_thumb/2d/07/2d07bae7d94ca622e9ec3584a8dd3b10ba33677a2338ddd2bc7db6907860ff0e.jpg",
    "https://www.mediatize.info/v_78/img/mdtz/logo.svg"
];
function extractImageFromDescription(description) {
    const imgMatch = description.match(/<img\s+src=['"]([^'"]+)['"]/);
    return imgMatch ? imgMatch[1] : "";
}
function getFirstItem(feedUrl_1) {
    return __awaiter(this, arguments, void 0, function* (feedUrl, useDescriptionForImage = false) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        try {
            const response = yield fetch(`https://corsproxy.io/?${encodeURIComponent(feedUrl)}`);
            const xmlText = yield response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, "application/xml");
            const item = xml.querySelector("item");
            if (!item)
                return null;
            const title = (_b = (_a = item.querySelector("title")) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : "";
            const link = (_d = (_c = item.querySelector("link")) === null || _c === void 0 ? void 0 : _c.textContent) !== null && _d !== void 0 ? _d : "";
            // Imagen
            let imageUrl = "";
            const media = item.querySelector("media\\:content, enclosure");
            if (media)
                imageUrl = (_e = media.getAttribute("url")) !== null && _e !== void 0 ? _e : "";
            if (!imageUrl && useDescriptionForImage) {
                const description = (_g = (_f = item.querySelector("description")) === null || _f === void 0 ? void 0 : _f.textContent) !== null && _g !== void 0 ? _g : "";
                const match = description.match(/<img[^>]+src=['"]([^'"]+)['"]/);
                if (match)
                    imageUrl = match[1];
            }
            // Fecha
            const pubDateRaw = (_j = (_h = item.querySelector("pubDate")) === null || _h === void 0 ? void 0 : _h.textContent) !== null && _j !== void 0 ? _j : "";
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
            // Contenedor donde se generarán los feeds
            const container = document.getElementById("feeds-container");
            if (!container)
                return;
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
