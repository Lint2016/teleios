/**
 * Load latest sermons from YouTube channel RSS (no API key required).
 */
(function () {
    const config = window.TELEIOS_CONFIG || {};
    const CHANNEL_ID = config.youtubeChannelId || 'UCIqka1KcckcYRK3DXynQbiw';
    const CHANNEL_URL = config.youtubeChannelUrl || `https://www.youtube.com/channel/${CHANNEL_ID}`;
    const MAX_VIDEOS = config.youtubeMaxVideos || 9;

    const FALLBACK_SERMONS = [
        {
            videoId: '4138MLHb63E',
            title: 'Walking in Spiritual Maturity',
            published: '2023-12-10',
            speaker: 'Sister Natalie',
            description: 'Exploring what it means to grow in spiritual maturity and how we can support each other in this journey.'
        },
        {
            videoId: 'B9JkLy2ljTU',
            title: 'Power',
            published: '2023-12-03',
            speaker: 'Apostle Brandon',
            description: 'Celebrating our diverse community while finding strength in our shared faith and common purpose.'
        },
        {
            videoId: 'obMKaZPIWGI',
            title: 'The Heart of Fellowship',
            published: '2023-11-26',
            speaker: 'Brother Matthew',
            description: 'Understanding the biblical foundation of genuine fellowship and how it transforms our community.'
        }
    ];

    function getVideoIdFromEntry(entry) {
        const namespaced = entry.getElementsByTagNameNS('http://www.youtube.com/xml/schemas/2015', 'videoId');
        if (namespaced.length) return namespaced[0].textContent;

        const plain = entry.querySelector('videoId');
        if (plain) return plain.textContent;

        const link = entry.querySelector('link');
        const href = link?.getAttribute('href') || '';
        const match = href.match(/[?&]v=([^&]+)/);
        return match ? match[1] : null;
    }

    function parseRssEntries(xmlText) {
        const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
        if (doc.querySelector('parsererror')) return null;

        return [...doc.querySelectorAll('entry')].slice(0, MAX_VIDEOS).map((entry) => {
            const videoId = getVideoIdFromEntry(entry);
            const title = entry.querySelector('title')?.textContent?.trim() || 'Sermon';
            const published = entry.querySelector('published')?.textContent || '';
            const speaker = entry.querySelector('author name')?.textContent?.trim() || 'Teleios Church';
            const mediaDesc = entry.querySelector('media\\:description, description');
            let description = mediaDesc?.textContent?.trim() || '';
            if (description.length > 180) {
                description = `${description.slice(0, 177)}…`;
            }
            if (!description) {
                description = 'Watch this message from Teleios Church on YouTube.';
            }

            return { videoId, title, published, speaker, description };
        }).filter((item) => item.videoId);
    }

    async function fetchYouTubeVideos() {
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
        const proxies = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`,
            `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`
        ];

        for (const proxyUrl of proxies) {
            try {
                const response = await fetch(proxyUrl);
                if (!response.ok) continue;
                const xmlText = await response.text();
                const parsed = parseRssEntries(xmlText);
                if (parsed && parsed.length) return parsed;
            } catch (err) {
                console.warn('YouTube RSS fetch attempt failed:', err);
            }
        }

        return null;
    }

    function formatSermonDate(isoDate) {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function youtubeThumbUrl(videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function createSermonCard(sermon) {
        const card = document.createElement('article');
        card.className = 'sermon-card';
        card.setAttribute('data-video-id', sermon.videoId);

        const dateStr = formatSermonDate(sermon.published);
        const thumb = youtubeThumbUrl(sermon.videoId);

        card.innerHTML = `
            <div class="sermon-image">
                <img
                    src="${thumb}"
                    alt="${escapeHtml(sermon.title)} — video thumbnail"
                    loading="lazy"
                    decoding="async"
                    width="480"
                    height="360"
                >
                <button type="button" class="sermon-play-overlay btn-video" aria-label="Play ${escapeHtml(sermon.title)}">
                    <i class="fas fa-play-circle" aria-hidden="true"></i>
                </button>
            </div>
            <div class="sermon-content">
                <h3>${escapeHtml(sermon.title)}</h3>
                ${dateStr ? `<p class="sermon-date">${escapeHtml(dateStr)}</p>` : ''}
                <p class="sermon-speaker">${escapeHtml(sermon.speaker)}</p>
                <p class="sermon-description">${escapeHtml(sermon.description)}</p>
                <div class="sermon-actions">
                    <button type="button" class="btn btn-video"><i class="fas fa-video" aria-hidden="true"></i> Watch</button>
                    <a href="https://www.youtube.com/watch?v=${sermon.videoId}" class="btn btn-audio sermon-youtube-link" target="_blank" rel="noopener noreferrer">YouTube</a>
                </div>
            </div>
        `;

        const img = card.querySelector('img');
        if (img) {
            img.addEventListener('error', () => {
                img.src = `https://img.youtube.com/vi/${sermon.videoId}/mqdefault.jpg`;
            });
        }

        return card;
    }

    function buildSpeakerFilters(sermons) {
        const container = document.querySelector('.sermon-filter-tags');
        if (!container) return;

        const speakers = [...new Set(sermons.map((s) => s.speaker).filter(Boolean))].slice(0, 6);

        container.innerHTML = '<button type="button" class="filter-tag active" data-filter="all">All Sermons</button>';
        speakers.forEach((speaker) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'filter-tag';
            btn.setAttribute('data-filter', speaker);
            btn.textContent = speaker;
            container.appendChild(btn);
        });
    }

    function observeSermonCards(grid) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        grid.querySelectorAll('.sermon-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(24px)';
            card.style.transition = `opacity 0.5s ease ${index * 0.06}s, transform 0.5s ease ${index * 0.06}s`;
            observer.observe(card);
        });
    }

    async function initializeYouTubeSermons() {
        const grid = document.getElementById('sermons-grid');
        const channelLink = document.getElementById('sermons-channel-link');
        if (!grid) return;

        if (channelLink) {
            channelLink.href = CHANNEL_URL;
        }

        let sermons = await fetchYouTubeVideos();
        if (!sermons || !sermons.length) {
            console.info('Using fallback sermon list.');
            sermons = FALLBACK_SERMONS;
        }

        grid.innerHTML = '';
        sermons.forEach((sermon) => {
            grid.appendChild(createSermonCard(sermon));
        });

        buildSpeakerFilters(sermons);
        observeSermonCards(grid);

        if (typeof window.reinitializeSermonFilters === 'function') {
            window.reinitializeSermonFilters();
        }

        document.dispatchEvent(new CustomEvent('teleios:sermons-loaded'));
    }

    window.initializeYouTubeSermons = initializeYouTubeSermons;
})();
