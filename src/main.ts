interface FeedItem {
  title: string;
  link: string;
  imageUrl: string;
  pubDate: string; 
}

const feeds: string[] = [
  "https://www.meneame.net/rss",
  "https://killbait.com/feed-es.php",
  "https://tardigram.com/rss",
  "https://www.mediatize.info/rss"
];


const default_images: string[] = [
  "https://www.meneame.net/img/mnm/logo.svg",
  "https://killbait.com/assets/images/logo/5.png",
  "https://tardigram.com/media/cache/resolve/post_thumb/2d/07/2d07bae7d94ca622e9ec3584a8dd3b10ba33677a2338ddd2bc7db6907860ff0e.jpg",
  "https://www.mediatize.info/v_78/img/mdtz/logo.svg"
];

function extractImageFromDescription(description: string): string {
  const imgMatch = description.match(/<img\s+src=['"]([^'"]+)['"]/);
  return imgMatch ? imgMatch[1] : "";
}

async function getFirstItem(feedUrl: string, useDescriptionForImage = false): Promise<FeedItem | null> {
  try {
    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(feedUrl)}`);
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "application/xml");

    const item = xml.querySelector("item");
    if (!item) return null;

    const title = item.querySelector("title")?.textContent ?? "";
    const link = item.querySelector("link")?.textContent ?? "";

    // Imagen
    let imageUrl = "";
    const media = item.querySelector("media\\:content, enclosure") as Element | null;
    if (media) imageUrl = media.getAttribute("url") ?? "";

    if (!imageUrl && useDescriptionForImage) {
      const description = item.querySelector("description")?.textContent ?? "";
      const match = description.match(/<img[^>]+src=['"]([^'"]+)['"]/);
      if (match) imageUrl = match[1];
    }

    // Fecha
    const pubDateRaw = item.querySelector("pubDate")?.textContent ?? "";
    const pubDateObj = pubDateRaw ? new Date(pubDateRaw) : null;
    const pubDate = pubDateObj ? formatDate(pubDateObj) : "";

    return { title, link, imageUrl, pubDate };
  } catch (error) {
    console.error("Error cargando feed:", feedUrl, error);
    return null;
  }
}


function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}


async function loadFeeds() {
  try {

    const loading = document.getElementById("loading-container");
    if (loading) loading.style.display = "block"; // mostrar spinner
    
    // Leer feeds.txt
    const feedsTxt = await fetch("feeds.txt").then(res => res.text());
    const lines = feedsTxt.split("\n").map(line => line.trim()).filter(line => line);

    // Mapear feeds a objetos { title, url, defaultImage }
    const feedsWithImages = lines.map(line => {
      const [title, url, defaultImage] = line.split(",");
      return { title, url, defaultImage };
    });

    // Contenedor donde se generarán los feeds
    const container = document.getElementById("feeds-container");
    if (!container) return;

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
    const descriptionImageFlags = feedsWithImages.map(feed =>
      feed.url.includes("meneame") || feed.url.includes("mediatize")
    );

    // Obtener items
    const items = await Promise.all(
      feedsWithImages.map((feed, idx) => getFirstItem(feed.url, descriptionImageFlags[idx]))
    );

    // Actualizar contenido de cada feed
    items.forEach((feedItem, index) => {
      if (!feedItem) return;

      const container = document.querySelector(`.portfolio-item[data-feed="${index}"]`);
      if (!container) return;

      const linkEl = container.querySelector("a") as HTMLAnchorElement;
      const imgEl = container.querySelector("img") as HTMLImageElement;
      const titleEl = container.querySelector("p a") as HTMLAnchorElement;
      const pubDateEl = container.querySelector("p.pubdate") as HTMLParagraphElement;

      const finalImage = feedItem.imageUrl || feedsWithImages[index].defaultImage ;

      if (linkEl) linkEl.href = feedItem.link;
      if (imgEl) imgEl.src = finalImage;
      if (titleEl) {
        titleEl.textContent = feedItem.title;
        titleEl.href = feedItem.link;
      }
      if (pubDateEl) pubDateEl.textContent = feedItem.pubDate;
    });

    // Ocultar spinner una vez cargados los feeds
    if (loading) loading.style.display = "none";
    container.style.display = "block";

  } catch (error) {
    console.error("Error leyendo feeds.txt o actualizando DOM:", error);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  loadFeeds();

  const dt = new Date();
  const footer = document.getElementById("getCurrentDate");
  if (footer) footer.textContent = dt.getFullYear().toString();
});

let refreshIntervalId: number | undefined;

function startAutoRefresh(intervalMs: number) {
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
  if (footer) footer.textContent = dt.getFullYear().toString();

  const select = document.getElementById("refreshSelect") as HTMLSelectElement;
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

