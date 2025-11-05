interface FeedItem {
  title: string;
  link: string;
  imageUrl: string;
  pubDate: string; 
}

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

    // Los de Reddit son Atom, por lo que lo tratamos así por el momento (TODO:meter campo en feeds.txt para indicar tipo)
    const isAtom = feedUrl.includes("reddit.com");

    let item: Element | null = null;

    if (isAtom) {
      // Para Atom, buscamos el primer <entry>
      item = xml.querySelector("entry");
    } else {
      // Si es RSS, buscamos el primer <item>
      item = xml.querySelector("item");
    }

    if (!item) {
      console.error("No se encontró el elemento <entry> o <item> en el feed.");
      return null;
    }

    const title = item.querySelector("title")?.textContent ?? "";

    // Para Atom (Reddit), revisamos todos los enlaces posibles
    let link = "";
    if (isAtom) {
        link = item.querySelector("link")?.getAttribute("href") ?? "";
        
    } else {
      // En RSS normal, buscamos el primer <link>
      link = item.querySelector("link")?.textContent ?? "";
      console.log("Link de RSS:", link);  // Log de RSS
    }


    // Imagen
    let imageUrl = "";
    if (isAtom) {
      // En Atom, la imagen puede estar en el contenido de la entrada (<content>)
      const content = item.querySelector("content")?.textContent ?? "";
      const imgMatch = content.match(/<img[^>]+src=['"]([^'"]+)['"]/);
      if (imgMatch) imageUrl = imgMatch[1];
    } else {
      // En RSS, buscamos la imagen en <media:content> o <enclosure>
      const media = item.querySelector("media\\:content, enclosure") as Element | null;
      if (media) imageUrl = media.getAttribute("url") ?? "";
    }

    // Si no encontramos una imagen, tratamos de obtenerla desde la descripción (si está habilitado)
    if (!imageUrl && useDescriptionForImage) {
      const description = item.querySelector("description")?.textContent ?? "";
      const match = description.match(/<img[^>]+src=['"]([^'"]+)['"]/);
      if (match) imageUrl = match[1];
    }

    // Fecha de publicación
    let pubDate = "";
    if (isAtom) {
      const updatedRaw = item.querySelector("updated")?.textContent ?? "";
      if (updatedRaw) {
        const updatedDate = new Date(updatedRaw);
        pubDate = formatDate(updatedDate);  // Asumiendo que formatDate es una función que convierte la fecha
      }
    } else {
      // En RSS, usamos <pubDate> si está disponible
      const pubDateRaw = item.querySelector("pubDate")?.textContent ?? "";
      const pubDateObj = pubDateRaw ? new Date(pubDateRaw) : null;
      pubDate = pubDateObj ? formatDate(pubDateObj) : "";
    }

    if (link) {
      try {
        const urlObj = new URL(link);
        const host = urlObj.host;
    
        const storedDataJson = localStorage.getItem("feedsHistory");
        let storedData: Array<{ link: string, host: string, title: string, imageUrl: string, pubDate: string }> = storedDataJson ? JSON.parse(storedDataJson) : [];
    
        const exists = storedData.some(item => item.link === link);
    
        if (!exists) {

          if (!imageUrl) {
            const feedsTxt = await fetch("feeds.txt").then(res => res.text());
            const lines = feedsTxt.split("\n").map(line => line.trim()).filter(line => line);
            const feedDefault = lines.find(line => line.includes(feedUrl));
            if (feedDefault) {
              const parts = feedDefault.split(",");
              imageUrl = parts[2] || ""; // la tercera columna es la imagen por defecto
            }
          }

          storedData.push({ host, title, link, imageUrl, pubDate });
          localStorage.setItem("feedsHistory", JSON.stringify(storedData));
        }
      } catch (err) {
        console.error("Error guardando feedsHistory en localStorage:", err);
      }
    }

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
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


async function loadFeeds() {
  try {
    // Contenedor donde se generarán los feeds
    const container = document.getElementById("feeds-container");
    if (!container) return;

    container.style.display = "none";

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


 // Nueva funcionalidad 05/11/2025: Mostrar histórico:
 const h3El = container.querySelector("h3");
 if (h3El) {
   const emoji = h3El.textContent?.includes("🕒") ? h3El.querySelector("span") : null;
   let emojiEl: HTMLSpanElement;
   if (!emoji) {
     emojiEl = document.createElement("span");
     emojiEl.style.cursor = "pointer";
     emojiEl.style.marginLeft = "5px";
     emojiEl.textContent = "🕒";
     h3El.appendChild(emojiEl);
   } else {
     emojiEl = emoji as HTMLSpanElement;
   }

   emojiEl.addEventListener("click", () => {
     const historyContainer = document.getElementById("history-container");
     if (!historyContainer) return;

     // Limpiar contenido previo
     historyContainer.innerHTML = "";

     try {
       const storedDataJson = localStorage.getItem("feedsHistory");
       let storedData: Array<{ link: string, host: string, title: string, imageUrl: string, pubDate: string }> = storedDataJson ? JSON.parse(storedDataJson) : [];

       const urlObj = new URL(feedItem.link);
       const host = urlObj.host;

       const filtered = storedData.filter(item => item.host === host);

       filtered.sort((a, b) => (a.pubDate < b.pubDate ? 1 : a.pubDate > b.pubDate ? -1 : 0));

       const table = document.createElement("table");
       table.style.width = "100%";
       table.style.borderCollapse = "collapse";

       filtered.forEach(item => {
         const tr = document.createElement("tr");
         tr.style.borderBottom = "1px solid #ccc";
         tr.style.padding = "5px";
         tr.style.paddingBottom = "10px";

         const tdImg = document.createElement("td");
         tdImg.style.width = "100px";
         const img = document.createElement("img");
         img.src = item.imageUrl;
         
         img.style.maxHeight = "100px";
         img.style.width = "100%";
         img.style.height = "100px";
         img.style.objectFit = "cover";
         img.style.borderRadius = "12px";
         img.style.display = "block";
         img.style.border = "1px solid #ddd";
         img.style.marginRight = "20px";
         
         tdImg.appendChild(img);

         const tdTitle = document.createElement("td");
         tdTitle.style.paddingLeft = "20px";
         const a = document.createElement("a");
         a.href = item.link;
         a.target = "_blank";
         a.style.fontSize = "17px";
         a.textContent = item.title;
         tdTitle.appendChild(a);

         const tdDate = document.createElement("td");
         tdDate.textContent = item.pubDate;

         tr.appendChild(tdImg);
         tr.appendChild(tdTitle);
         tr.appendChild(tdDate);

         table.appendChild(tr);
       });

       historyContainer.appendChild(table);
       historyContainer.style.display = "block"; 

       // Hacer scroll hacia el historial
       //historyContainer.scrollIntoView({ behavior: "smooth" });

     } catch (err) {
       console.error("Error mostrando historial:", err);
     }
   });
 }


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

