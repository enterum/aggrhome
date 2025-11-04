# AGGRHOME

AGGRHOME es un lector de feeds RSS que muestra las portadas de los principales agregadores de noticias en español. La página carga automáticamente los feeds RSS de varios sitios, muestra el primer artículo de cada feed y permite actualizar la información de manera periódica según un intervalo configurable.

---

## Funcionalidades

- Lectura de feeds RSS de varios agregadores (Menéame, KillBait, Tardigram, Mediatize).
- Visualización del título, enlace e imagen de la primera noticia de cada feed.
- Selección de intervalo de actualización automática desde la barra de navegación (Nunca, 1 minuto, 5 minutos, 10 minutos, 30 minutos).  
- Imágenes por defecto para cada agregador si no hay imagen disponible en el feed.

---

## Estructura del proyecto

```
AGGRHOME/
├── docs/                  # Archivos estáticos: HTML, CSS, etc.
├──── css/                 # Hojas de estilo
├──── fonts/               # Ficheros de fuentes
├──── dist/                # Código TypeScript compilado
├────── main.ts            # Código TypeScript compilado
├──── index.html           # Archivo index HTML
├──── feeds.txt            # Lista de feeds RSS e imágenes por defecto
├── src/                   # Código TypeScript
├──── main.ts              # Código TypeScript
├── package.json           # Dependencias y scripts
├── package-lock.json      # Dependencias y scripts
├── tsconfig.json          # Configuración TypeScript
├── README.md              # README proyecto
├── LICENSE
└── .gitignore
```

---

## Uso

1. Clonar el repositorio:

```bash
git clone https://github.com/tu-usuario/aggrhome.git
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

## Añadir nuevos feeds

Los feeds RSS se gestionan mediante el archivo `feeds.txt` en la raíz del proyecto. Cada línea del archivo contiene el nombre del sitio, url del feed y url de la imagen por defecto separados por comas:

```
Menéame,https://www.meneame.net/rss,https://www.meneame.net/img/mnm/logo.svg
KillBait,https://killbait.com/feed-es.php,https://killbait.com/assets/images/logo/5.png
Tardigram,https://tardigram.com/rss,https://tardigram.com/media/cache/resolve/post_thumb/2d/07/2d07bae7d94ca622e9ec3584a8dd3b10ba33677a2338ddd2bc7db6907860ff0e.jpg
Mediatize,https://www.mediatize.info/rss,https://www.mediatize.info/v_78/img/mdtz/logo.svg
```

Si quieres añadir un nuevo feed al proyecto:

1. Haz una pull request.  
2. Añade una nueva línea en `feeds.txt` que contenga el nombre del sitio, url del feed y url de la imagen por defecto separados por comas.
3. Asegúrate de que el feed siga el formato RSS estándar.

> Nota: Una vez aprobada la pull request el proyecto leerá automáticamente los feeds de `feeds.txt` al cargarse, sin necesidad de modificar el código.

---

## Contribución

- Pull requests son bienvenidas para añadir nuevos feeds, mejorar el diseño o corregir errores.  
- Por favor, sigue la estructura y buenas prácticas existentes.  

---

## Licencia

Este proyecto está bajo la licencia MIT. Puedes usarlo y modificarlo libremente.