var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let allCategories = [];
let firstLoad = true;
function getFirstItem(feedUrl_1, type_1) {
    return __awaiter(this, arguments, void 0, function* (feedUrl, type, useDescriptionForImage = false) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        try {
            const response = yield fetchWithTimeout(`https://corsproxy.io/?${encodeURIComponent(feedUrl)}`, { cache: "no-store" });
            const isAtom = type === "atom";
            if (!response.ok) {
                if (response.status != 200) {
                    console.warn(`Feed ignorado por error ${response.status}: ${feedUrl}`);
                    return null;
                }
                throw new Error(`Error HTTP ${response.status}`);
            }
            const xmlText = yield response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, "application/xml");
            let item = isAtom ? xml.querySelector("entry") : xml.querySelector("item");
            if (!item)
                return null;
            const title = (_b = (_a = item.querySelector("title")) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : "";
            let link = isAtom ? (_d = (_c = item.querySelector("link")) === null || _c === void 0 ? void 0 : _c.getAttribute("href")) !== null && _d !== void 0 ? _d : "" : (_f = (_e = item.querySelector("link")) === null || _e === void 0 ? void 0 : _e.textContent) !== null && _f !== void 0 ? _f : "";
            let imageUrl = "";
            if (isAtom) {
                const content = (_h = (_g = item.querySelector("content")) === null || _g === void 0 ? void 0 : _g.textContent) !== null && _h !== void 0 ? _h : "";
                const imgMatch = content.match(/<img[^>]+src=['"]([^'"]+)['"]/);
                if (imgMatch)
                    imageUrl = imgMatch[1];
            }
            else {
                const media = item.querySelector("media\\:content, enclosure");
                if (media)
                    imageUrl = (_j = media.getAttribute("url")) !== null && _j !== void 0 ? _j : "";
            }
            if (!imageUrl && useDescriptionForImage) {
                const description = (_l = (_k = item.querySelector("description")) === null || _k === void 0 ? void 0 : _k.textContent) !== null && _l !== void 0 ? _l : "";
                const match = description.match(/<img[^>]+src=['"]([^'"]+)['"]/);
                if (match)
                    imageUrl = match[1];
            }
            let pubDate = "";
            if (isAtom) {
                const updatedRaw = (_o = (_m = item.querySelector("updated")) === null || _m === void 0 ? void 0 : _m.textContent) !== null && _o !== void 0 ? _o : "";
                if (updatedRaw)
                    pubDate = formatDate(new Date(updatedRaw));
            }
            else {
                const pubDateRaw = (_q = (_p = item.querySelector("pubDate")) === null || _p === void 0 ? void 0 : _p.textContent) !== null && _q !== void 0 ? _q : "";
                const pubDateObj = pubDateRaw ? new Date(pubDateRaw) : null;
                pubDate = pubDateObj ? formatDate(pubDateObj) : "";
            }
            console.log(JSON.stringify({ title, link, imageUrl, pubDate }));
            return { title, link, imageUrl, pubDate };
        }
        catch (error) {
            console.error("Error loading feed:", feedUrl, error);
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
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
function loadFeeds() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            // Contenedor donde se generarán los feeds
            const container = document.getElementById("feeds-container");
            if (!container)
                return;
            const selectedCategory = (_a = document.getElementById("categorySelect")) === null || _a === void 0 ? void 0 : _a.value;
            const selectedCountry = (_b = document.getElementById("countrySelect")) === null || _b === void 0 ? void 0 : _b.value;
            const selectedLanguage = (_c = document.getElementById("languageSelect")) === null || _c === void 0 ? void 0 : _c.value;
            container.style.display = "none";
            const loading = document.getElementById("loading-container");
            if (loading)
                loading.style.display = "block"; // mostrar spinner
            const feedsTxt = yield fetch("feeds.txt", { cache: "no-store" }).then(res => res.text());
            const lines = feedsTxt.split("\n").map(line => line.trim()).filter(line => line);
            let votesData = [];
            try {
                const votesResponse = yield fetch(`https://enterum.alwaysdata.net/getvotes.phpp?language=${encodeURIComponent(selectedLanguage)}&cat=${encodeURIComponent(selectedCategory)}&country=${encodeURIComponent(selectedCountry)}&nocache=` + Date.now(), {
                    cache: "no-store"
                });
                if (votesResponse.ok) {
                    votesData = yield votesResponse.json();
                }
                else {
                    console.warn("No se pudo obtener la lista de votos. Status:", votesResponse.status);
                }
            }
            catch (err) {
                console.error("Error getting votes:", err);
            }
            let feedsWithImages = lines.map(line => {
                const parts = line.split(",");
                const [title, url, defaultImage, type, useDescription, category, country, language] = parts;
                const feedVotes = votesData.find(v => v.feed.trim().toLowerCase() === title.trim().toLowerCase());
                return {
                    title: title === null || title === void 0 ? void 0 : title.trim(),
                    url: url === null || url === void 0 ? void 0 : url.trim(),
                    defaultImage: (defaultImage === null || defaultImage === void 0 ? void 0 : defaultImage.trim()) || "",
                    type: (type || "rss").trim().toLowerCase(),
                    useDescriptionForImage: (useDescription === null || useDescription === void 0 ? void 0 : useDescription.trim().toLowerCase()) === "true",
                    category: (category === null || category === void 0 ? void 0 : category.trim()) || "",
                    country: (country === null || country === void 0 ? void 0 : country.trim()) || "",
                    language: (language === null || language === void 0 ? void 0 : language.trim()) || "",
                    votes: feedVotes ? feedVotes.votes : 0
                };
            });
            feedsWithImages = feedsWithImages.filter(feed => {
                const matchCategory = !selectedCategory || feed.category === selectedCategory;
                const matchCountry = !selectedCountry || selectedCountry === "" || feed.country === selectedCountry;
                const matchLanguage = !selectedLanguage || feed.language === selectedLanguage;
                return matchCategory && matchCountry && matchLanguage;
            });
            if (!feedsWithImages || feedsWithImages.length === 0) {
                if (container) {
                    container.innerHTML = `<p style="text-align:center; font-weight:bold; margin-top:20px;">${t("noFeeds")}</p>`;
                    container.style.display = "block";
                }
                if (loading)
                    loading.style.display = "none"; // ocultar spinner
                return;
            }
            feedsWithImages.sort((a, b) => b.votes - a.votes);
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
        <h3>${feed.title} <span class="votes-count" style="font-size:14px; color:gray;">(${feed.votes} votos)</span></h3>
        <p><a target="_blank" href="##">...</a></p>
        <p class="pubdate"></p>
      `;
                    rowDiv.appendChild(colDiv);
                }
                container.appendChild(rowDiv);
            }
            const items = yield Promise.all(feedsWithImages.map(feed => getFirstItem(feed.url, feed.type, feed.useDescriptionForImage)));
            // Actualizar contenido de cada feed
            items.forEach((feedItem, index) => {
                var _a, _b;
                const container = document.querySelector(`.portfolio-item[data-feed="${index}"]`);
                if (!container)
                    return;
                if (!feedItem) {
                    const feed = feedsWithImages[index];
                    const linkEl = container.querySelector("a");
                    const imgEl = container.querySelector("img");
                    const titleEl = container.querySelector("p a");
                    const pubDateEl = container.querySelector("p.pubdate");
                    if (linkEl)
                        linkEl.href = "#";
                    if (imgEl)
                        imgEl.src = "http://enterum.github.io/aggrhome/img/carta-ajuste.png";
                    if (titleEl) {
                        titleEl.textContent = t("feedTechnicalIssues");
                        titleEl.href = "#";
                    }
                    if (pubDateEl)
                        pubDateEl.textContent = "";
                    const h3El = container.querySelector("h3");
                    if (h3El)
                        h3El.textContent = feed.title;
                    return;
                }
                const feed = feedsWithImages[index];
                const linkEl = container.querySelector("a");
                const imgEl = container.querySelector("img");
                const titleEl = container.querySelector("p a");
                const pubDateEl = container.querySelector("p.pubdate");
                validarImagen(feedItem.imageUrl).then(esValida => {
                    const finalImage = esValida ? feedItem.imageUrl : feed.defaultImage;
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
                const commentsToggle = document.createElement("a");
                commentsToggle.href = "#";
                commentsToggle.textContent = t("commentsToggle");
                commentsToggle.style.display = "inline-block";
                commentsToggle.style.marginTop = "10px";
                commentsToggle.style.cursor = "pointer";
                const commentsDiv = document.createElement("div");
                commentsDiv.style.display = "none";
                commentsDiv.style.height = "300px";
                commentsDiv.style.overflowY = "auto";
                commentsDiv.style.marginTop = "10px";
                commentsDiv.style.border = "1px solid #ccc";
                commentsDiv.style.padding = "10px";
                commentsDiv.style.borderRadius = "8px";
                const issueTerm = getCommentsIssueTerm(feed.title, feed.category, window.PAGE_LANG || "en");
                commentsToggle.addEventListener("click", (e) => {
                    e.preventDefault();
                    if (commentsDiv.style.display === "none") {
                        commentsDiv.style.display = "block";
                        // Solo insertar Utterances la primera vez
                        if (!commentsDiv.hasChildNodes()) {
                            const script = document.createElement("script");
                            script.src = "https://utteranc.es/client.js";
                            script.async = true;
                            script.setAttribute("repo", "enterum/feeds-comments");
                            script.setAttribute("issue-term", issueTerm);
                            script.setAttribute("theme", "github-light");
                            script.setAttribute("crossorigin", "anonymous");
                            commentsDiv.appendChild(script);
                        }
                    }
                    else {
                        commentsDiv.style.display = "none";
                    }
                });
                container.appendChild(commentsToggle);
                container.appendChild(commentsDiv);
                const h3El0 = container.querySelector("h3");
                if (h3El0) {
                    const voteBtn = document.createElement("span");
                    voteBtn.style.cursor = "pointer";
                    voteBtn.style.marginLeft = "10px";
                    voteBtn.title = t("voteThisFeed");
                    voteBtn.textContent = '👍';
                    h3El0.appendChild(voteBtn);
                    let votesSpan = h3El0.querySelector(".votes-count");
                    if (!votesSpan) {
                        votesSpan = document.createElement("span");
                        votesSpan.className = "votes-count";
                        votesSpan.style.fontSize = "14px";
                        votesSpan.style.color = "gray";
                        votesSpan.style.marginLeft = "5px";
                        votesSpan.textContent = `(${(_a = feed.votes) !== null && _a !== void 0 ? _a : 0} votos)`;
                        h3El0.appendChild(votesSpan);
                    }
                    voteBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                        try {
                            // Lanza reCAPTCHA y espera el token
                            const token = yield new Promise((resolve, reject) => {
                                if (!window.grecaptcha) {
                                    reject("reCAPTCHA not loaded");
                                    return;
                                }
                                window.grecaptcha.ready(() => {
                                    window.grecaptcha.execute("6LdP1BMsAAAAAPuXgNBE_5pJ2WQjc8VafD_A6IMw", { action: "vote" }).then((token) => {
                                        if (token)
                                            resolve(token);
                                        else
                                            reject("Not valid token fro reCAPTCHA");
                                    });
                                });
                            });
                            const language = document.getElementById("languageSelect").value;
                            const category = document.getElementById("categorySelect").value;
                            const country = document.getElementById("countrySelect").value;
                            const response = yield fetch('https://enterum.alwaysdata.net/vote.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: new URLSearchParams({
                                    feed: feed.title,
                                    language,
                                    cat: category,
                                    country,
                                    captchatoken: token
                                })
                            });
                            if (response.status === 429) {
                                Swal.fire({ icon: "warning", title: "Ups!", text: t("voteTooMany") });
                                return;
                            }
                            if (response.status === 409) {
                                Swal.fire({ icon: "info", title: "Ups!", text: t("voteDuplicate") });
                                return;
                            }
                            if (response.ok) {
                                const data = yield response.json();
                                if (data.success) {
                                    feed.votes = data.votes;
                                    votesSpan.textContent = `(${feed.votes} ${t("votes")})`;
                                    Swal.fire({ icon: "success", title: "OK!", text: t("voteThanks"), timer: 2000, showConfirmButton: false });
                                }
                                else {
                                    console.error(t("voteError"), data);
                                    Swal.fire({ icon: "error", title: "Ups!", text: t("voteError") });
                                }
                            }
                            else {
                                console.error(t("voteError") + " " + response.statusText);
                                Swal.fire({ icon: "error", title: "Ups!", text: t("voteError") + " " + response.status });
                            }
                        }
                        catch (err) {
                            console.error(t("voteError"), err);
                            Swal.fire({ icon: "error", title: "Ups!", text: t("voteError") });
                        }
                    }));
                }
                const h3El = container.querySelector("h3");
                if (h3El) {
                    const emoji = ((_b = h3El.textContent) === null || _b === void 0 ? void 0 : _b.includes("🕒")) ? h3El.querySelector("span") : null;
                    let emojiEl;
                    if (!emoji) {
                        emojiEl = document.createElement("span");
                        emojiEl.style.cursor = "pointer";
                        emojiEl.style.marginLeft = "5px";
                        emojiEl.textContent = "🕒";
                        emojiEl.title = t("viewHistory");
                        h3El.appendChild(emojiEl);
                    }
                    else {
                        emojiEl = emoji;
                    }
                    let emojiShare = h3El.querySelector(".share");
                    if (!emojiShare) {
                        emojiShare = document.createElement("span");
                        emojiShare.className = "share";
                        emojiShare.style.cursor = "pointer";
                        emojiShare.style.marginLeft = "5px";
                        emojiShare.textContent = "🔗";
                        emojiShare.title = t("sharethisnews");
                        h3El.appendChild(emojiShare);
                        emojiShare.addEventListener("click", () => {
                            if (!navigator.share) {
                                Swal.fire({
                                    icon: "warning",
                                    title: "Ups!",
                                    text: t("shareFailed"),
                                });
                                return;
                            }
                            navigator.share({
                                title: feed.title, // nombre del feed
                                text: feedItem.title, // titular de la noticia
                                url: feedItem.link, // url de la noticia
                            })
                                .then(() => console.log("shared!")) //lo vamos a dejar como aviso en la consola, no tiene mucho sentido sacar un Swal aquí
                                .catch((error) => Swal.fire({
                                icon: "error",
                                title: "Ups!",
                                text: t("shareError"),
                            }));
                        });
                    }
                    emojiEl.addEventListener("click", () => {
                        const historyContainer = document.getElementById("history-container");
                        if (!historyContainer)
                            return;
                        // Limpiar contenido previo
                        historyContainer.innerHTML = "";
                        try {
                            const storedDataJson = localStorage.getItem("feedsHistory");
                            let storedData = storedDataJson ? JSON.parse(storedDataJson) : [];
                            const urlObj = new URL(feedItem.link);
                            const host = urlObj.host;
                            const filtered = storedData.filter(item => item.host === host);
                            filtered.sort((a, b) => (a.pubDate < b.pubDate ? 1 : a.pubDate > b.pubDate ? -1 : 0));
                            const h3 = document.createElement("h3");
                            h3.textContent = t("historyTitle") + " " + feed.title + ":";
                            h3.style.textAlign = "center";
                            h3.style.marginBottom = "20px";
                            historyContainer.appendChild(h3);
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
                            const rect = historyContainer.getBoundingClientRect();
                            const scrollTop = window.scrollY + rect.top - 100;
                            window.scrollTo({ top: scrollTop, behavior: "smooth" });
                        }
                        catch (err) {
                            console.error("Error showing history:", err);
                        }
                    });
                }
            });
            if (loading)
                loading.style.display = "none";
            container.style.display = "block";
            saveHistorial(true, 5);
        }
        catch (error) {
            console.error("Error reading feeds.txt or updating DOM:", error);
        }
    });
}
function saveHistorial() {
    return __awaiter(this, arguments, void 0, function* (useDescriptionForImage = false, maxConcurrent = 5) {
        var _a, _b, _c;
        try {
            const selectedCategory = (_a = document.getElementById("categorySelect")) === null || _a === void 0 ? void 0 : _a.value;
            const selectedCountry = (_b = document.getElementById("countrySelect")) === null || _b === void 0 ? void 0 : _b.value;
            const selectedLanguage = (_c = document.getElementById("languageSelect")) === null || _c === void 0 ? void 0 : _c.value;
            const feedsTxt = yield fetch("feeds.txt", { cache: "no-store" }).then(res => res.text());
            const lines = feedsTxt.split("\n").map(line => line.trim()).filter(line => line && !line.startsWith("#"));
            const feeds = lines.map(line => {
                var _a, _b, _c, _d, _e;
                const parts = line.split(",");
                return {
                    title: (_a = parts[0]) === null || _a === void 0 ? void 0 : _a.trim(),
                    url: (_b = parts[1]) === null || _b === void 0 ? void 0 : _b.trim(),
                    defaultImage: ((_c = parts[2]) === null || _c === void 0 ? void 0 : _c.trim()) || "",
                    type: (((_d = parts[3]) === null || _d === void 0 ? void 0 : _d.trim()) || "rss").toLowerCase(),
                    useDescriptionForImage: (((_e = parts[4]) === null || _e === void 0 ? void 0 : _e.trim().toLowerCase()) === "true"),
                    category: parts[5],
                    country: parts[6],
                    language: parts[7]
                };
            });
            const storedDataJson = localStorage.getItem("feedsHistory");
            let storedData = storedDataJson ? JSON.parse(storedDataJson) : [];
            // Pool de concurrencia
            let active = 0;
            let index = 0;
            return new Promise((resolve) => {
                const next = () => __awaiter(this, void 0, void 0, function* () {
                    if (index >= feeds.length) {
                        if (active === 0) {
                            localStorage.setItem("feedsHistory", JSON.stringify(storedData));
                            resolve();
                        }
                        return;
                    }
                    while (active < maxConcurrent && index < feeds.length) {
                        const feed = feeds[index++];
                        active++;
                        (() => __awaiter(this, void 0, void 0, function* () {
                            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
                            try {
                                if (feed.language == selectedLanguage && feed.category === selectedCategory && (selectedCountry === "" || feed.country === selectedCountry)) {
                                    const response = yield fetchWithTimeout(`https://corsproxy.io/?${encodeURIComponent(feed.url)}`, { cache: "no-store" });
                                    const xmlText = yield response.text();
                                    const parser = new DOMParser();
                                    const xml = parser.parseFromString(xmlText, "application/xml");
                                    const isAtom = feed.type === "atom";
                                    const items = isAtom ? Array.from(xml.querySelectorAll("entry")) : Array.from(xml.querySelectorAll("item"));
                                    for (const item of items) {
                                        const title = (_b = (_a = item.querySelector("title")) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : "";
                                        let link = "";
                                        if (isAtom)
                                            link = (_d = (_c = item.querySelector("link")) === null || _c === void 0 ? void 0 : _c.getAttribute("href")) !== null && _d !== void 0 ? _d : "";
                                        else
                                            link = (_f = (_e = item.querySelector("link")) === null || _e === void 0 ? void 0 : _e.textContent) !== null && _f !== void 0 ? _f : "";
                                        if (!link)
                                            continue;
                                        let imageUrl = "";
                                        if (isAtom) {
                                            const content = (_h = (_g = item.querySelector("content")) === null || _g === void 0 ? void 0 : _g.textContent) !== null && _h !== void 0 ? _h : "";
                                            const imgMatch = content.match(/<img[^>]+src=['"]([^'"]+)['"]/);
                                            if (imgMatch)
                                                imageUrl = imgMatch[1];
                                        }
                                        else {
                                            const media = item.querySelector("media\\:content, enclosure");
                                            if (media)
                                                imageUrl = (_j = media.getAttribute("url")) !== null && _j !== void 0 ? _j : "";
                                        }
                                        if (!imageUrl && useDescriptionForImage) {
                                            const description = (_l = (_k = item.querySelector("description")) === null || _k === void 0 ? void 0 : _k.textContent) !== null && _l !== void 0 ? _l : "";
                                            const match = description.match(/<img[^>]+src=['"]([^'"]+)['"]/);
                                            if (match)
                                                imageUrl = match[1];
                                        }
                                        let pubDate = "";
                                        if (isAtom) {
                                            const updatedRaw = (_o = (_m = item.querySelector("updated")) === null || _m === void 0 ? void 0 : _m.textContent) !== null && _o !== void 0 ? _o : "";
                                            if (updatedRaw)
                                                pubDate = formatDate(new Date(updatedRaw));
                                        }
                                        else {
                                            const pubDateRaw = (_q = (_p = item.querySelector("pubDate")) === null || _p === void 0 ? void 0 : _p.textContent) !== null && _q !== void 0 ? _q : "";
                                            const pubDateObj = pubDateRaw ? new Date(pubDateRaw) : null;
                                            pubDate = pubDateObj ? formatDate(pubDateObj) : "";
                                        }
                                        try {
                                            const urlObj = new URL(link);
                                            const host = urlObj.host;
                                            const exists = storedData.some(i => i.link === link);
                                            if (exists)
                                                continue;
                                            const esValida = yield validarImagen(imageUrl);
                                            if (!esValida)
                                                imageUrl = feed.defaultImage || "";
                                            storedData.push({ host, title, link, imageUrl, pubDate, type: feed.type, fromDescription: feed.useDescriptionForImage });
                                        }
                                        catch (err) {
                                            console.error("Error saving item in localStorage:", err);
                                        }
                                    }
                                }
                            }
                            catch (err) {
                                console.error("Error processing feed:", feed.url, err);
                            }
                            finally {
                                active--;
                                next(); // Lanza la siguiente tarea
                            }
                        }))();
                    }
                });
                next();
            });
        }
        catch (err) {
            console.error("Error general in saveHistorial:", err);
        }
    });
}
export function validarImagen(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = `${url}?_=${Date.now()}`;
    });
}
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
    const PAGE_LANG = window.PAGE_LANG || "en";
    loadCategories().then(() => {
        const languageSelect = document.getElementById("languageSelect");
        if (languageSelect) {
            languageSelect.value = PAGE_LANG;
            // Deshabilita la opción correspondiente al idioma actual
            const option = languageSelect.querySelector(`#languageSelect option[value="${PAGE_LANG}"]`);
            if (option)
                option.disabled = true;
        }
    });
    const dt = new Date();
    const footer = document.getElementById("getCurrentDate");
    if (footer)
        footer.textContent = dt.getFullYear().toString();
    const select = document.getElementById("refreshSelect");
    if (select) {
        select.value = "300000"; // 5 minutos
        startAutoRefresh(Number(select.value));
        select.addEventListener("change", () => {
            startAutoRefresh(Number(select.value));
        });
    }
    else {
        console.error("No refresh select found");
    }
    const form = document.getElementById("addFeedForm");
    form.addEventListener("submit", (event) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        event.preventDefault();
        const submitBtn = document.getElementById("submitFeedBtn");
        submitBtn.disabled = true;
        try {
            const formData = new FormData(form);
            const response = yield fetch(form.action, {
                method: "POST",
                body: formData
            });
            const status = response.status;
            let json = null;
            if ((_a = response.headers.get("content-type")) === null || _a === void 0 ? void 0 : _a.includes("application/json")) {
                json = yield response.json();
            }
            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Ok!",
                    text: t("addFeedSuccess"),
                });
            }
            else {
                Swal.fire({
                    icon: "error",
                    title: "Ups!",
                    text: t("addFeedError"),
                });
            }
        }
        catch (error) {
            console.error(t("connectionError"), error);
            Swal.fire({
                icon: "error",
                title: "Ups!",
                text: t("connectionError"),
            });
        }
        finally {
            submitBtn.disabled = false;
        }
    }));
});
function fetchWithTimeout(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, options = {}, timeoutMs = 3000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = yield fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal }));
            return response;
        }
        finally {
            clearTimeout(id);
        }
    });
}
function loadCategories() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const PAGE_LANG = window.PAGE_LANG || "en";
            const response = yield fetch("categories.txt", { cache: "no-store" });
            const text = yield response.text();
            const lines = text
                .split("\n")
                .map(l => l.trim())
                .filter(l => l && !l.startsWith("#"));
            allCategories = lines.map(line => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                const parts = line.split("|");
                return {
                    code: ((_a = parts[0]) === null || _a === void 0 ? void 0 : _a.trim()) || "",
                    name: ((_b = parts[1]) === null || _b === void 0 ? void 0 : _b.trim()) || "",
                    description: ((_c = parts[2]) === null || _c === void 0 ? void 0 : _c.trim()) || "",
                    subdescription: ((_d = parts[3]) === null || _d === void 0 ? void 0 : _d.trim()) || "",
                    countryCode: ((_e = parts[4]) === null || _e === void 0 ? void 0 : _e.trim()) || "",
                    countryName: ((_f = parts[5]) === null || _f === void 0 ? void 0 : _f.trim()) || "",
                    languageCode: ((_g = parts[6]) === null || _g === void 0 ? void 0 : _g.trim()) || "",
                    languageName: ((_h = parts[7]) === null || _h === void 0 ? void 0 : _h.trim()) || ""
                };
            });
            const categorySelect = document.getElementById("categorySelect");
            const countrySelect = document.getElementById("countrySelect");
            const languageSelect = document.getElementById("languageSelect");
            if (!categorySelect || !countrySelect || !languageSelect)
                return;
            const languages = Array.from(new Map(allCategories.map(cat => [cat.languageCode, cat.languageName])));
            languages.sort((a, b) => a[1].localeCompare(b[1]));
            languageSelect.innerHTML = "";
            languages.forEach(([code, name]) => {
                const opt = document.createElement("option");
                opt.value = code;
                opt.textContent = name;
                languageSelect.appendChild(opt);
            });
            const { lang, country, cat } = getUrlParams();
            console.log("lang=[" + lang + "]");
            console.log("cat=[" + cat + "]");
            console.log("country=[" + country + "]");
            languageSelect.value = lang;
            localStorage.setItem("selectedLanguage", lang);
            const reloadCategoriesAndCountries = (selectedLang) => {
                var _a, _b;
                const filteredCategories = allCategories.filter(cat => cat.languageCode === selectedLang);
                const uniqueCategories = Array.from(new Map(filteredCategories.map(cat => [cat.code, cat])).values());
                uniqueCategories.sort((a, b) => a.name.localeCompare(b.name));
                categorySelect.innerHTML = "";
                uniqueCategories.forEach(cat => {
                    const opt = document.createElement("option");
                    opt.value = cat.code;
                    opt.textContent = cat.name;
                    categorySelect.appendChild(opt);
                });
                const selectedCategory = cat ||
                    localStorage.getItem("selectedCategory") ||
                    ((_a = uniqueCategories[0]) === null || _a === void 0 ? void 0 : _a.code) ||
                    "";
                categorySelect.value = selectedCategory;
                localStorage.setItem("selectedCategory", selectedCategory);
                const countriesMap = new Map();
                filteredCategories.forEach(cat => countriesMap.set(cat.countryCode, cat.countryName));
                countrySelect.innerHTML = "";
                const defaultOpt = document.createElement("option");
                defaultOpt.value = "";
                defaultOpt.textContent = t("allCountries");
                countrySelect.appendChild(defaultOpt);
                const countryList = Array.from(countriesMap.entries());
                countryList.sort((a, b) => a[1].localeCompare(b[1]));
                countriesMap.forEach((name, code) => {
                    const opt = document.createElement("option");
                    opt.value = code;
                    opt.textContent = name;
                    countrySelect.appendChild(opt);
                });
                let selectedCountry = "";
                if (country && country !== "") {
                    selectedCountry =
                        country ||
                            localStorage.getItem("selectedCountry") ||
                            ((_b = countrySelect.options[0]) === null || _b === void 0 ? void 0 : _b.value) ||
                            "";
                }
                countrySelect.value = selectedCountry;
                localStorage.setItem("selectedCountry", selectedCountry);
                updateCategoryHeader();
                if (!firstLoad) {
                    loadFeeds();
                }
            };
            reloadCategoriesAndCountries(lang);
            loadFeeds();
            firstLoad = false;
            updateCategoryHeader();
            languageSelect.addEventListener("change", () => {
                const selectedLang = languageSelect.value;
                const selectedCountry = ''; //porque puede no existir en otro idioma, así que ponemos "Todos los países"
                const selectedCategory = categorySelect.value;
                const targetUrl = `index-${selectedLang}.html?lang=${selectedLang}&country=${encodeURIComponent(selectedCountry)}&cat=${encodeURIComponent(selectedCategory)}`;
                window.location.href = targetUrl;
            });
            categorySelect.addEventListener("change", () => {
                const lang = languageSelect.value;
                const country = countrySelect.value;
                const cat = categorySelect.value;
                const newUrl = `?lang=${lang}&country=${encodeURIComponent(country)}&cat=${encodeURIComponent(cat)}`;
                history.replaceState(null, "", newUrl);
                localStorage.setItem("selectedCountry", countrySelect.value);
                localStorage.setItem("selectedCategory", categorySelect.value);
                updateCategoryHeader();
                loadFeeds();
            });
            countrySelect.addEventListener("change", () => {
                const lang = languageSelect.value;
                const country = countrySelect.value;
                const cat = categorySelect.value;
                const newUrl = `?lang=${lang}&country=${encodeURIComponent(country)}&cat=${encodeURIComponent(cat)}`;
                history.replaceState(null, "", newUrl);
                localStorage.setItem("selectedCountry", countrySelect.value);
                localStorage.setItem("selectedCategory", categorySelect.value);
                updateCategoryHeader();
                loadFeeds();
            });
        }
        catch (err) {
            console.error("Error loading categories.txt:", err);
        }
    });
}
function updateCategoryHeader() {
    var _a, _b;
    const selectedCategoryCode = (_a = document.getElementById("categorySelect")) === null || _a === void 0 ? void 0 : _a.value;
    if (!selectedCategoryCode)
        return;
    const selectedLanguageCode = (_b = document.getElementById("languageSelect")) === null || _b === void 0 ? void 0 : _b.value;
    if (!selectedLanguageCode)
        return;
    const category = allCategories.find(cat => cat.code === selectedCategoryCode && cat.languageCode == selectedLanguageCode);
    if (!category)
        return;
    const catTitleEl = document.getElementById("cattitle");
    const catSubtitleEl = document.getElementById("catsubtitle");
    if (catTitleEl)
        catTitleEl.textContent = category.description;
    if (catSubtitleEl)
        catSubtitleEl.textContent = category.subdescription;
}
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        lang: window.PAGE_LANG || "en",
        country: params.get("country") || "",
        cat: params.get("cat") || "AGR"
    };
}
const i18n = {
    en: {
        noFeeds: "No feeds match the selected filters.",
        addFeedSuccess: "Feed added successfully (will be moderated before publishing).",
        addFeedError: "Error adding the feed.",
        connectionError: "Connection error.",
        voteThanks: "Thank you! Your vote has been counted.",
        voteDuplicate: "You have already voted from this IP.",
        voteTooMany: "Too many requests from this network. Try later.",
        voteError: "Could not register your vote.",
        shareError: "Cannot share this news.",
        shareFailed: "Could not share the news.",
        historyTitle: "News history for",
        allCountries: "All countries",
        sharethisnews: "Share this news",
        voteThisFeed: "Vote this feed",
        viewHistory: "View news history",
        commentsToggle: "🗨️ Comments on this feed",
        feedTechnicalIssues: "This feed is experiencing technical issues",
        votes: "votes"
    },
    es: {
        noFeeds: "No hay feeds que coincidan con los filtros seleccionados.",
        addFeedSuccess: "Feed agregado correctamente al directorio (se moderará antes de publicarlo).",
        addFeedError: "Hubo un error al añadir el feed.",
        connectionError: "Error de conexión.",
        voteThanks: "¡Gracias! Su voto ha sido contabilizado.",
        voteDuplicate: "Ya se votó desde esta misma IP.",
        voteTooMany: "Demasiadas peticiones desde esta red. Inténtelo más tarde.",
        voteError: "No se pudo registrar su voto.",
        shareError: "No se puede compartir esta noticia.",
        shareFailed: "No se pudo compartir la noticia.",
        historyTitle: "Historial de noticias de",
        allCountries: "Todos los países",
        sharethisnews: "Compartir esta noticia",
        voteThisFeed: "Votar este feed",
        viewHistory: "Ver historial de noticias",
        commentsToggle: "🗨️ Comentarios sobre este feed",
        feedTechnicalIssues: "Este feed está teniendo problemas técnicos",
        votes: "votos"
    }
};
function t(key) {
    var _a;
    const lang = (window.PAGE_LANG || "en");
    if (!i18n[lang])
        return key;
    return (_a = i18n[lang][key]) !== null && _a !== void 0 ? _a : key;
}
function getCommentsIssueTerm(feedTitle, category, lang) {
    // Si es español y agregadores, dejamos solo el título (manteniendo compatibilidad con los comentarios existentes)
    if (lang === "es" && category === 'AGR')
        return feedTitle;
    // Para otros idiomas, añadimos categoría y código de idioma
    return `${feedTitle}-${category}-${lang}`;
}
