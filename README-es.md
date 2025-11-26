# FEEDSHOME

Descubre, organiza y sigue tus feeds favoritos en un solo lugar. FEEDSHOME te ofrece un directorio completo de feeds agrupados por idioma, país y categoría, para que estés siempre al día con las noticias, blogs y contenidos que más te interesan, sin perder tiempo buscando.

Desplegado en vivo: https://enterum.github.io/aggrhome/

---

## Funcionalidades

- Lectura de feeds RSS de distintos agregadores de noticias, periódicos online, blogs, revistas, etc.
- Categorización por idioma, temática y país.
- Visualización del título, enlace e imagen de la primera noticia de cada feed.
- Selección de intervalo de actualización automática desde la barra de navegación (Nunca, 1 minuto, 5 minutos, 10 minutos, 30 minutos).  
- Imágenes por defecto para cada feed si no hay imagen disponible en el mismo.
- Histórico de noticias por cada feed.
- Compartir elementos del feed.
- Se pueden realizar comentarios sobre cada feed de noticias.
- Se puede votar cada feed: El número de votos determinará el orden en el listado.
- Se pueden enviar feeds al directorio (tras su evaluación se decidirá si se incluyen o no)

---

## Estructura del proyecto

```
AGGRHOME/
├── docs/                  # Archivos estáticos: HTML, CSS, etc.
├──── css/                 # Hojas de estilo
├──── fonts/               # Ficheros de fuentes
├──── img/                 # Imágenes
├──── dist/                
├────── main.ts            # Código TypeScript compilado
├──── index.html           # Archivo index HTML principal
├──── index-xx.html        # Archivo index HTML en cada idioma
├──── feeds.txt            # Lista de feeds RSS/Atom
├──── categoris.txt        # Lista de categorías
├── src/                   
├──── main.ts              # Código TypeScript
├── package.json           # Dependencias y scripts
├── package-lock.json      # Dependencias y scripts
├── tsconfig.json          # Configuración TypeScript
├── README.md              # README proyecto principal (inglés)
├── README-xx.md           # README proyecto en cada idioma
├── LICENSE                # LICENCIA del proyecto
└── .gitignore
```

---

## Registro de cambios importantes

- **2025-11-20** - Cambio de AGGHOME a FEEDSHOME generalizando el proyecto y ampliando funcionalidades (categorización idioma-temática-páis, envío de feeds)
- **2025-11-11** - Se añade la funcionalidad de votar agregadores (requiere backend). Un voto por IP.
- **2025-11-06** - Se añade la funcionalidad de comentar cada agregador con [utteranc.es](https://utteranc.es).
- **2025-11-06** - Se añade la funcionalidad de compartir noticias mediante Web Share API.
- **2025-11-05** - Se añade histórico de noticias por cada feed: Al ser un proyecto sin backend, el historial se guarda en el localStorage del navegador. Eso quiere decir que solo aparecerán en el historial las noticias que hayan ido apareciendo por cada feed mientras la aplicación se ha estado ejecutando en el navegador del usuario.
- **2025-11-04** - Versión inicial.

---

## Uso

1. Clonar el repositorio:

```bash
git clone https://github.com/enterum/aggrhome.git
cd aggrhome
```

2. Instalar dependencias:

```bash
npm install
```

3. Compilar TypeScript:

```bash
npm run build
```

4. Iniciar el servidor local:

```bash
npm run start
```

- Esto abrirá `docs/index.html` en tu navegador y cargará los feeds.
- Puedes cambiar el intervalo de refresco desde la barra de navegación.

---

## Añadir nuevos feeds manualmente (en tu propio fork del repositorio)

Los feeds RSS se gestionan mediante el archivo `feeds.txt` en la raíz del proyecto. Cada línea del archivo contiene, separados por comas, los siguientes datos:

- nombre del feed
- url del feed
- url de la imagen por defecto
- tipo de feed:  `rss` o `atom`
- si la imagen está incluída en el tag de descripción (`true`/`false`)
- código de categoría (temática)
- código de país
- código de idioma


Ejemplo:

```
Menéame,https://www.meneame.net/rss,https://enterum.github.io/aggrhome/img/meneame.png,rss,true,AGR,ES,es
KillBait,https://killbaitnews.github.io/rssfeeds/en.rss,https://enterum.github.io/aggrhome/img/killbait.png,rss,false,AGR,ES,en
El País,https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/ultimas-noticias/portada,https://static.elpais.com/dist/resources/images/logos/primary/el-pais.svg,rss,false,PON,ES,es
```

---

## Añadir nuevos feeds mediante el formulario

Solo tienes que escribir la URL del feed, completar el captcha y pulsar "Añadir feed". Se entenderá que se quiere para el idioma, categoría y país seleccionados en el momento del envío.

---


## Forks

(free-for-dev)[https://free-for-dev.rebuscando.info/] - Descubre, compara y sigue las mejores herramientas gratuitas para desarrolladores en un solo lugar. Nuestro directorio reúne servicios de software con planes gratuitos —organizados por categoría, caso de uso y stack tecnológico— para que encuentres exactamente lo que necesitas sin perder tiempo buscando.


---

## Licencia

Este proyecto está bajo la licencia MIT. Puedes usarlo y modificarlo libremente.