# FEEDSHOME

Discover, organize, and follow your favorite feeds in one place. FEEDSHOME offers a complete directory of feeds grouped by language, country, and category so you can stay up to date with the news, blogs, and content that interest you most---without wasting time searching.

Live demo: https://enterum.github.io/aggrhome/

------------------------------------------------------------------------

## Features

-   Reading RSS feeds from various news aggregators, online newspapers, blogs, magazines, etc.
-   Categorization by language, topic, and country.
-   Display of the title, link, and image of the first news item from each feed.
-   Automatic refresh interval selection from the navigation bar (Never, 1 minute, 5 minutes, 10 minutes, 30 minutes).
-   Default images for feeds when no image is available.
-   News history for each feed.
-   Share feed items.
-   Users can comment on each feed.
-   Voting system for feeds: the number of votes determines their order in the list.
-   Users can submit new feeds to the directory (they will be reviewed before being accepted).

------------------------------------------------------------------------

## Project Structure

```
    AGGRHOME/
    ├── docs/                  # Static files: HTML, CSS, etc.
    ├──── css/                 # Stylesheets
    ├──── fonts/               # Font files
    ├──── img/                 # Images
    ├──── dist/
    ├────── main.ts            # Compiled TypeScript code
    ├──── index.html           # Main HTML file
    ├──── index-xx.html        # HTML file for each language
    ├──── feeds.txt            # List of RSS/Atom feeds
    ├──── categoris.txt        # List of categories
    ├── src/
    ├──── main.ts              # Source TypeScript code
    ├── package.json           # Dependencies and scripts
    ├── package-lock.json      # Dependency lock file
    ├── tsconfig.json          # TypeScript configuration
    ├── README.md              # Main project README (English)
    ├── README-xx.md           # Translated READMEs
    ├── LICENSE                # Project license
    └── .gitignore
```    

------------------------------------------------------------------------

## Changelog

-   **2025-11-20** -- Project renamed from AGGHOME to FEEDSHOME, generalizing its purpose and adding new functionalities
    (language--topic--country categorization, feed submissions).
-   **2025-11-11** -- Added voting functionality for aggregators (requires backend). One vote per IP.
-   **2025-11-06** -- Added commenting for each aggregator using [utteranc.es](https://utteranc.es).
-   **2025-11-06** -- Added news sharing via the Web Share API.
-   **2025-11-05** -- Added news history for each feed. Since there is no backend, the history is stored in the browser's localStorage:
    only news that appeared while the application was open will be     shown.
-   **2025-11-04** -- Initial version.

------------------------------------------------------------------------

## Usage

1.  Clone the repository:

``` bash
git clone https://github.com/enterum/aggrhome.git
cd aggrhome
```

2.  Install dependencies:

``` bash
npm install
```

3.  Compile TypeScript:

``` bash
npm run build
```

4.  Start the local server:

``` bash
npm run start
```

-   This will open `docs/index.html` in your browser and load the feeds.
-   You can change the refresh interval from the navigation bar.

------------------------------------------------------------------------

## Adding New Feeds Manually (in your own fork)

RSS feeds are managed through the `feeds.txt` file located at the root of the project.
Each line contains, separated by commas:

-   feed name
-   feed URL
-   default image URL
-   feed type: `rss` or `atom`
-   whether the image is included in the description tag (`true`/`false`)
-   category code
-   country code
-   language code

Example:

```
    Menéame,https://www.meneame.net/rss,https://enterum.github.io/aggrhome/img/meneame.png,rss,true,AGR,ES,es
    KillBait,https://killbaitnews.github.io/rssfeeds/en.rss,https://enterum.github.io/aggrhome/img/killbait.png,rss,false,AGR,ES,en
    El País,https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/ultimas-noticias/portada,https://static.elpais.com/dist/resources/images/logos/primary/el-pais.svg,rss,false,PON,ES,es
```    

------------------------------------------------------------------------

## Adding New Feeds via the Form

Just enter the feed URL, complete the captcha, and click **"Add feed"**. The selected language, category, and country at the moment of submission will be used.

------------------------------------------------------------------------


## Forks

(free-for-dev)[https://free-for-dev.rebuscando.info/] - Discover, compare, and track the best free developer tools in one place. Our directory brings together software services with free tiers—organized by category, use case, and tech stack—so you can find exactly what you need without wasting time searching.

---

## License

This project is released under the **MIT License**. You are free to use
and modify it.
