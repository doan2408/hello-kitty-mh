/**
 * Hello Kitty Landing Page - Interactive Script
 * Features: Playlist Lofi Cassette, Sparkle Trail Cursor, Bow Customizer, Outfit Dress-Up, 
 * Fortune Candy Jar, 3D Diary Book, Pie Clicker Game, Night Theme Mode.
 */

// --- GLOBAL VARIABLES & STATE ---
let isPlaying = false;
let rainbowInterval = null;
let particles = []; // Sparkles list

// Default playlist tracks
const DEFAULT_PLAYLIST = [
    {
        title: "Lời Nói Dối Chân Thật (Piano)",
        artist: "An Coong Piano Cover",
        youtubeId: "-9rqKAKIE4M",
        duration: 259
    },
    {
        title: "Lời Nói Dối Chân Thật (Acoustic)",
        artist: "Hoàng Dũng x Lâm Bảo Ngọc",
        youtubeId: "cTYrJKRhjgg",
        duration: 288
    },
    {
        title: "Hello Kitty Lofi Chill Loop",
        artist: "Sweet Lofi Beats",
        youtubeId: "jfKfPfyJRdk",
        duration: 300
    }
];

let playlist = [...DEFAULT_PLAYLIST];

// Load playlist from localStorage if available
function loadSavedPlaylist() {
    try {
        const saved = localStorage.getItem('kitty_custom_playlist');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                playlist = parsed;
            }
        }
    } catch (e) {
        console.error("Error loading playlist from localStorage:", e);
    }
}
loadSavedPlaylist();

// --- GLOBAL VARIABLES & STATE FOR YOUTUBE THEATER MODE ---
let isTheaterMode = false;

// Mock seed comments
const MOCK_COMMENTS_SEED = [
    { author: "Hello Kitty 🐱", avatar: "🐱", text: "Giai điệu này nghe thật ấm áp và ngọt ngào! Tớ rất thích nghe khi đang nướng bánh táo 🍎✨", time: "2 giờ trước" },
    { author: "Dear Daniel 👦", avatar: "👦", text: "Nhạc piano nhẹ nhàng quá, nghe rất hợp để vừa đọc sách hoặc học bài ☕📖", time: "5 giờ trước" },
    { author: "Mimmy 🎀", avatar: "🎀", text: "Tớ vừa cùng Kitty làm bánh quy vừa nghe bài này, cảm giác hạnh phúc ghê! 💕", time: "1 ngày trước" },
    { author: "My Melody 🌸", avatar: "🌸", text: "Không gian màu hồng này kết hợp với giai điệu lofi này thật hoàn hảo đó nha! 🌸🎀", time: "2 ngày trước" }
];

// Recommended Seeds for Sidebar (real YouTube video IDs — 12 items so pagination always works)
const RECOMMENDED_SEEDS = [
    { title: "Hello Kitty's Dreamy Afternoon 🌸",         artist: "Lofi Lulupop",                 youtubeId: "BzEHa_tQ2DI",  duration: 3600 },
    { title: "Sweet Dream Lofi Beats 🌙",               artist: "Lofi Girl",                    youtubeId: "5qap5aO4i9A",  duration: 3600 },
    { title: "Cinnamoroll's Beachside Tea ☁️",           artist: "Lofi Lulupop",                 youtubeId: "N4tLwN5yO5k",  duration: 3600 },
    { title: "Hello Kitty Lofi Chill Loop 🎀",          artist: "Sweet Lofi Beats",              youtubeId: "jfKfPfyJRdk",  duration: 300  },
    { title: "Lời Nói Dối Chân Thật (Piano) 🎹",      artist: "An Coong Piano Cover",          youtubeId: "-9rqKAKIE4M", duration: 259  },
    { title: "Lời Nói Dối Chân Thật (Acoustic) 🎵",  artist: "Hoàng Dũng x Lâm Bảo Ngọc",      youtubeId: "cTYrJKRhjgg",  duration: 288  },
    { title: "Chillhop Essentials ☀️",                  artist: "Chillhop Music",                youtubeId: "7NOSDKb0HlU",  duration: 3600 },
    { title: "Lofi Hip Hop Radio 📚",                   artist: "Lofi Girl",                    youtubeId: "jfKfPfyJRdk",  duration: 3600 },
    { title: "Chân Thật (Official MV) 💔",            artist: "JustaTee x Kimmese",            youtubeId: "wkJ2HQQB2-0", duration: 288  },
    { title: "Cả Nhà Thương Nhau (Piano) 🎹",       artist: "An Coong Piano",                youtubeId: "3cSBxeDzYvo",  duration: 215  },
    { title: "Người Hãy Quên Em 🌸",               artist: "Miu Lê",                        youtubeId: "9iFmkO4MNRA",  duration: 244  },
    { title: "Cute Cafe Lofi Mix ☕",                  artist: "Dreamy",                       youtubeId: "lP9kYzVkJkY",  duration: 3600 }
];

// Helper to generate consistent seeded pseudo-random values based on ID
function getSeededValue(str, min, max) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const rand = Math.abs(Math.sin(hash));
    return Math.floor(rand * (max - min) + min);
}

// Update details, descriptions, likes, subscribe states in Theater mode
function updateTheaterDetails(track) {
    if (!track) return;
    
    const formatNumberVN = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(2).replace('.', ',') + " Tr";
        if (num >= 1000)    return (num / 1000).toFixed(1).replace('.', ',') + " N";
        return num.toString();
    };
    const formatShortNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000)    return (num / 1000).toFixed(1) + "K";
        return num.toString();
    };

    // 1. Title and Channel Name (immediate)
    const titleEl      = document.getElementById('theater-video-title');
    const channelEl    = document.getElementById('theater-channel-name');
    const viewsEl      = document.getElementById('theater-views');
    const subCountEl   = document.getElementById('theater-sub-count');
    const likeCountEl  = document.getElementById('like-count');
    const dateEl       = document.getElementById('theater-date');
    const descContentEl = document.getElementById('theater-desc-content');

    if (titleEl)   titleEl.textContent = track.title;
    if (channelEl) channelEl.textContent = track.artist;

    // Show placeholder while loading real stats
    if (viewsEl)    viewsEl.textContent   = '...';
    if (subCountEl) subCountEl.textContent = '...';
    if (dateEl)     dateEl.textContent     = '...';
    if (descContentEl) descContentEl.textContent = 'Đang tải thông tin...';

    // Seeded fallback values (used until real data arrives)
    const fallbackViews = getSeededValue(track.youtubeId, 100000, 5000000);
    const fallbackLikes = getSeededValue(track.youtubeId, 5000, 150000);
    const fallbackSubs  = getSeededValue(track.artist, 10000, 2500000);

    // Apply liked state with fallback likes
    const applyLikedState = (realLikes) => {
        const count = realLikes !== null ? realLikes : fallbackLikes;
        if (likeCountEl) likeCountEl.textContent = formatShortNumber(count);
        const likeBtn  = document.getElementById('theater-like-btn');
        if (likeBtn) {
            const isLiked   = localStorage.getItem('kitty_liked_' + track.youtubeId) === 'true';
            const heartIcon = likeBtn.querySelector('i');
            if (isLiked) {
                likeBtn.classList.add('liked');
                if (heartIcon) heartIcon.className = 'fa-solid fa-thumbs-up';
                if (likeCountEl) likeCountEl.textContent = formatShortNumber(count + 1);
            } else {
                likeBtn.classList.remove('liked');
                if (heartIcon) heartIcon.className = 'fa-regular fa-thumbs-up';
            }
        }
    };
    applyLikedState(null); // show fallback immediately

    // 2. Subscribe state (immediate from localStorage)
    const subBtn = document.getElementById('theater-subscribe-btn');
    if (subBtn) {
        const isSubbed = localStorage.getItem('kitty_subbed_' + encodeURIComponent(track.artist)) === 'true';
        subBtn.textContent = isSubbed ? 'Đã đăng ký' : 'Đăng ký';
        isSubbed ? subBtn.classList.add('subscribed') : subBtn.classList.remove('subscribed');
    }

    // Description collapse reset
    const descToggle = document.getElementById('theater-desc-toggle');
    if (descContentEl && descToggle) {
        descContentEl.classList.add('collapsed');
        descToggle.textContent = 'Thêm';
    }

    // 3. Fetch REAL stats from Invidious API
    fetchInvidiousVideoMeta(track.youtubeId)
        .then(meta => {
            // Real view count
            if (viewsEl && meta.viewCount !== undefined) {
                viewsEl.textContent = Number(meta.viewCount).toLocaleString('vi-VN') + ' lượt xem';
            } else if (viewsEl) {
                viewsEl.textContent = fallbackViews.toLocaleString('vi-VN') + ' lượt xem';
            }

            // Real subscriber count
            if (subCountEl) {
                const subs = meta.subCountText || (meta.authorStats && meta.authorStats.subscriberCountText);
                if (subs) {
                    subCountEl.textContent = subs + ' người đăng ký';
                } else if (meta.subCount !== undefined && meta.subCount !== null) {
                    subCountEl.textContent = formatNumberVN(meta.subCount) + ' người đăng ký';
                } else {
                    subCountEl.textContent = formatNumberVN(fallbackSubs) + ' người đăng ký';
                }
            }

            // Real like count
            if (meta.likeCount !== undefined && meta.likeCount !== null) {
                applyLikedState(meta.likeCount);
            }

            // Real upload date
            if (dateEl) {
                if (meta.publishedText) {
                    // Translate common English time strings to Vietnamese
                    const translated = meta.publishedText
                        .replace(/(\d+) years? ago/,     '$1 năm trước')
                        .replace(/(\d+) months? ago/,    '$1 tháng trước')
                        .replace(/(\d+) weeks? ago/,     '$1 tuần trước')
                        .replace(/(\d+) days? ago/,      '$1 ngày trước')
                        .replace(/(\d+) hours? ago/,     '$1 giờ trước')
                        .replace(/(\d+) minutes? ago/,   '$1 phút trước')
                        .replace('Streamed',              'Đã phát trực tiếp')
                        .replace('Premiered',             'Ra mắt');
                    dateEl.textContent = translated;
                } else if (meta.published) {
                    const d = new Date(meta.published * 1000);
                    dateEl.textContent = d.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
                } else {
                    dateEl.textContent = getSeededValue(track.youtubeId, 1, 8) + ' năm trước';
                }
            }

            // Real description
            if (descContentEl && meta.description) {
                descContentEl.textContent = meta.description.slice(0, 800) + (meta.description.length > 800 ? '...' : '');
            } else if (descContentEl) {
                descContentEl.textContent = `Chào mừng bạn đến với giai điệu "${track.title}" của nghệ sĩ ${track.artist}.\n\nHãy tận hưởng khoảng thời gian thư giãn cùng chúng mình nhé! 🌸🎀🍭`;
            }

            // Update channel avatar if available
            const avatarImg = document.getElementById('theater-channel-avatar');
            if (avatarImg && meta.authorThumbnails && meta.authorThumbnails.length > 0) {
                const best = meta.authorThumbnails.find(t => t.width >= 48) || meta.authorThumbnails[0];
                if (best && best.url) avatarImg.src = best.url;
            }
        })
        .catch(() => {
            // Fallback to seeded values
            if (viewsEl)    viewsEl.textContent    = fallbackViews.toLocaleString('vi-VN') + ' lượt xem';
            if (subCountEl) subCountEl.textContent  = formatNumberVN(fallbackSubs) + ' người đăng ký';
            if (dateEl)     dateEl.textContent      = getSeededValue(track.youtubeId, 1, 8) + ' năm trước';
            if (descContentEl) descContentEl.textContent = `Chào mừng bạn đến với giai điệu "${track.title}" của nghệ sĩ ${track.artist}.\n\nHãy tận hưởng khoảng thời gian thư giãn cùng chúng mình nhé! 🌸🎀🍭`;
        });

    // 4. Render comments and sidebar (parallel with API fetch)
    renderComments(track.youtubeId);
    renderTheaterSidebar(track.youtubeId);
}

function buildInvidiousApiUrl(instanceUrl, path, params = {}) {
    const url = new URL(path, instanceUrl);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, value);
        }
    });
    return url.toString();
}

function getCommentsScrollRoot() {
    const commentsEl = document.querySelector('.theater-comments');
    if (commentsEl) {
        const style = window.getComputedStyle(commentsEl);
        const canScroll = /(auto|scroll)/.test(style.overflowY) && commentsEl.scrollHeight > commentsEl.clientHeight;
        if (canScroll) return commentsEl;
    }

    const modalEl = document.getElementById('music-widget-container');
    if (modalEl) {
        const style = window.getComputedStyle(modalEl);
        const canScroll = /(auto|scroll)/.test(style.overflowY) && modalEl.scrollHeight > modalEl.clientHeight;
        if (canScroll) return modalEl;
    }

    return null;
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Fetch comments from YouTube via Invidious API with sequential fallback retry loop
async function fetchInvidiousComments(videoId, continuation) {
    let instances = [...INVIDIOUS_FALLBACK_INSTANCES];
    
    // Try to fetch registry first (skip on continuation requests to save time)
    if (!continuation) {
        try {
            const response = await fetch('https://api.invidious.io/instances.json?sort_by=type,health');
            if (response.ok) {
                const data = await response.json();
                const healthyList = data
                    .filter(inst => inst[1].cors === true && inst[1].api !== false && inst[1].type === 'https' && (!inst[1].monitor || inst[1].monitor.down === false))
                    .map(inst => inst[1].uri);
                if (healthyList.length > 0) {
                    instances = [...new Set([...healthyList, ...INVIDIOUS_FALLBACK_INSTANCES])];
                }
            }
        } catch (e) {
            console.warn("Could not fetch Invidious registry for comments, using fallback list:", e);
        }
    }
    
    for (const uri of instances) {
        try {
            const url = buildInvidiousApiUrl(uri, `/api/v1/comments/${videoId}`, {
                source: 'youtube',
                sort_by: 'top',
                hl: 'vi',
                continuation
            });
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.comments)) {
                    return data; // { comments: [], commentCount, continuation }
                }
            }
        } catch (err) {
            console.warn(`Instance failed for comments: ${uri}`, err);
        }
    }
    throw new Error("Không thể tải bình luận từ YouTube. Sử dụng bình luận giả lập! 🌸");
}

// Fetch real video metadata (views, likes, subs, date, description) from Invidious
async function fetchInvidiousVideoMeta(videoId) {
    let instances = [...INVIDIOUS_FALLBACK_INSTANCES];

    try {
        const response = await fetch('https://api.invidious.io/instances.json?sort_by=type,health');
        if (response.ok) {
            const data = await response.json();
            const healthyList = data
                .filter(inst => inst[1].cors === true && inst[1].api !== false && inst[1].type === 'https' && (!inst[1].monitor || inst[1].monitor.down === false))
                .map(inst => inst[1].uri);
            if (healthyList.length > 0) instances = [...new Set([...healthyList, ...INVIDIOUS_FALLBACK_INSTANCES])];
        }
    } catch (e) {}

    for (const uri of instances) {
        try {
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(`${uri}/api/v1/videos/${videoId}`, { signal: controller.signal });
            clearTimeout(tid);
            if (!res.ok) continue;
            const data = await res.json();
            if (!data || !data.videoId) continue;

            // Extract subCount from channel info if available
            let subCount = null;
            let subCountText = null;
            if (data.authorStats) {
                subCount = data.authorStats.subscriberCount;
                subCountText = data.authorStats.subscriberCountText;
            }
            // Some instances embed it directly
            if (!subCount && data.subCountText) subCountText = data.subCountText;

            return {
                viewCount:        data.viewCount,
                likeCount:        data.likeCount || null,
                published:        data.published,
                publishedText:    data.publishedText,
                description:      data.description || '',
                author:           data.author,
                authorThumbnails: data.authorThumbnails || [],
                subCount,
                subCountText,
            };
        } catch (err) {
            console.warn(`fetchInvidiousVideoMeta failed for ${uri}:`, err.message);
        }
    }
    throw new Error('Could not fetch video metadata from any Invidious instance');
}

// Fetch related/recommended videos from YouTube via Invidious API
async function fetchInvidiousRelatedVideos(videoId) {
    let instances = [...INVIDIOUS_FALLBACK_INSTANCES];
    
    // Try to get healthy instances from registry
    try {
        const response = await fetch('https://api.invidious.io/instances.json?sort_by=type,health');
        if (response.ok) {
            const data = await response.json();
            const healthyList = data
                .filter(inst => inst[1].cors === true && inst[1].api !== false && inst[1].type === 'https' && (!inst[1].monitor || inst[1].monitor.down === false))
                .map(inst => inst[1].uri);
            if (healthyList.length > 0) {
                instances = [...new Set([...healthyList, ...INVIDIOUS_FALLBACK_INSTANCES])];
            }
        }
    } catch (e) {
        console.warn("Could not fetch Invidious registry for related videos:", e);
    }
    
    for (const uri of instances) {
        try {
            const url = `${uri}/api/v1/videos/${videoId}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.recommendedVideos) && data.recommendedVideos.length > 0) {
                    console.log(`Fetched ${data.recommendedVideos.length} related videos via ${uri}`);
                    return data.recommendedVideos;
                }
            }
        } catch (err) {
            console.warn(`Instance failed for related videos: ${uri}`, err);
        }
    }
    throw new Error("Không thể tải video đề xuất. Dùng danh sách gợi ý mặc định 🌸");
}

// Render Comment Section (Combines user comments with real YouTube comments or mock comments)
// ============================================================
// COMMENT RENDERING – WITH INFINITE SCROLL
// ============================================================

// Build a single comment DOM element
function buildCommentEl(comment) {
    const item = document.createElement('div');
    item.className = 'comment-item';

    const isPinnedHtml = comment.isPinned
        ? `<span style="color:var(--accent-red);font-size:0.72rem;font-weight:bold;margin-bottom:4px;display:block;"><i class="fa-solid fa-thumbtack"></i> Được ghim</span>`
        : '';

    const likesHtml = comment.likeCount !== undefined && comment.likeCount > 0
        ? `<span style="font-size:0.75rem;color:var(--text-muted);display:flex;align-items:center;gap:4px;margin-top:6px;"><i class="fa-regular fa-thumbs-up"></i> ${Number(comment.likeCount).toLocaleString('vi-VN')}</span>`
        : '';

    let avatarHtml = '🌸';
    if (comment.avatar) {
        avatarHtml = escapeHtml(comment.avatar);
    } else if (comment.authorThumbnails && comment.authorThumbnails.length > 0) {
        avatarHtml = `<img src="${escapeHtml(comment.authorThumbnails[0].url)}" alt="${escapeHtml(comment.author || '')}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    }

    item.innerHTML = `
        <div class="comment-avatar">${avatarHtml}</div>
        <div class="comment-details">
            <div class="comment-author-row">
                <span class="comment-author">${escapeHtml(comment.author || 'Người dùng')}</span>
                <span class="comment-time">${escapeHtml(comment.time || comment.publishedText || 'Vừa xong')}</span>
            </div>
            ${isPinnedHtml}
            <div class="comment-text">${escapeHtml(comment.content || comment.text || '')}</div>
            ${likesHtml}
        </div>
    `;
    return item;
}

// Attach IntersectionObserver sentinel to the bottom of comments list
function attachCommentsSentinel(listEl) {
    if (commentsObserver) { commentsObserver.disconnect(); commentsObserver = null; }
    if (commentsContainer && commentsContainer._commentsScrollHandler) {
        commentsContainer.removeEventListener('scroll', commentsContainer._commentsScrollHandler);
        commentsContainer._commentsScrollHandler = null;
    }
    listEl.querySelector('.comments-load-sentinel')?.remove();
    listEl.querySelector('.comments-loading-indicator')?.remove();
    listEl.querySelector('.comments-end-marker')?.remove();

    // Check if we still have items to show OR can fetch more
    const hasMore = commentsShownCount < allCommentsPool.length || commentsContinuation;
    if (!hasMore) {
        const end = document.createElement('div');
        end.className = 'comments-end-marker';
        end.innerHTML = `<i class="fa-solid fa-circle-check"></i> Đã hiển thị tất cả bình luận`;
        listEl.appendChild(end);
        return;
    }

    const sentinel = document.createElement('div');
    sentinel.className = 'comments-load-sentinel';
    listEl.appendChild(sentinel);

    const root = getCommentsScrollRoot();
    commentsContainer = root;

    commentsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !commentsLoadingMore) {
            loadMoreComments(listEl);
        }
    }, { root, rootMargin: '0px 0px 300px 0px', threshold: 0 });

    commentsObserver.observe(sentinel);

    if (root) {
        const handler = () => {
            const nearBottom = root.scrollTop + root.clientHeight >= root.scrollHeight - 240;
            if (nearBottom && !commentsLoadingMore) {
                loadMoreComments(listEl);
            }
        };
        root._commentsScrollHandler = handler;
        root.addEventListener('scroll', handler, { passive: true });
    }
}

// Render next batch of comments from allCommentsPool (and fetch next API page if needed)
function loadMoreComments(listEl) {
    if (commentsLoadingMore) return;
    commentsLoadingMore = true;

    // Remove old sentinel
    listEl.querySelector('.comments-load-sentinel')?.remove();

    // If we have queued comments, show them immediately
    if (commentsShownCount < allCommentsPool.length) {
        const batch = allCommentsPool.slice(commentsShownCount, commentsShownCount + COMMENTS_PAGE_SIZE);
        batch.forEach(c => listEl.appendChild(buildCommentEl(c)));
        commentsShownCount += batch.length;
        commentsLoadingMore = false;
        attachCommentsSentinel(listEl);
        return;
    }

    // Otherwise, fetch next API page (continuation)
    if (commentsContinuation && commentsCurrentVideoId) {
        const requestedVideoId = commentsCurrentVideoId;
        const requestedContinuation = commentsContinuation;
        // Show bouncing dots
        const loadingEl = document.createElement('div');
        loadingEl.className = 'comments-loading-indicator sidebar-loading-indicator';
        loadingEl.innerHTML = `
            <span>Đang tải thêm bình luận</span>
            <div class="load-dots"><span></span><span></span><span></span></div>
        `;
        listEl.appendChild(loadingEl);

        fetchInvidiousComments(requestedVideoId, requestedContinuation)
            .then(data => {
                if (commentsCurrentVideoId !== requestedVideoId) return;
                loadingEl.remove();
                const newComments = data.comments || [];
                commentsContinuation = data.continuation || null;
                allCommentsPool.push(...newComments);

                const batch = allCommentsPool.slice(commentsShownCount, commentsShownCount + COMMENTS_PAGE_SIZE);
                batch.forEach(c => listEl.appendChild(buildCommentEl(c)));
                commentsShownCount += batch.length;
                commentsLoadingMore = false;
                attachCommentsSentinel(listEl);
            })
            .catch(() => {
                loadingEl.remove();
                commentsContinuation = null; // no more pages
                commentsLoadingMore = false;
                attachCommentsSentinel(listEl);
            });
    } else {
        commentsLoadingMore = false;
        attachCommentsSentinel(listEl);
    }
}

function renderComments(videoId) {
    const listEl = document.getElementById('theater-comments-list');
    const countEl = document.getElementById('comments-count');
    if (!listEl) return;

    // Reset pagination state for this video
    if (commentsObserver) { commentsObserver.disconnect(); commentsObserver = null; }
    if (commentsContainer && commentsContainer._commentsScrollHandler) {
        commentsContainer.removeEventListener('scroll', commentsContainer._commentsScrollHandler);
        commentsContainer._commentsScrollHandler = null;
    }
    allCommentsPool        = [];
    commentsShownCount     = 0;
    commentsLoadingMore    = false;
    commentsContinuation   = null;
    commentsCurrentVideoId = videoId;
    // Display loading indicator
    listEl.innerHTML = `
        <div style="text-align:center;padding:25px 0;color:var(--text-muted);font-size:0.84rem;font-weight:bold;width:100%;">
            <span style="display:inline-block;animation:heartbeat 1s infinite alternate;margin:0 auto 10px;">💖</span>
            <p>Đang tải bình luận từ YouTube...</p>
        </div>
    `;

    // Get user-submitted comments for this video
    let userComments = [];
    try {
        const saved = localStorage.getItem('kitty_user_comments_' + videoId);
        if (saved) userComments = JSON.parse(saved);
    } catch (e) {}

    // Fetch real comments
    fetchInvidiousComments(videoId)
        .then(data => {
            if (commentsCurrentVideoId !== videoId) return;
            const ytComments = data.comments || [];
            commentsContinuation = data.continuation || null;

            // Combine user comments (always first) + real comments
            allCommentsPool = [...userComments, ...ytComments];

            const total = data.commentCount || allCommentsPool.length;
            if (countEl) countEl.textContent = Number(total).toLocaleString('vi-VN') + ' bình luận';

            listEl.innerHTML = '';

            if (allCommentsPool.length === 0) {
                listEl.innerHTML = `<div style="text-align:center;padding:15px 0;color:var(--text-muted);font-size:0.8rem;">Chưa có bình luận nào. Hãy là người đầu tiên bình luận! 🌸</div>`;
                return;
            }

            // Render first batch
            const firstBatch = allCommentsPool.slice(0, COMMENTS_PAGE_SIZE);
            firstBatch.forEach(c => listEl.appendChild(buildCommentEl(c)));
            commentsShownCount = firstBatch.length;

            // Attach scroll sentinel
            attachCommentsSentinel(listEl);
        })
        .catch(err => {
            if (commentsCurrentVideoId !== videoId) return;
            console.warn(err.message);
            // Fallback to mock comments
            let mockComments = [];
            try {
                const saved = localStorage.getItem('kitty_comments_' + videoId);
                if (saved) {
                    mockComments = JSON.parse(saved);
                } else {
                    mockComments = [...MOCK_COMMENTS_SEED];
                    localStorage.setItem('kitty_comments_' + videoId, JSON.stringify(mockComments));
                }
            } catch (e) {
                mockComments = [...MOCK_COMMENTS_SEED];
            }

            allCommentsPool = [...userComments, ...mockComments];
            commentsContinuation = null;

            const total = allCommentsPool.length;
            if (countEl) countEl.textContent = total + ' bình luận';

            listEl.innerHTML = '';
            const firstBatch = allCommentsPool.slice(0, COMMENTS_PAGE_SIZE);
            firstBatch.forEach(c => listEl.appendChild(buildCommentEl(c)));
            commentsShownCount = firstBatch.length;
            attachCommentsSentinel(listEl);
        });
}

// Helper: build a sidebar card element
function buildSidebarCard(videoId, title, artist, duration, thumbUrl, extraAttrs) {
    const card = document.createElement('div');
    card.className = 'sidebar-card';
    card.setAttribute('data-video-id', videoId);
    card.setAttribute('data-title', title);
    card.setAttribute('data-artist', artist);
    card.setAttribute('data-duration', duration);
    if (extraAttrs) {
        Object.entries(extraAttrs).forEach(([k, v]) => card.setAttribute(k, v));
    }
    
    const durSec = typeof duration === 'number' ? duration : (parseInt(duration) || 300);
    const viewsVal = getSeededValue(videoId, 5000, 800000);
    const viewsStr = viewsVal >= 1000 ? Math.round(viewsVal / 1000) + ' N lượt xem' : viewsVal + ' lượt xem';
    const primaryThumb = thumbUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const fallbackThumb = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    const fallback2Thumb = `https://img.youtube.com/vi/${videoId}/default.jpg`;
    
    card.innerHTML = `
        <div class="sidebar-thumb-wrapper">
            <img src="${primaryThumb}" alt="${title.replace(/"/g, '&quot;')}"
                 onerror="if(this.src!=='${fallbackThumb}'){this.src='${fallbackThumb}';}else{this.src='${fallback2Thumb}';this.onerror=null;}">
            <span class="sidebar-duration-badge">${formatTime(durSec)}</span>
        </div>
        <div class="sidebar-card-info">
            <span class="sidebar-card-title">${title}</span>
            <span class="sidebar-card-artist">${artist}</span>
            <span class="sidebar-card-views">${viewsStr}</span>
        </div>
    `;
    return card;
}

// Render Sidebar Cards (Recommended: fetched from API + Playlist)
// Helper: render a batch of related video cards into recommendedList
function renderRelatedBatch(list, videos, startIdx, count) {
    const slice = videos.slice(startIdx, startIdx + count);
    slice.forEach(rv => {
        let thumb = `https://img.youtube.com/vi/${rv.videoId}/hqdefault.jpg`;
        if (rv.videoThumbnails && rv.videoThumbnails.length > 0) {
            const med = rv.videoThumbnails.find(t => t.quality === 'medium' || t.quality === 'mqdefault');
            if (med && med.url) thumb = med.url;
        }
        const card = buildSidebarCard(
            rv.videoId,
            rv.title   || 'Video YouTube',
            rv.author  || 'YouTube',
            rv.lengthSeconds || 300,
            thumb
        );
        list.appendChild(card);
    });
    return slice.length;
}

// Attach IntersectionObserver sentinel to the bottom of recommendedList
function attachSidebarSentinel(list, sidebarEl) {
    if (sidebarObserver) { sidebarObserver.disconnect(); sidebarObserver = null; }
    if (list._mobileScrollHandler) {
        list.removeEventListener('scroll', list._mobileScrollHandler);
        list._mobileScrollHandler = null;
    }

    list.querySelector('.sidebar-load-sentinel')?.remove();
    list.querySelector('.sidebar-end-marker')?.remove();
    list.querySelector('.sidebar-loading-indicator')?.remove();

    // Still have items in pool OR can fetch more → keep sentinel alive
    const hasMoreInPool  = sidebarShownCount < sidebarRelatedVideos.length;
    const hasMoreToFetch = sidebarFetchQueue.length > 0;

    if (!hasMoreInPool && !hasMoreToFetch) {
        const end = document.createElement('div');
        end.className = 'sidebar-end-marker';
        end.textContent = '\ud83c\udf38 \u0110\u00e3 t\u1ea3i t\u1ea5t c\u1ea3 video \u0111\u1ec1 xu\u1ea5t';
        list.appendChild(end);
        return;
    }

    const isMobileSidebar = window.innerWidth <= 768;

    if (isMobileSidebar) {
        // Mobile: sidebar is horizontal scroll — detect near right edge
        const sentinel = document.createElement('div');
        sentinel.className = 'sidebar-load-sentinel';
        list.appendChild(sentinel);

        const handler = () => {
            const nearEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - 200;
            if (nearEnd && !sidebarLoadingMore) {
                loadMoreSidebarVideos(list, sidebarEl);
            }
        };
        list.addEventListener('scroll', handler, { passive: true });
        list._mobileScrollHandler = handler;
    } else {
        // Desktop: vertical IntersectionObserver
        const sentinel = document.createElement('div');
        sentinel.className = 'sidebar-load-sentinel';
        list.appendChild(sentinel);

        sidebarObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !sidebarLoadingMore) {
                loadMoreSidebarVideos(list, sidebarEl);
            }
        }, { root: null, rootMargin: '0px 0px 300px 0px', threshold: 0 });

        sidebarObserver.observe(sentinel);
    }
}

// Load the next page of related videos into the sidebar
function loadMoreSidebarVideos(list, sidebarEl) {
    if (sidebarLoadingMore) return;
    sidebarLoadingMore = true;

    list.querySelector('.sidebar-load-sentinel')?.remove();

    // Case 1: Still have videos in pool – render next batch immediately
    if (sidebarShownCount < sidebarRelatedVideos.length) {
        const added = renderRelatedBatch(list, sidebarRelatedVideos, sidebarShownCount, SIDEBAR_PAGE_SIZE);
        sidebarShownCount += added;
        // Add newly shown video IDs to the fetch queue (for chain-fetching)
        sidebarRelatedVideos
            .slice(sidebarShownCount - added, sidebarShownCount)
            .forEach(rv => {
                if (rv.videoId && !sidebarFetchedIds.has(rv.videoId)) {
                    sidebarFetchQueue.push(rv.videoId);
                    sidebarFetchedIds.add(rv.videoId);
                }
            });
        sidebarLoadingMore = false;
        attachSidebarSentinel(list, sidebarEl);
        return;
    }

    // Case 2: Pool exhausted – fetch related videos of next queued video
    const nextVideoId = sidebarFetchQueue.shift();
    if (!nextVideoId) {
        sidebarLoadingMore = false;
        attachSidebarSentinel(list, sidebarEl);
        return;
    }

    const loadingEl = document.createElement('div');
    loadingEl.className = 'sidebar-loading-indicator';
    loadingEl.innerHTML = `
        <span>Đang tải thêm</span>
        <div class="load-dots"><span></span><span></span><span></span></div>
    `;
    list.appendChild(loadingEl);

    fetchInvidiousRelatedVideos(nextVideoId)
        .then(relatedVideos => {
            loadingEl.remove();
            // Filter out videos already in our pool to avoid duplicates
            const existing = new Set(sidebarRelatedVideos.map(v => v.videoId));
            const newVideos = relatedVideos.filter(rv => !existing.has(rv.videoId));

            // Push new unique videos into pool
            sidebarRelatedVideos.push(...newVideos);

            // Render next batch from the newly added videos
            const added = renderRelatedBatch(list, sidebarRelatedVideos, sidebarShownCount, SIDEBAR_PAGE_SIZE);
            sidebarShownCount += added;

            // Enqueue newly shown video IDs for future chain fetching
            sidebarRelatedVideos
                .slice(sidebarShownCount - added, sidebarShownCount)
                .forEach(rv => {
                    if (rv.videoId && !sidebarFetchedIds.has(rv.videoId)) {
                        sidebarFetchQueue.push(rv.videoId);
                        sidebarFetchedIds.add(rv.videoId);
                    }
                });

            sidebarLoadingMore = false;
            attachSidebarSentinel(list, sidebarEl);
        })
        .catch(() => {
            loadingEl.remove();
            // Try the next video in queue
            sidebarLoadingMore = false;
            if (sidebarFetchQueue.length > 0) {
                loadMoreSidebarVideos(list, sidebarEl);
            } else {
                attachSidebarSentinel(list, sidebarEl);
            }
        });
}

function renderTheaterSidebar(videoId) {
    const recommendedList = document.getElementById('theater-recommended-list');
    const playlistList    = document.getElementById('theater-playlist-list');
    const sidebarEl       = document.querySelector('.theater-sidebar');

    // Reset ALL pagination state
    sidebarRelatedVideos = [];
    sidebarShownCount    = 0;
    sidebarLoadingMore   = false;
    sidebarFetchQueue    = [];
    sidebarFetchedIds    = new Set();
    if (sidebarObserver) { sidebarObserver.disconnect(); sidebarObserver = null; }

    // Seed the fetch queue with the current video so chain-fetch starts from it
    if (videoId) {
        sidebarFetchQueue.push(videoId);
        sidebarFetchedIds.add(videoId);
    }

    // 1. Render Recommended Videos (fetch real ones from API, fallback to seeds)
    if (recommendedList) {
        if (videoId) {
            // Show loading spinner while fetching
            recommendedList.innerHTML = `
                <div style="text-align: center; padding: 30px 0; color: var(--text-muted);">
                    <span style="display:block; animation: heartbeat 1s infinite alternate; font-size:1.5rem; margin-bottom:10px;">💖</span>
                    <p style="font-size: 0.78rem; font-weight: 700;">Đang tải video đề xuất từ YouTube...</p>
                </div>
            `;

            fetchInvidiousRelatedVideos(videoId)
                .then(relatedVideos => {
                    sidebarRelatedVideos = relatedVideos; // store all
                    recommendedList.innerHTML = '';

                    // Render first page
                    const added = renderRelatedBatch(recommendedList, sidebarRelatedVideos, 0, SIDEBAR_PAGE_SIZE);
                    sidebarShownCount = added;

                    // Attach scroll sentinel for next pages
                    attachSidebarSentinel(recommendedList, sidebarEl);
                })
                .catch(err => {
                    console.warn('Related videos API failed, using seeds:', err.message);
                    sidebarRelatedVideos = RECOMMENDED_SEEDS.map(s => ({
                        videoId: s.youtubeId, title: s.title,
                        author: s.artist, lengthSeconds: s.duration
                    }));
                    recommendedList.innerHTML = '';
                    const added = renderRelatedBatch(recommendedList, sidebarRelatedVideos, 0, SIDEBAR_PAGE_SIZE);
                    sidebarShownCount = added;
                    attachSidebarSentinel(recommendedList, sidebarEl);
                });
        } else {
            // No videoId yet — render seeds as first page
            sidebarRelatedVideos = RECOMMENDED_SEEDS.map(s => ({
                videoId: s.youtubeId, title: s.title,
                author: s.artist, lengthSeconds: s.duration
            }));
            recommendedList.innerHTML = '';
            const added = renderRelatedBatch(recommendedList, sidebarRelatedVideos, 0, SIDEBAR_PAGE_SIZE);
            sidebarShownCount = added;
            attachSidebarSentinel(recommendedList, sidebarEl);
        }
    }

    // 2. Render My Playlist
    if (playlistList) {
        playlistList.innerHTML = '';
        playlist.forEach((track, index) => {
            const isActive = index === currentTrackIndex && !tempPlayingTrack;
            const card = buildSidebarCard(
                track.youtubeId, track.title, track.artist, track.duration,
                `https://img.youtube.com/vi/${track.youtubeId}/hqdefault.jpg`,
                { 'data-index': String(index) }
            );
            if (isActive) {
                card.classList.add('active');
                card.style.borderColor = 'var(--accent-red)';
                card.style.backgroundColor = 'var(--light-pink)';
                const titleEl = card.querySelector('.sidebar-card-title');
                const viewsEl = card.querySelector('.sidebar-card-views');
                if (titleEl) titleEl.style.color = 'var(--accent-red)';
                if (viewsEl) {
                    viewsEl.style.color = 'var(--accent-red)';
                    viewsEl.style.fontWeight = '700';
                    viewsEl.textContent = '🌸 Đang phát';
                }
            }
            playlistList.appendChild(card);
        });
    }
}


let tempPlayingTrack = null;
let currentTrackIndex = 0;
let songDuration = playlist[0].duration;
let currentTime = 0;
let progressInterval = null;
let isSeeking = false;
let isMuted = false;

// --- Sidebar Infinite Scroll State ---
let sidebarRelatedVideos = [];  // All related videos fetched from API
let sidebarShownCount    = 0;   // How many are currently rendered
let sidebarLoadingMore   = false;
let sidebarObserver      = null;
let sidebarFetchQueue    = [];  // Queue of videoIds to fetch related videos from next
let sidebarFetchedIds    = new Set(); // Prevent duplicate fetches
const SIDEBAR_PAGE_SIZE  = 5;

// --- Comments Infinite Scroll State ---
let allCommentsPool        = [];   // All comments loaded so far
let commentsShownCount     = 0;    // How many are currently rendered
let commentsLoadingMore    = false;
let commentsObserver       = null;
let commentsContinuation   = null; // Invidious continuation token for next page
let commentsCurrentVideoId = null; // Track which video's comments are loaded
let commentsContainer      = null; // The scrollable parent (theater-comments)
const COMMENTS_PAGE_SIZE   = 10;   // Comments to show per batch

// --- 1. YOUTUBE IFRAME CONTROL VIA POSTMESSAGE ---
function sendYoutubeCommand(func, args = []) {
    const iframe = document.getElementById('youtube-audio-iframe');
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: func,
            args: args
        }), '*');
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// --- YOUTUBE SEARCH & CUSTOM PLAYLIST HELPERS ---

function savePlaylist() {
    try {
        localStorage.setItem('kitty_custom_playlist', JSON.stringify(playlist));
    } catch (e) {
        console.error("Error saving playlist:", e);
    }
}

function renderPlaylist() {
    const container = document.getElementById('playlist-items');
    if (!container) return;
    container.innerHTML = '';
    
    playlist.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = `playlist-item ${index === currentTrackIndex ? 'active' : ''}`;
        item.setAttribute('data-index', index);
        
        // Calculate dynamic stack parameters for unfold animation
        const yOffset = -20 - (index * 25);
        const scale = Math.max(0.75, 0.96 - (index * 0.04));
        const rot = (index % 2 === 0 ? -1.5 : 2.0) + (index * 0.2 * (index % 2 === 0 ? -1 : 1));
        const zIndex = playlist.length - index;
        const delay = 0.12 + (index * 0.1);
        
        item.style.setProperty('--stack-y', `${yOffset}px`);
        item.style.setProperty('--stack-scale', `${scale}`);
        item.style.setProperty('--stack-rot', `${rot}deg`);
        item.style.setProperty('--stack-z', `${zIndex}`);
        item.style.setProperty('--delay', `${delay}s`);
        
        item.innerHTML = `
            <div class="item-track-info" style="flex: 1; text-align: left;">
                <span class="item-title">${track.title}</span>
                <span class="item-artist">${track.artist}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span class="item-duration">${formatTime(track.duration)}</span>
                <button class="delete-track-btn" data-index="${index}" title="Xóa bài hát" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; transition: color 0.2s;"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
        container.appendChild(item);
    });
}

function deleteTrack(index) {
    if (playlist.length <= 1) {
        playlist = [...DEFAULT_PLAYLIST];
        savePlaylist();
        currentTrackIndex = 0;
        loadTrack(0);
        renderPlaylist();
        playCuteSound();
        return;
    }
    
    if (index === currentTrackIndex) {
        playlist.splice(index, 1);
        savePlaylist();
        if (currentTrackIndex >= playlist.length) {
            currentTrackIndex = 0;
        }
        loadTrack(currentTrackIndex);
    } else {
        playlist.splice(index, 1);
        savePlaylist();
        if (index < currentTrackIndex) {
            currentTrackIndex--;
        }
    }
    
    renderPlaylist();
    playCuteSound();
}

function loadPreviewTrack(videoId, title, artist, duration) {
    tempPlayingTrack = {
        title: title,
        artist: artist,
        youtubeId: videoId,
        duration: duration
    };
    
    if (isTheaterMode) {
        updateTheaterDetails(tempPlayingTrack);
    }
    
    songDuration = duration;
    currentTime = 0;
    
    document.getElementById('player-song-title').textContent = title;
    document.getElementById('player-artist-name').textContent = artist;
    document.getElementById('total-time').textContent = formatTime(duration);
    
    const footerSong = document.getElementById('footer-song-title');
    if (footerSong) footerSong.textContent = title;
    
    updateTimelineUI();
    
    // De-highlight active playlist items
    const items = document.querySelectorAll('#playlist-items .playlist-item');
    items.forEach(item => item.classList.remove('active'));
    
    // Automatically switch to Video tab
    const videoTabBtn = document.querySelector('.player-tab-btn[data-player-tab="video-view"]');
    if (videoTabBtn) {
        videoTabBtn.click();
    }
    
    // Update YouTube Iframe Source
    const iframe = document.getElementById('youtube-audio-iframe');
    if (iframe) {
        iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=${isTheaterMode ? 1 : 0}&loop=1&playlist=${videoId}`;
        iframe.onload = () => {
            sendYoutubeCommand('setVolume', [50]);
            if (isMuted) {
                sendYoutubeCommand('mute');
            } else {
                sendYoutubeCommand('unMute');
            }
            if (isPlaying) {
                sendYoutubeCommand('playVideo');
            }
        };
    }
    
    startMusic();
    
    // Close search results and return to playlist
    document.getElementById('search-results-panel').style.display = 'none';
    document.getElementById('playlist-items').style.display = 'flex';
}

// Fallback Invidious Instances list in case registry is down or CORS blocks it
const INVIDIOUS_FALLBACK_INSTANCES = [
    "https://inv.nadeko.net",
    "https://invidious.nerdvpn.de",
    "https://inv.thepixora.com",
    "https://yt.chocolatemoo53.com",
    "https://invidious.tiekoetter.com",
    "https://invidious.f5.si",
    "https://yewtu.be",
    "https://invidious.privacydev.net"
];

async function fetchInvidiousSearch(query) {
    let instances = [...INVIDIOUS_FALLBACK_INSTANCES];
    
    // Try to fetch registry first
    try {
        const response = await fetch('https://api.invidious.io/instances.json?sort_by=type,health');
        if (response.ok) {
            const data = await response.json();
            const healthyList = data
                .filter(inst => inst[1].cors === true && inst[1].api !== false && inst[1].type === 'https' && (!inst[1].monitor || inst[1].monitor.down === false))
                .map(inst => inst[1].uri);
            if (healthyList.length > 0) {
                instances = [...new Set([...healthyList, ...INVIDIOUS_FALLBACK_INSTANCES])];
            }
        }
    } catch (e) {
        console.warn("Could not fetch Invidious registry, using fallback list:", e);
    }
    
    // Sequential fallback retry loop
    const searchQuery = encodeURIComponent(query);
    for (const uri of instances) {
        try {
            console.log(`Searching via: ${uri}`);
            const url = `${uri}/api/v1/search?q=${searchQuery}&type=video`;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (res.ok) {
                const results = await res.json();
                if (Array.isArray(results) && results.length > 0) {
                    return results;
                }
            }
        } catch (err) {
            console.warn(`Instance failed: ${uri}`, err);
        }
    }
    throw new Error("Tất cả máy chủ đều bận. Vui lòng thử lại sau! 🌸");
}

function renderSearchResults(results) {
    const container = document.getElementById('search-results-items');
    if (!container) return;
    container.innerHTML = '';
    
    // Filter only video type results and limit to 5
    const videos = results.filter(item => item.type === 'video').slice(0, 5);
    
    if (videos.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 15px 0; color: var(--text-muted); font-size: 0.75rem; font-weight: 700; width: 100%;">Không tìm thấy bài hát nào! 🌸</div>`;
        return;
    }
    
    videos.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        item.setAttribute('data-video-id', track.videoId);
        item.setAttribute('data-title', track.title);
        item.setAttribute('data-artist', track.author || 'YouTube Audio');
        item.setAttribute('data-duration', track.lengthSeconds || 300);
        
        // Calculate stack variables for animation
        const yOffset = -20 - (index * 25);
        const scale = Math.max(0.75, 0.96 - (index * 0.04));
        const rot = (index % 2 === 0 ? -1.5 : 2.0) + (index * 0.2 * (index % 2 === 0 ? -1 : 1));
        const zIndex = videos.length - index;
        const delay = 0.1 + (index * 0.08);
        
        item.style.setProperty('--stack-y', `${yOffset}px`);
        item.style.setProperty('--stack-scale', `${scale}`);
        item.style.setProperty('--stack-rot', `${rot}deg`);
        item.style.setProperty('--stack-z', `${zIndex}`);
        item.style.setProperty('--delay', `${delay}s`);
        
        const durationStr = formatTime(track.lengthSeconds || 300);
        
        // Check if track already exists in playlist to show checkmark
        const isAdded = playlist.some(t => t.youtubeId === track.videoId);
        const actionHtml = isAdded 
            ? `<span style="color: #2ec4b6;" title="Đã thêm"><i class="fa-solid fa-circle-check" style="font-size: 1.1rem;"></i></span>`
            : `<button class="add-to-playlist-btn" title="Thêm vào playlist" style="background: none; border: none; color: var(--accent-red); cursor: pointer; padding: 2px; transition: transform 0.2s;"><i class="fa-solid fa-circle-plus" style="font-size: 1.1rem;"></i></button>`;
        
        item.innerHTML = `
            <div class="item-track-info" style="flex: 1; text-align: left;">
                <span class="item-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; max-width: 150px;">${track.title}</span>
                <span class="item-artist" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; max-width: 150px;">${track.author || 'YouTube Audio'}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span class="item-duration">${durationStr}</span>
                ${actionHtml}
            </div>
        `;
        
        container.appendChild(item);
    });
}

async function triggerSearch() {
    const input = document.getElementById('playlist-search-input');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;
    
    const playlistItems = document.getElementById('playlist-items');
    const resultsPanel = document.getElementById('search-results-panel');
    const loadingState = document.getElementById('search-results-loading');
    const resultsItems = document.getElementById('search-results-items');
    
    playlistItems.style.display = 'none';
    resultsPanel.style.display = 'block';
    loadingState.style.display = 'flex';
    resultsItems.style.display = 'none';
    
    playCuteSound();
    
    try {
        const results = await fetchInvidiousSearch(query);
        loadingState.style.display = 'none';
        resultsItems.style.display = 'flex';
        renderSearchResults(results);
    } catch (error) {
        loadingState.style.display = 'none';
        resultsItems.style.display = 'flex';
        resultsItems.innerHTML = `
            <div style="text-align: center; padding: 15px 0; color: var(--accent-red); font-size: 0.72rem; font-weight: 700; width: 100%;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.2rem; margin-bottom: 6px; display: block;"></i>
                ${error.message}
            </div>
        `;
    }
}

function handleAddTrackFromSearch(itemEl) {
    const videoId = itemEl.getAttribute('data-video-id');
    const title = itemEl.getAttribute('data-title');
    const artist = itemEl.getAttribute('data-artist');
    const duration = parseInt(itemEl.getAttribute('data-duration'));
    
    let existingIndex = playlist.findIndex(t => t.youtubeId === videoId);
    
    if (existingIndex === -1) {
        const newTrack = {
            title: title,
            artist: artist,
            youtubeId: videoId,
            duration: duration
        };
        playlist.push(newTrack);
        savePlaylist();
        existingIndex = playlist.length - 1;
    }
    
    renderPlaylist();
    
    document.getElementById('search-results-panel').style.display = 'none';
    document.getElementById('playlist-items').style.display = 'flex';
    
    const input = document.getElementById('playlist-search-input');
    if (input) input.value = '';
    
    loadTrack(existingIndex);
}

function startMusic() {
    isPlaying = true;
    sendYoutubeCommand('playVideo');
    
    // Rotate wheels
    document.getElementById('wheel-left').classList.add('spinning');
    document.getElementById('wheel-right').classList.add('spinning');
    document.getElementById('play-icon').className = 'fa-solid fa-pause';
    
    // Start visualizer dancing
    document.querySelectorAll('.v-bar').forEach(bar => bar.classList.add('dancing'));
    
    // Start timeline timer
    startTimeline();
}

function stopMusic() {
    isPlaying = false;
    sendYoutubeCommand('pauseVideo');
    
    // Stop wheels
    document.getElementById('wheel-left').classList.remove('spinning');
    document.getElementById('wheel-right').classList.remove('spinning');
    document.getElementById('play-icon').className = 'fa-solid fa-play';
    
    // Stop visualizer dancing
    document.querySelectorAll('.v-bar').forEach(bar => bar.classList.remove('dancing'));
    
    // Pause timeline timer
    stopTimeline();
}

function loadTrack(index) {
    tempPlayingTrack = null;
    currentTrackIndex = index;
    const track = playlist[currentTrackIndex];
    
    if (isTheaterMode) {
        updateTheaterDetails(track);
    }
    songDuration = track.duration;
    currentTime = 0;
    
    // Update labels in UI
    document.getElementById('player-song-title').textContent = track.title;
    document.getElementById('player-artist-name').textContent = track.artist;
    document.getElementById('total-time').textContent = formatTime(songDuration);
    
    const footerSong = document.getElementById('footer-song-title');
    if (footerSong) footerSong.textContent = track.title;
    
    updateTimelineUI();
    
    // Update active playlist item highlight
    const items = document.querySelectorAll('#playlist-items .playlist-item');
    items.forEach((item, idx) => {
        if (idx === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Bouncy Dynamic Island effect
    const widget = document.getElementById('music-widget');
    if (widget) {
        widget.classList.add('bouncy');
        setTimeout(() => {
            widget.classList.remove('bouncy');
        }, 600);
    }
    
    // Update YouTube Iframe Source
    const iframe = document.getElementById('youtube-audio-iframe');
    if (iframe) {
        iframe.src = `https://www.youtube-nocookie.com/embed/${track.youtubeId}?enablejsapi=1&autoplay=1&controls=${isTheaterMode ? 1 : 0}&loop=1&playlist=${track.youtubeId}`;
        
        // Wait for iframe reload to unmute/volume-control
        iframe.onload = () => {
            sendYoutubeCommand('setVolume', [50]);
            if (isMuted) {
                sendYoutubeCommand('mute');
            } else {
                sendYoutubeCommand('unMute');
            }
            if (isPlaying) {
                sendYoutubeCommand('playVideo');
            }
        };
    }
    
    startMusic();
}

function startTimeline() {
    stopTimeline(); // clear existing if any
    progressInterval = setInterval(() => {
        if (!isSeeking) {
            currentTime++;
            if (currentTime >= songDuration) {
                if (tempPlayingTrack) {
                    stopMusic();
                } else {
                    // Auto next track when current track finished
                    let nextIdx = currentTrackIndex + 1;
                    if (nextIdx >= playlist.length) nextIdx = 0;
                    loadTrack(nextIdx);
                }
            }
            updateTimelineUI();
        }
    }, 1000);
}

function stopTimeline() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

function updateTimelineUI() {
    const progressSlider = document.getElementById('progress-slider');
    const currentTimeText = document.getElementById('current-time');
    
    if (progressSlider) {
        progressSlider.value = (currentTime / songDuration) * 100;
    }
    if (currentTimeText) {
        currentTimeText.textContent = formatTime(currentTime);
    }
}

// Initializing page music controls after DOM loads

// ============================================================
// YOUTUBE SEARCH AUTOCOMPLETE (JSONP)
// ============================================================
function fetchYTSuggestions(query) {
    return new Promise((resolve) => {
        const cbName = `_ytSuggest_${Date.now()}`;
        let settled = false;

        const settle = (data) => {
            if (settled) return;
            settled = true;
            try { delete window[cbName]; } catch(e) {}
            const script = document.querySelector(`script[data-yt-cb="${cbName}"]`);
            if (script) script.remove();
            resolve(data);
        };

        window[cbName] = (response) => {
            // YouTube returns: [query, [ [text, type], ... ], {}]
            const items = Array.isArray(response[1]) ? response[1].map(s => Array.isArray(s) ? s[0] : s) : [];
            settle(items.filter(Boolean).slice(0, 8));
        };

        const script = document.createElement('script');
        script.dataset.ytCb = cbName;
        script.src = `https://suggestqueries-clients6.youtube.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}&callback=${cbName}`;
        script.onerror = () => settle([]);
        document.head.appendChild(script);

        // Fallback timeout
        setTimeout(() => settle([]), 4000);
    });
}

// ============================================================
// ATTACH SEARCH SUGGESTIONS TO AN INPUT
// ============================================================
function attachSearchSuggestions(inputEl, onSearch) {
    if (!inputEl) return;

    // Create dropdown once
    const dropdown = document.createElement('ul');
    dropdown.className = 'search-suggestions-dropdown';
    inputEl.parentElement.appendChild(dropdown);

    let debounceTimer = null;
    let kbdIndex = -1; // keyboard navigation index

    const getItems = () => Array.from(dropdown.querySelectorAll('.suggestion-item'));

    const hideDropdown = () => {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        kbdIndex = -1;
    };

    const showDropdown = (suggestions) => {
        dropdown.innerHTML = '';
        kbdIndex = -1;
        if (!suggestions || suggestions.length === 0) { hideDropdown(); return; }

        suggestions.forEach(text => {
            const li = document.createElement('li');
            li.className = 'suggestion-item';
            li.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i>${text}`;

            li.addEventListener('mousedown', (e) => {
                e.preventDefault(); // prevent blur before click
                inputEl.value = text;
                hideDropdown();
                if (typeof onSearch === 'function') onSearch(text);
            });

            dropdown.appendChild(li);
        });

        dropdown.style.display = 'block';
    };

    // Input → debounce → fetch suggestions
    inputEl.addEventListener('input', () => {
        const q = inputEl.value.trim();
        clearTimeout(debounceTimer);
        if (q.length < 2) { hideDropdown(); return; }

        debounceTimer = setTimeout(async () => {
            const suggestions = await fetchYTSuggestions(q);
            showDropdown(suggestions);
        }, 300);
    });

    // Keyboard navigation
    inputEl.addEventListener('keydown', (e) => {
        const items = getItems();
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            kbdIndex = Math.min(kbdIndex + 1, items.length - 1);
            items.forEach((el, i) => el.classList.toggle('kbd-active', i === kbdIndex));
            if (items[kbdIndex]) inputEl.value = items[kbdIndex].textContent.trim();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            kbdIndex = Math.max(kbdIndex - 1, -1);
            items.forEach((el, i) => el.classList.toggle('kbd-active', i === kbdIndex));
            if (kbdIndex >= 0 && items[kbdIndex]) inputEl.value = items[kbdIndex].textContent.trim();
        } else if (e.key === 'Escape') {
            hideDropdown();
        } else if (e.key === 'Enter') {
            if (kbdIndex >= 0 && items[kbdIndex]) {
                e.preventDefault();
                inputEl.value = items[kbdIndex].textContent.trim();
                hideDropdown();
                if (typeof onSearch === 'function') onSearch(inputEl.value);
            }
        }
    });

    // Hide on blur (slight delay to allow click to fire)
    inputEl.addEventListener('blur', () => setTimeout(hideDropdown, 180));
}

document.addEventListener('DOMContentLoaded', () => {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    const muteIcon = document.getElementById('mute-icon');
    const progressSlider = document.getElementById('progress-slider');
    const enterBtn = document.getElementById('enter-btn');
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const prevTrackBtn = document.getElementById('prev-track-btn');
    const nextTrackBtn = document.getElementById('next-track-btn');

    // Welcome screen enter button click
    if (enterBtn && welcomeOverlay) {
        enterBtn.addEventListener('click', () => {
            // Trigger actual audio play (allowed by browser now that user interacted!)
            startMusic();
            
            // Hide welcome overlay with fade-out transition
            welcomeOverlay.classList.add('fade-out');
            
            // Play cute click synth chime
            playCuteSound();
            
            // Spawn a burst of celebration sparkles in the center!
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            for (let i = 0; i < 40; i++) {
                particles.push(new SparkleParticle(centerX + (Math.random() - 0.5) * 200, centerY + (Math.random() - 0.5) * 100));
            }
        });
    }

    // Cassette play/pause click
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (!isPlaying) {
                startMusic();
            } else {
                stopMusic();
            }
            playCuteSound();
        });
    }

    // Prev Track
    if (prevTrackBtn) {
        prevTrackBtn.addEventListener('click', () => {
            let newIndex = currentTrackIndex - 1;
            if (newIndex < 0) newIndex = playlist.length - 1;
            loadTrack(newIndex);
            playCuteSound();
        });
    }

    // Next Track
    if (nextTrackBtn) {
        nextTrackBtn.addEventListener('click', () => {
            let newIndex = currentTrackIndex + 1;
            if (newIndex >= playlist.length) newIndex = 0;
            loadTrack(newIndex);
            playCuteSound();
        });
    }

    // Mute/Unmute toggle click
    if (muteBtn && muteIcon) {
        muteBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            if (isMuted) {
                sendYoutubeCommand('mute');
                muteIcon.className = 'fa-solid fa-volume-xmark';
                muteBtn.setAttribute('title', 'Bật âm thanh');
            } else {
                sendYoutubeCommand('unMute');
                muteIcon.className = 'fa-solid fa-volume-high';
                muteBtn.setAttribute('title', 'Tắt âm thanh');
            }
            playCuteSound();
        });
    }
    
    // Dragging progress slider (seeking)
    if (progressSlider) {
        progressSlider.addEventListener('input', () => {
            isSeeking = true;
            const sliderVal = parseInt(progressSlider.value);
            const displayTime = Math.round((sliderVal / 100) * songDuration);
            document.getElementById('current-time').textContent = formatTime(displayTime);
        });

        progressSlider.addEventListener('change', () => {
            const sliderVal = parseInt(progressSlider.value);
            currentTime = Math.round((sliderVal / 100) * songDuration);
            updateTimelineUI();
            
            // Tell YouTube to seek to new time
            sendYoutubeCommand('seekTo', [currentTime, true]);
            
            isSeeking = false;
        });
    }
    
    // Set initial volume when iframe loads
    const iframe = document.getElementById('youtube-audio-iframe');
    if (iframe) {
        // Run unMute and volume settings initially
        sendYoutubeCommand('setVolume', [50]);
        sendYoutubeCommand('unMute');
    }

    // Playlist Dynamic Island expand/collapse
    const playlistToggleBtn = document.getElementById('playlist-toggle-btn');
    const widgetPullTab = document.getElementById('widget-pull-tab');
    const musicWidget = document.getElementById('music-widget');
    renderPlaylist();
    const playlistItemsContainer = document.getElementById('playlist-items');

    function togglePlaylist() {
        if (!musicWidget) return;
        const isExpanded = musicWidget.classList.toggle('expanded');
        
        if (widgetPullTab) {
            const pullIcon = document.getElementById('pull-icon');
            if (isExpanded) {
                widgetPullTab.setAttribute('title', 'Thu gọn danh sách phát');
                if (pullIcon) {
                    pullIcon.className = 'fa-solid fa-chevron-up';
                }
            } else {
                widgetPullTab.setAttribute('title', 'Kéo xuống xem danh sách phát');
                if (pullIcon) {
                    pullIcon.className = 'fa-solid fa-chevron-down';
                }
            }
        }
        
        // Squash/stretch bounce
        musicWidget.classList.add('bouncy');
        setTimeout(() => {
            musicWidget.classList.remove('bouncy');
        }, 600);
        
        playCuteSound();
    }

    if (playlistToggleBtn) {
        playlistToggleBtn.addEventListener('click', togglePlaylist);
    }
    
    if (widgetPullTab) {
        widgetPullTab.addEventListener('click', togglePlaylist);
    }

    // Playlist Item click listener (Event delegation with delete action support)
    if (playlistItemsContainer) {
        playlistItemsContainer.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-track-btn');
            if (deleteBtn) {
                e.stopPropagation(); // Stop loading track trigger
                const index = parseInt(deleteBtn.getAttribute('data-index'));
                deleteTrack(index);
                return;
            }
            
            const item = e.target.closest('.playlist-item');
            if (item) {
                const index = parseInt(item.getAttribute('data-index'));
                loadTrack(index);
                playCuteSound();
            }
        });
    }

    // Search Result click listener (Event delegation with play preview vs add tracks support)
    const searchResultsItems = document.getElementById('search-results-items');
    if (searchResultsItems) {
        searchResultsItems.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-to-playlist-btn');
            const item = e.target.closest('.playlist-item');
            if (!item) return;
            
            const videoId = item.getAttribute('data-video-id');
            const title = item.getAttribute('data-title');
            const artist = item.getAttribute('data-artist');
            const duration = parseInt(item.getAttribute('data-duration'));
            
            if (addBtn) {
                e.stopPropagation(); // Stop play preview trigger
                
                // Add to main playlist
                const newTrack = {
                    title: title,
                    artist: artist,
                    youtubeId: videoId,
                    duration: duration
                };
                playlist.push(newTrack);
                savePlaylist();
                
                // Refresh main playlist UI
                renderPlaylist();
                
                // Change add button to checkmark
                const parentDiv = addBtn.parentElement;
                if (parentDiv) {
                    parentDiv.innerHTML = `<span style="color: #2ec4b6;" title="Đã thêm"><i class="fa-solid fa-circle-check" style="font-size: 1.1rem;"></i></span>`;
                }
                
                playCuteSound();
            } else {
                // Play preview directly without permanent playlist addition
                loadPreviewTrack(videoId, title, artist, duration);
                playCuteSound();
            }
        });
    }

    // Search Box events
    const playlistSearchBtn   = document.getElementById('playlist-search-btn');
    const playlistSearchInput = document.getElementById('playlist-search-input');

    if (playlistSearchBtn) {
        playlistSearchBtn.addEventListener('click', triggerSearch);
    }

    if (playlistSearchInput) {
        playlistSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') triggerSearch();
        });
        // Attach YouTube autocomplete suggestions
        attachSearchSuggestions(playlistSearchInput, (text) => {
            playlistSearchInput.value = text;
            triggerSearch();
        });
    }

    // Search Back button
    const searchBackBtn = document.getElementById('search-back-btn');
    if (searchBackBtn) {
        searchBackBtn.addEventListener('click', () => {
            document.getElementById('search-results-panel').style.display = 'none';
            document.getElementById('playlist-items').style.display = 'flex';
            if (playlistSearchInput) playlistSearchInput.value = '';
            playCuteSound();
        });
    }

    // Cassette vs Video player tab switching
    const playerTabBtns = document.querySelectorAll('.player-tab-btn');
    playerTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playerTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetTab = btn.getAttribute('data-player-tab');
            const cassetteView = document.getElementById('cassette-view');
            const videoView = document.getElementById('video-view');
            
            if (targetTab === 'cassette-view') {
                if (cassetteView) cassetteView.style.display = 'block';
                if (videoView) videoView.style.display = 'none';
            } else {
                if (cassetteView) cassetteView.style.display = 'none';
                if (videoView) videoView.style.display = 'block';
            }
            playCuteSound();
        });
    });

    // --- YOUTUBE THEATER MODE INTERACTIVE HANDLERS ---
    
    // 1. Enter and Exit Theater Mode functions
    function enterTheaterMode() {
        isTheaterMode = true;
        
        // Add active classes
        document.body.classList.add('theater-active');
        const widgetContainer = document.getElementById('music-widget-container');
        if (widgetContainer) widgetContainer.classList.add('theater-active');
        
        // Swapping active tab selector to Video tab visually
        playerTabBtns.forEach(b => {
            if (b.getAttribute('data-player-tab') === 'video-view') {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
        
        // Show video-view in DOM
        const cassetteView = document.getElementById('cassette-view');
        const videoView = document.getElementById('video-view');
        if (cassetteView) cassetteView.style.display = 'none';
        if (videoView) videoView.style.display = 'block';
        
        // Show backdrop overlay
        const backdrop = document.getElementById('theater-backdrop');
        if (backdrop) backdrop.style.display = 'block';
        
        // Update details based on currently active track
        const track = tempPlayingTrack || playlist[currentTrackIndex];
        updateTheaterDetails(track);
        
        // Spawn sparkles in the center
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        for (let i = 0; i < 25; i++) {
            particles.push(new SparkleParticle(centerX + (Math.random() - 0.5) * 100, centerY + (Math.random() - 0.5) * 100));
        }
        
        playCuteSound();
    }
    
    function exitTheaterMode() {
        if (!isTheaterMode) return;
        isTheaterMode = false;
        
        // Remove active classes
        document.body.classList.remove('theater-active');
        const widgetContainer = document.getElementById('music-widget-container');
        if (widgetContainer) widgetContainer.classList.remove('theater-active');
        
        // Hide backdrop overlay
        const backdrop = document.getElementById('theater-backdrop');
        if (backdrop) backdrop.style.display = 'none';
        
        // Switch tab back to Cassette (default)
        playerTabBtns.forEach(b => {
            if (b.getAttribute('data-player-tab') === 'cassette-view') {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
        const cassetteView = document.getElementById('cassette-view');
        const videoView = document.getElementById('video-view');
        if (cassetteView) cassetteView.style.display = 'block';
        if (videoView) videoView.style.display = 'none';
        
        // Restore normal search inputs or states if any
        const theaterSearchInput = document.getElementById('theater-search-input');
        if (theaterSearchInput) theaterSearchInput.value = '';
        
        playCuteSound();
    }
    
    // 2. Click events to trigger zoom
    const maxBtn = document.getElementById('maximize-widget-btn');
    if (maxBtn) {
        maxBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            enterTheaterMode();
        });
    }
    
    const inlineZoomBtn = document.getElementById('iframe-zoom-btn');
    if (inlineZoomBtn) {
        inlineZoomBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            enterTheaterMode();
        });
    }
    
    // Close / Minimize
    const closeBtn = document.getElementById('close-theater-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            exitTheaterMode();
        });
    }
    
    const backdropEl = document.getElementById('theater-backdrop');
    if (backdropEl) {
        backdropEl.addEventListener('click', (e) => {
            exitTheaterMode();
        });
    }
    
    // Keyboard Esc key listener
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            exitTheaterMode();
        }
    });
    
    // 3. Description Collapse Toggle
    const descToggleBtn = document.getElementById('theater-desc-toggle');
    const descContentBox = document.getElementById('theater-desc-content');
    if (descToggleBtn && descContentBox) {
        descToggleBtn.addEventListener('click', () => {
            const isCollapsed = descContentBox.classList.toggle('collapsed');
            descToggleBtn.textContent = isCollapsed ? 'Thêm' : 'Thu gọn';
            playCuteSound();
        });
    }
    
    // 4. Subscribe Button Interactive Toggle
    const subscribeBtn = document.getElementById('theater-subscribe-btn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', () => {
            const track = tempPlayingTrack || playlist[currentTrackIndex];
            if (!track) return;
            
            const key = 'kitty_subbed_' + encodeURIComponent(track.artist);
            const isSubbed = localStorage.getItem(key) === 'true';
            
            if (isSubbed) {
                localStorage.setItem(key, 'false');
                subscribeBtn.textContent = 'Đăng ký';
                subscribeBtn.classList.remove('subscribed');
            } else {
                localStorage.setItem(key, 'true');
                subscribeBtn.textContent = 'Đã đăng ký';
                subscribeBtn.classList.add('subscribed');
                
                // Spawn sparkles over the subscribe button
                const rect = subscribeBtn.getBoundingClientRect();
                for (let i = 0; i < 15; i++) {
                    particles.push(new SparkleParticle(rect.left + rect.width/2 + (Math.random() - 0.5) * 40, rect.top + rect.height/2 + (Math.random() - 0.5) * 20));
                }
            }
            playCuteSound();
        });
    }
    
    // 5. Like & Dislike Interactive Toggle
    const likeBtn = document.getElementById('theater-like-btn');
    const dislikeBtn = document.getElementById('theater-dislike-btn');
    const likeCountEl = document.getElementById('like-count');
    
    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            const track = tempPlayingTrack || playlist[currentTrackIndex];
            if (!track) return;
            
            const key = 'kitty_liked_' + (track.youtubeId || track.youtubeId);
            const isLiked = localStorage.getItem(key) === 'true';
            
            const likesCount = getSeededValue(track.youtubeId || track.youtubeId, 5000, 150000);
            const heartIcon = likeBtn.querySelector('i');
            
            const formatShortNumber = (num) => {
                if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
                if (num >= 1000) return (num / 1000).toFixed(1) + "K";
                return num.toString();
            };
            
            if (isLiked) {
                localStorage.setItem(key, 'false');
                likeBtn.classList.remove('liked');
                if (heartIcon) heartIcon.className = 'fa-regular fa-thumbs-up';
                if (likeCountEl) likeCountEl.textContent = formatShortNumber(likesCount);
            } else {
                localStorage.setItem(key, 'true');
                likeBtn.classList.add('liked');
                if (heartIcon) heartIcon.className = 'fa-solid fa-thumbs-up';
                if (likeCountEl) likeCountEl.textContent = formatShortNumber(likesCount + 1);
                
                // Spawn heart burst (floating sparkles) at coordinates
                const rect = likeBtn.getBoundingClientRect();
                for (let i = 0; i < 20; i++) {
                    particles.push(new SparkleParticle(rect.left + rect.width/2 + (Math.random() - 0.5) * 40, rect.top + rect.height/2 + (Math.random() - 0.5) * 20));
                }
                
                // If dislike is active, deactivate it
                if (dislikeBtn) dislikeBtn.classList.remove('active');
            }
            playCuteSound();
        });
    }
    
    if (dislikeBtn) {
        dislikeBtn.addEventListener('click', () => {
            dislikeBtn.classList.toggle('active');
            if (dislikeBtn.classList.contains('active')) {
                // If like is active, deactivate it
                if (likeBtn && likeBtn.classList.contains('liked')) {
                    likeBtn.click(); // toggle back
                }
            }
            playCuteSound();
        });
    }
    
    // 6. Comment Form Interactive submission
    const commentForm = document.getElementById('theater-comment-form');
    const commentInput = document.getElementById('theater-comment-input');
    const commentActions = document.getElementById('comment-form-actions');
    const cancelCommentBtn = document.getElementById('btn-cancel-comment');
    const submitCommentBtn = document.getElementById('btn-submit-comment');
    
    if (commentInput) {
        commentInput.addEventListener('focus', () => {
            if (commentActions) commentActions.style.display = 'flex';
        });
        
        commentInput.addEventListener('input', () => {
            if (submitCommentBtn) {
                submitCommentBtn.disabled = commentInput.value.trim().length === 0;
            }
        });
    }
    
    if (cancelCommentBtn) {
        cancelCommentBtn.addEventListener('click', () => {
            if (commentInput) commentInput.value = '';
            if (commentActions) commentActions.style.display = 'none';
            if (submitCommentBtn) submitCommentBtn.disabled = true;
            playCuteSound();
        });
    }
    
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = commentInput.value.trim();
            if (!text) return;
            
            const track = tempPlayingTrack || playlist[currentTrackIndex];
            if (!track) return;
            
            const videoId = track.youtubeId;
            let userComments = [];
            
            try {
                const saved = localStorage.getItem('kitty_user_comments_' + videoId);
                if (saved) {
                    userComments = JSON.parse(saved);
                }
            } catch (err) {
                userComments = [];
            }
            
            // Add new comment to top
            const newComment = {
                author: "Bạn (Cute User) 🌸",
                avatar: "🌸",
                text: text,
                time: "Vừa xong"
            };
            userComments.unshift(newComment);
            
            // Save to localStorage
            localStorage.setItem('kitty_user_comments_' + videoId, JSON.stringify(userComments));
            
            // Render comments list
            renderComments(videoId);
            
            // Reset form
            commentInput.value = '';
            if (submitCommentBtn) submitCommentBtn.disabled = true;
            if (commentActions) commentActions.style.display = 'none';
            
            // Spawn sparkles on comment input area
            const rect = commentInput.getBoundingClientRect();
            for (let i = 0; i < 12; i++) {
                particles.push(new SparkleParticle(rect.left + rect.width/2 + (Math.random() - 0.5) * 200, rect.top + rect.height/2));
            }
            playCuteSound();
        });
    }
    
    // 7. Sidebar tab switching
    const sidebarTabs = document.querySelectorAll('.sidebar-tab');
    sidebarTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            sidebarTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const paneId = tab.getAttribute('data-sidebar-tab');
            document.querySelectorAll('.sidebar-pane').forEach(pane => {
                if (pane.id === paneId) {
                    pane.style.display = 'block';
                    pane.classList.add('active');
                } else {
                    pane.style.display = 'none';
                    pane.classList.remove('active');
                }
            });
            playCuteSound();
        });
    });
    
    // 8. Sidebar Card Click Listener (delegated inside Recommended list)
    const recommendedList = document.getElementById('theater-recommended-list');
    if (recommendedList) {
        recommendedList.addEventListener('click', (e) => {
            // Check if clicked the add button
            const addBtn = e.target.closest('.sidebar-add-btn');
            const card = e.target.closest('.sidebar-card');
            if (!card) return;
            
            const vidId = card.getAttribute('data-video-id');
            const title = card.getAttribute('data-title');
            const artist = card.getAttribute('data-artist');
            const duration = parseInt(card.getAttribute('data-duration'));
            
            if (addBtn) {
                e.stopPropagation();
                
                // Add to main playlist
                const newTrack = {
                    title: title,
                    artist: artist,
                    youtubeId: vidId,
                    duration: duration
                };
                playlist.push(newTrack);
                savePlaylist();
                
                // Refresh list UI
                renderPlaylist();
                const _curTrack1 = tempPlayingTrack || playlist[currentTrackIndex];
                renderTheaterSidebar(_curTrack1 ? _curTrack1.youtubeId : null);
                
                // Change add button to checkmark
                const parentDiv = addBtn.parentElement;
                if (parentDiv) {
                    parentDiv.innerHTML = `<span style="color: #2ec4b6;" title="Đã thêm"><i class="fa-solid fa-circle-check" style="font-size: 1rem;"></i></span>`;
                }
                
                // Sparkle burst over the card
                const rect = card.getBoundingClientRect();
                for (let i = 0; i < 10; i++) {
                    particles.push(new SparkleParticle(rect.left + rect.width/2, rect.top + rect.height/2));
                }
                
                playCuteSound();
            } else {
                // Play recommended preview track directly inside large player
                loadPreviewTrack(vidId, title, artist, duration);
                playCuteSound();
            }
        });
    }
    
    // 9. Sidebar Card Click Listener (delegated inside My Playlist list)
    const playlistList = document.getElementById('theater-playlist-list');
    if (playlistList) {
        playlistList.addEventListener('click', (e) => {
            const card = e.target.closest('.sidebar-card');
            if (!card) return;
            
            const index = parseInt(card.getAttribute('data-index'));
            loadTrack(index);
            playCuteSound();
        });
    }
    
    // 10. Theater Search Box events
    const theaterSearchBtn = document.getElementById('theater-search-btn');
    const theaterSearchInput = document.getElementById('theater-search-input');
    
    async function triggerTheaterSearch() {
        const query = theaterSearchInput.value.trim();
        if (!query) return;
        
        // Trigger recommended pane active
        const recommendedTab = document.querySelector('.sidebar-tab[data-sidebar-tab="pane-next-up"]');
        if (recommendedTab) recommendedTab.click();
        
        recommendedList.innerHTML = `
            <div style="text-align: center; padding: 40px 0; color: var(--text-muted); width: 100%;">
                <span class="loading-heart" style="font-size: 1.5rem; display: block; animation: heartbeat 1s infinite alternate; width:fit-content; margin: 0 auto 10px;">💖</span>
                <p style="font-size: 0.8rem; font-weight: bold;">Đang tìm nhạc trên YouTube... 🌸</p>
            </div>
        `;
        
        playCuteSound();
        
        try {
            const results = await fetchInvidiousSearch(query);
            renderTheaterSearchResults(results);
        } catch (error) {
            recommendedList.innerHTML = `
                <div style="text-align: center; padding: 20px 0; color: var(--accent-red); font-size: 0.76rem; font-weight: 700; width: 100%;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.2rem; margin-bottom: 6px; display: block;"></i>
                    ${error.message}
                    <button id="theater-search-reset-btn" class="btn btn-secondary" style="margin-top: 10px; padding: 6px 12px; font-size: 0.72rem; border-radius: 50px;">Quay lại</button>
                </div>
            `;
            const resetBtn = document.getElementById('theater-search-reset-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    theaterSearchInput.value = '';
                    const _curTrack2 = tempPlayingTrack || playlist[currentTrackIndex];
                    renderTheaterSidebar(_curTrack2 ? _curTrack2.youtubeId : null);
                    playCuteSound();
                });
            }
        }
    }
    
    function renderTheaterSearchResults(results) {
        recommendedList.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px dashed var(--primary-pink); margin-bottom: 10px;">
                <span style="font-size: 0.76rem; font-weight: 700; color: var(--accent-red);">Kết quả tìm kiếm 🔍</span>
                <button id="theater-search-reset-btn" style="background: none; border: none; color: var(--text-muted); font-size: 0.7rem; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 4px;"><i class="fa-solid fa-arrow-left"></i> Quay lại</button>
            </div>
        `;
        
        const resetBtn = document.getElementById('theater-search-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                theaterSearchInput.value = '';
                const _curTrack3 = tempPlayingTrack || playlist[currentTrackIndex];
                renderTheaterSidebar(_curTrack3 ? _curTrack3.youtubeId : null);
                playCuteSound();
            });
        }
        
        const videos = results.filter(item => item.type === 'video').slice(0, 5);
        if (videos.length === 0) {
            recommendedList.innerHTML += `<div style="text-align: center; padding: 15px 0; color: var(--text-muted); font-size: 0.74rem;">Không tìm thấy bài hát nào! 🌸</div>`;
            return;
        }
        
        videos.forEach(track => {
            const isAdded = playlist.some(t => t.youtubeId === track.videoId);
            const actionHtml = isAdded 
                ? `<span style="color: #2ec4b6;" title="Đã thêm"><i class="fa-solid fa-circle-check" style="font-size: 1rem;"></i></span>`
                : `<button class="sidebar-add-btn" title="Thêm vào playlist" style="background: none; border: none; color: var(--accent-red); cursor: pointer; padding: 4px; transition: transform 0.2s;"><i class="fa-solid fa-circle-plus" style="font-size: 1rem;"></i></button>`;
                
            const card = document.createElement('div');
            card.className = 'sidebar-card';
            card.setAttribute('data-video-id', track.videoId);
            card.setAttribute('data-title', track.title);
            card.setAttribute('data-artist', track.author || 'YouTube Audio');
            card.setAttribute('data-duration', track.lengthSeconds || 300);
            
            card.innerHTML = `
                <div class="sidebar-thumb-wrapper">
                    <img src="https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg" alt="${track.title}">
                    <span class="sidebar-duration-badge">${formatTime(track.lengthSeconds || 300)}</span>
                </div>
                <div class="sidebar-card-info">
                    <span class="sidebar-card-title">${track.title}</span>
                    <span class="sidebar-card-artist">${track.author || 'YouTube Audio'}</span>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; width: 100%;">
                        <span style="font-size: 0.65rem; color: var(--text-muted);">${formatTime(track.lengthSeconds || 300)}</span>
                        ${actionHtml}
                    </div>
                </div>
            `;
            recommendedList.appendChild(card);
        });
    }
    
    if (theaterSearchBtn) {
        theaterSearchBtn.addEventListener('click', triggerTheaterSearch);
    }
    
    if (theaterSearchInput) {
        theaterSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                triggerTheaterSearch();
            }
        });
        // Attach YouTube autocomplete suggestions to theater search
        attachSearchSuggestions(theaterSearchInput, (text) => {
            theaterSearchInput.value = text;
            triggerTheaterSearch();
        });
    }
    
    playCuteSound();
});

// --- 2. SPARKLE CURSOR TRAIL EFFECT ---
const canvas = document.getElementById('sparkle-canvas');
const ctx = canvas.getContext('2d');
// particles đã được khai báo ở đầu file

// Resize canvas to cover window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Particle Class
class SparkleParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        // Random velocity
        this.vx = (Math.random() - 0.5) * 2.5;
        this.vy = (Math.random() - 0.5) * 2.5 - 1; // Slight float up
        this.size = Math.random() * 8 + 3;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
        // Pink pastel color palette
        const colors = ['#FFB7C5', '#FF85A2', '#FF4B72', '#FFE5EC', '#FFFFFF', '#FFE66D'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        this.angle += this.spin;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;

        // Draw star shape
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(0, 0 - this.size);
            ctx.rotate(Math.PI / 5);
            ctx.lineTo(0, 0 - this.size / 2.5);
            ctx.rotate(Math.PI / 5);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

// Track mouse position
window.addEventListener('mousemove', (e) => {
    // Generate particles on mouse movement
    for (let i = 0; i < 2; i++) {
        particles.push(new SparkleParticle(e.clientX, e.clientY));
    }
});

// Touch support for mobile
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        for (let i = 0; i < 2; i++) {
            particles.push(new SparkleParticle(e.touches[0].clientX, e.touches[0].clientY));
        }
    }
});

// Sparkle animation loop
function animateSparkles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        } else {
            particles[i].draw();
        }
    }
    requestAnimationFrame(animateSparkles);
}
animateSparkles();

// --- 3. BOW COLOR CUSTOMIZER ---
const bowBtns = document.querySelectorAll('.bow-btn');
const bowFills = document.querySelectorAll('.bow-fill');
const currentBowName = document.getElementById('current-bow-name');
const avatarContainer = document.querySelector('.kitty-avatar-container');

bowBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        bowBtns.forEach(b => {
            b.classList.remove('active');
            b.classList.remove('rainbow-active');
        });

        // Add active class to clicked button
        btn.classList.add('active');

        // Clear existing rainbow animation if active
        clearInterval(rainbowInterval);
        rainbowInterval = null;

        const color = btn.getAttribute('data-color');
        const title = btn.getAttribute('title');

        // Trigger pop animation on Hello Kitty head
        avatarContainer.classList.add('pop-anim');
        setTimeout(() => {
            avatarContainer.classList.remove('pop-anim');
        }, 500);

        if (color === 'sparkle') {
            btn.classList.add('rainbow-active');
            currentBowName.textContent = 'Phép Thuật Lấp Lánh';
            // Start cycling colors (rainbow effect)
            let hue = 0;
            rainbowInterval = setInterval(() => {
                hue = (hue + 12) % 360;
                bowFills.forEach(fill => {
                    fill.style.fill = `hsl(${hue}, 90%, 65%)`;
                });
                // Spawn sparkles at the bow location
                spawnBowSparkles();
            }, 80);
        } else {
            // Apply standard color
            bowFills.forEach(fill => {
                fill.style.fill = color;
            });
            currentBowName.textContent = title;
        }

        // Cute sound effect (meow/pop simulation via Web Audio API)
        playCuteSound();
    });
});

// Helper to spawn sparkles around Kitty's bow inside the avatar
function spawnBowSparkles() {
    const avatarRect = avatarContainer.getBoundingClientRect();
    // Approximate coordinates of the bow relative to viewport
    const x = avatarRect.left + avatarRect.width * 0.65;
    const y = avatarRect.top + avatarRect.height * 0.25;

    for (let i = 0; i < 3; i++) {
        const offset = (Math.random() - 0.5) * 60;
        particles.push(new SparkleParticle(x + offset, y + offset));
    }
}

// Simple synthesizer sound on button click
function playCuteSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const audioCtx = new AudioContext();
        
        // Simple "Pop/Meow" sound
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'sine';
        // Frequency slide upwards for a cute pop
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
        console.log("AudioContext is blocked by browser policy until user interaction");
    }
}

// --- 4. SWEET TREATS CAROUSEL ---
const track = document.getElementById('carousel-track');
const slides = Array.from(track.children);
const nextBtn = document.getElementById('carousel-next');
const prevBtn = document.getElementById('carousel-prev');
const dotsNav = document.getElementById('carousel-dots');
const dots = Array.from(dotsNav.children);

let slideWidth = slides[0].getBoundingClientRect().width;

// Arrange slides next to each other
const setSlidePosition = (slide, index) => {
    slide.style.left = slideWidth * index + 'px';
};
slides.forEach(setSlidePosition);

// Recalculate slide positions on resize
window.addEventListener('resize', () => {
    slideWidth = slides[0].getBoundingClientRect().width;
    slides.forEach(setSlidePosition);
    moveToSlide(track, track.querySelector('.current-slide'), track.querySelector('.current-slide'));
});

const moveToSlide = (track, currentSlide, targetSlide) => {
    track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
    currentSlide.classList.remove('current-slide');
    targetSlide.classList.add('current-slide');
};

const updateDots = (currentDot, targetDot) => {
    currentDot.classList.remove('current-dot');
    targetDot.classList.add('current-dot');
};

// Next slide logic
nextBtn.addEventListener('click', () => {
    const currentSlide = track.querySelector('.current-slide');
    let nextSlide = currentSlide.nextElementSibling;
    const currentDot = dotsNav.querySelector('.current-dot');
    let nextDot = currentDot.nextElementSibling;

    // Loop back to start if at end
    if (!nextSlide) {
        nextSlide = slides[0];
        nextDot = dots[0];
    }

    moveToSlide(track, currentSlide, nextSlide);
    updateDots(currentDot, nextDot);
});

// Previous slide logic
prevBtn.addEventListener('click', () => {
    const currentSlide = track.querySelector('.current-slide');
    let prevSlide = currentSlide.previousElementSibling;
    const currentDot = dotsNav.querySelector('.current-dot');
    let prevDot = currentDot.previousElementSibling;

    // Loop back to end if at start
    if (!prevSlide) {
        prevSlide = slides[slides.length - 1];
        prevDot = dots[dots.length - 1];
    }

    moveToSlide(track, currentSlide, prevSlide);
    updateDots(currentDot, prevDot);
});

// Dots navigation logic
dotsNav.addEventListener('click', e => {
    const targetDot = e.target.closest('button');
    if (!targetDot) return;

    const currentSlide = track.querySelector('.current-slide');
    const currentDot = dotsNav.querySelector('.current-dot');
    const targetIndex = dots.indexOf(targetDot);
    const targetSlide = slides[targetIndex];

    moveToSlide(track, currentSlide, targetSlide);
    updateDots(currentDot, targetDot);
});

// Auto slide every 5 seconds
let autoSlideInterval = setInterval(() => {
    nextBtn.click();
}, 5000);

// Pause auto slide on hover
const carouselContainer = document.querySelector('.carousel-container');
carouselContainer.addEventListener('mouseenter', () => {
    clearInterval(autoSlideInterval);
});
carouselContainer.addEventListener('mouseleave', () => {
    autoSlideInterval = setInterval(() => {
        nextBtn.click();
    }, 5000);
});

// --- 5. WALLPAPERS LIGHTBOX GRID ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const imgSrc = item.getAttribute('data-src');
        const captionText = item.querySelector('img').getAttribute('alt');
        
        lightbox.style.display = 'block';
        lightboxImg.src = imgSrc;
        lightboxCaption.textContent = captionText;
        
        // Spawn sparkles on open
        for (let i = 0; i < 15; i++) {
            particles.push(new SparkleParticle(window.innerWidth / 2 + (Math.random() - 0.5) * 200, window.innerHeight / 2 + (Math.random() - 0.5) * 200));
        }
    });
});

lightboxClose.addEventListener('click', () => {
    lightbox.style.display = 'none';
});

// Close lightbox on click outside the image
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.style.display = 'none';
    }
});

// --- 6. NEWSLETTER SIGN-UP FORM ---
const clubForm = document.getElementById('club-form');
const clubEmail = document.getElementById('club-email');
const formFeedback = document.getElementById('form-feedback');

clubForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = clubEmail.value.trim();
    if (email) {
        formFeedback.textContent = '🎀 Đang gửi tình yêu thương đến bạn...';
        formFeedback.className = 'form-feedback success';
        
        setTimeout(() => {
            formFeedback.textContent = '✨ Cảm ơn bạn! Đăng ký thành công Sweet Club! Check mail để đón Kitty nhé! 🌸';
            clubEmail.value = '';
            
            // Sparkle burst on successful signup!
            const formRect = clubForm.getBoundingClientRect();
            for (let i = 0; i < 30; i++) {
                particles.push(new SparkleParticle(formRect.left + formRect.width / 2 + (Math.random() - 0.5) * 300, formRect.top + formRect.height / 2 + (Math.random() - 0.5) * 50));
            }
        }, 1200);
    } else {
        formFeedback.textContent = '❌ Vui lòng nhập địa chỉ email hợp lệ!';
        formFeedback.className = 'form-feedback error';
    }
});

// --- 7. HEADER SCROLL & ACTIVE LINK NAVIGATION ---
const header = document.querySelector('.header');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    // 1. Header background blur on scroll
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // 2. Navigation Link Highlighting on Scroll
    let currentSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150; // offset for nav header height
        if (window.scrollY >= sectionTop) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
});

// --- 8. DRESS-UP CUSTOMIZER EXTRA LOGIC ---
const tabBtns = document.querySelectorAll('.custom-tab-btn');
const panes = document.querySelectorAll('.customizer-pane');
const outfitBtns = document.querySelectorAll('.outfit-card-btn');
const outfitGroups = document.querySelectorAll('.outfit-group');
const accBtns = document.querySelectorAll('.acc-card-btn');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-tab');
        document.getElementById(targetTab).classList.add('active');
        playCuteSound();
    });
});

outfitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        outfitBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const selectedOutfit = btn.getAttribute('data-outfit');
        outfitGroups.forEach(group => {
            group.style.display = 'none';
        });
        
        const outfitEl = document.getElementById(selectedOutfit);
        if (outfitEl) outfitEl.style.display = 'block';
        
        avatarContainer.classList.add('pop-anim');
        setTimeout(() => {
            avatarContainer.classList.remove('pop-anim');
        }, 500);
        
        playCuteSound();
        spawnOutfitSparkles();
    });
});

function spawnOutfitSparkles() {
    const avatarRect = avatarContainer.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
        particles.push(new SparkleParticle(
            avatarRect.left + avatarRect.width / 2 + (Math.random() - 0.5) * 120,
            avatarRect.top + avatarRect.height / 2 + (Math.random() - 0.5) * 120
        ));
    }
}

accBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const accId = btn.getAttribute('data-acc');
        const accEl = document.getElementById(accId);
        
        if (btn.classList.contains('active')) {
            btn.classList.remove('active');
            if (accEl) accEl.style.display = 'none';
        } else {
            btn.classList.add('active');
            if (accEl) accEl.style.display = 'block';
            
            // Sparkles
            const avatarRect = avatarContainer.getBoundingClientRect();
            for (let i = 0; i < 6; i++) {
                particles.push(new SparkleParticle(
                    avatarRect.left + avatarRect.width / 2 + (Math.random() - 0.5) * 80,
                    avatarRect.top + avatarRect.height / 2 + (Math.random() - 0.5) * 80
                ));
            }
        }
        
        avatarContainer.classList.add('pop-anim');
        setTimeout(() => {
            avatarContainer.classList.remove('pop-anim');
        }, 500);
        
        playCuteSound();
    });
});

// --- 9. FORTUNE CANDY JAR LOGIC ---
const candyJar = document.getElementById('candy-jar');
const fortuneDisplay = document.getElementById('fortune-display');

const kittyQuotes = [
    "Hôm nay là một ngày tuyệt vời để mỉm cười thật tươi! 🌸",
    "Hãy luôn nhớ rằng: Bạn là người vô cùng đặc biệt và đáng yêu! 💕",
    "Một chiếc bánh táo nướng nóng hổi sẽ làm ngày hôm nay ngọt ngào hơn! 🥧",
    "Gửi đến bạn một cái ôm thật ấm áp và chiếc nơ hồng may mắn nhất! 🎀",
    "Hãy chia sẻ niềm vui với những người xung quanh nhé, hạnh phúc sẽ nhân đôi! 🐱",
    "Mọi chuyện rồi sẽ tốt đẹp thôi, ngày mai bầu trời lại sáng lấp lánh! ✨",
    "Cảm ơn vì bạn đã luôn là người bạn tuyệt vời nhất của tớ! 💖",
    "Lắng nghe một bản nhạc lofi ngọt ngào và tự thưởng cho mình một tách trà ấm nhé! 🍵",
    "Những điều nhỏ bé dễ thương đang chờ đón bạn trong ngày hôm nay! 🎈"
];

if (candyJar && fortuneDisplay) {
    candyJar.addEventListener('click', () => {
        if (candyJar.classList.contains('wobble')) return;
        
        candyJar.classList.add('wobble');
        playCuteSound();
        
        // Spawn sparkles flying towards the fortune board
        const jarRect = candyJar.getBoundingClientRect();
        const startX = jarRect.left + jarRect.width / 2;
        const startY = jarRect.top + jarRect.height / 2;
        
        for (let i = 0; i < 15; i++) {
            const p = new SparkleParticle(startX, startY);
            p.vx = (Math.random() - 0.2) * 5 + 4; // Fly towards right
            p.vy = (Math.random() - 0.5) * 8 - 4;
            p.size = Math.random() * 8 + 4;
            particles.push(p);
        }
        
        setTimeout(() => {
            const randomIdx = Math.floor(Math.random() * kittyQuotes.length);
            const quote = kittyQuotes[randomIdx];
            
            fortuneDisplay.innerHTML = `
                <div class="fortune-quote-content">
                    <div style="font-size: 2.8rem; margin-bottom: 12px;">🍬</div>
                    <p>"${quote}"</p>
                </div>
            `;
            
            // Sparkles around board
            const boardRect = fortuneDisplay.getBoundingClientRect();
            for (let i = 0; i < 10; i++) {
                particles.push(new SparkleParticle(
                    boardRect.left + boardRect.width / 2 + (Math.random() - 0.5) * 150,
                    boardRect.top + boardRect.height / 2 + (Math.random() - 0.5) * 100
                ));
            }
            
            candyJar.classList.remove('wobble');
        }, 600);
    });
}

// --- 10. 3D FLIPPING DIARY BOOK LOGIC ---
const bookNextBtn = document.getElementById('book-next-btn');
const bookPrevBtn = document.getElementById('book-prev-btn');
const diaryBook = document.getElementById('diary-book');
const pages = document.querySelectorAll('.page');

let activePageIndex = 0; // 0: cover, 1: page 2, 2: page 3
const maxPages = 3;

// Initialize z-index of pages
pages.forEach((page, index) => {
    page.style.zIndex = maxPages - index;
});

function updateBookNavigation() {
    if (bookPrevBtn && bookNextBtn) {
        bookPrevBtn.disabled = (activePageIndex === 0);
        bookNextBtn.disabled = (activePageIndex === maxPages - 1);
    }
}

if (bookNextBtn && bookPrevBtn) {
    bookNextBtn.addEventListener('click', () => {
        if (activePageIndex < maxPages - 1) {
            const currentPage = document.getElementById(`page-${activePageIndex + 1}`);
            if (currentPage) {
                currentPage.classList.add('flipped');
                currentPage.style.zIndex = activePageIndex + 1;
            }
            activePageIndex++;
            updateBookNavigation();
            playCuteSound();
        }
    });

    bookPrevBtn.addEventListener('click', () => {
        if (activePageIndex > 0) {
            const prevPage = document.getElementById(`page-${activePageIndex}`);
            if (prevPage) {
                prevPage.classList.remove('flipped');
                prevPage.style.zIndex = maxPages - activePageIndex + 1;
            }
            activePageIndex--;
            updateBookNavigation();
            playCuteSound();
        }
    });
}

// --- 11. APPLE PIE CLICKER GAME LOGIC ---
const clickPie = document.getElementById('click-pie');
const pieCountDisplay = document.getElementById('pie-count');
const piesPerSecondDisplay = document.getElementById('pies-per-second');

let pieState = {
    pies: 0,
    clickPower: 1,
    piesPerSecond: 0,
    upgrades: {
        click: { cost: 15, qty: 0, val: 1 },
        oven: { cost: 50, qty: 0, val: 1 },
        mimmy: { cost: 250, qty: 0, val: 5 },
        gold: { cost: 1000, qty: 0, val: 25 }
    }
};

// Load saved clicker state
if (localStorage.getItem('kittyPieState')) {
    try {
        const saved = JSON.parse(localStorage.getItem('kittyPieState'));
        if (saved && typeof saved === 'object') {
            // Restore upgrade costs as well
            pieState.pies = saved.pies || 0;
            pieState.clickPower = saved.clickPower || 1;
            pieState.piesPerSecond = saved.piesPerSecond || 0;
            if (saved.upgrades) {
                Object.keys(saved.upgrades).forEach(k => {
                    if (pieState.upgrades[k] && saved.upgrades[k]) {
                        pieState.upgrades[k].cost = saved.upgrades[k].cost;
                        pieState.upgrades[k].qty = saved.upgrades[k].qty;
                    }
                });
            }
        }
    } catch (e) {
        console.error("Failed to parse clicker state from storage");
    }
}

function updatePieUI() {
    if (pieCountDisplay) {
        pieCountDisplay.textContent = Math.floor(pieState.pies).toLocaleString('vi-VN');
    }
    if (piesPerSecondDisplay) {
        piesPerSecondDisplay.textContent = `${pieState.piesPerSecond} pies/sec`;
    }
    
    // Check upgrades affordability
    const upgrades = ['click', 'oven', 'mimmy', 'gold'];
    upgrades.forEach(key => {
        const btn = document.getElementById(`upgrade-${key}`);
        const qtyDisplay = document.getElementById(`qty-${key}`);
        
        if (btn && qtyDisplay) {
            const up = pieState.upgrades[key];
            qtyDisplay.textContent = up.qty;
            
            const costSpan = btn.querySelector('.shop-cost');
            if (costSpan) {
                costSpan.textContent = `Cost: ${up.cost} pies`;
            }
            
            if (pieState.pies >= up.cost) {
                btn.disabled = false;
            } else {
                btn.disabled = true;
            }
        }
    });
}

function savePieState() {
    localStorage.setItem('kittyPieState', JSON.stringify(pieState));
}

if (clickPie) {
    clickPie.addEventListener('click', (e) => {
        pieState.pies += pieState.clickPower;
        updatePieUI();
        savePieState();
        playCuteSound();
        spawnClickPoints(e, pieState.clickPower);
        
        // Spawn small pie sparkles
        const rect = clickPie.getBoundingClientRect();
        for (let i = 0; i < 4; i++) {
            particles.push(new SparkleParticle(
                rect.left + rect.width / 2 + (Math.random() - 0.5) * 60,
                rect.top + rect.height / 2 + (Math.random() - 0.5) * 60
            ));
        }
    });
}

function spawnClickPoints(e, value) {
    const clickArea = document.querySelector('.pie-click-area');
    if (!clickArea) return;
    
    const rect = clickArea.getBoundingClientRect();
    let x, y;
    if (e) {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    } else {
        x = rect.width / 2;
        y = rect.height / 2;
    }
    
    const point = document.createElement('span');
    point.className = 'click-point';
    point.style.left = `${x}px`;
    point.style.top = `${y}px`;
    point.textContent = `+${value}`;
    
    clickArea.appendChild(point);
    
    setTimeout(() => {
        point.remove();
    }, 800);
}

// Upgrade shop purchase logic
const shopKeys = ['click', 'oven', 'mimmy', 'gold'];
shopKeys.forEach(key => {
    const btn = document.getElementById(`upgrade-${key}`);
    if (btn) {
        btn.addEventListener('click', () => {
            const up = pieState.upgrades[key];
            if (pieState.pies >= up.cost) {
                pieState.pies -= up.cost;
                up.qty++;
                
                // Increase benefit
                if (key === 'click') {
                    pieState.clickPower += up.val;
                } else {
                    pieState.piesPerSecond += up.val;
                }
                
                // Increase cost
                up.cost = Math.round(up.cost * 1.15);
                
                updatePieUI();
                savePieState();
                playCuteSound();
                
                // Spawn shop purchase sparkles
                const btnRect = btn.getBoundingClientRect();
                for (let i = 0; i < 15; i++) {
                    particles.push(new SparkleParticle(
                        btnRect.left + btnRect.width / 2 + (Math.random() - 0.5) * 120,
                        btnRect.top + btnRect.height / 2 + (Math.random() - 0.5) * 40
                    ));
                }
            }
        });
    }
});

// Auto bake interval (smooth ticking every 100ms)
setInterval(() => {
    if (pieState.piesPerSecond > 0) {
        pieState.pies += pieState.piesPerSecond / 10;
        updatePieUI();
    }
}, 100);

// Initialize Clicker UI
updatePieUI();


// --- 12. NIGHT MODE / DARK MODE THEME TOGGLER ---
const themeToggle = document.getElementById('theme-toggle');

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-theme');
    const openEyes = document.getElementById('kitty-eyes-open');
    const closedEyes = document.getElementById('kitty-eyes-closed');
    const pajamasOutfit = document.getElementById('dress-pajamas');
    
    if (isDark) {
        if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        if (openEyes) openEyes.style.display = 'none';
        if (closedEyes) closedEyes.style.display = 'block';
        
        // Force pajama outfit
        document.querySelectorAll('.outfit-group').forEach(group => {
            group.style.display = 'none';
        });
        if (pajamasOutfit) pajamasOutfit.style.display = 'block';
        
        // Deactivate all dress-up outfits in menu
        document.querySelectorAll('.outfit-card-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Create stars sky
        let starSky = document.getElementById('star-sky');
        if (!starSky) {
            starSky = document.createElement('div');
            starSky.className = 'star-sky-bg';
            starSky.id = 'star-sky';
            document.body.appendChild(starSky);
            
            for (let i = 0; i < 60; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.left = `${Math.random() * 100}%`;
                star.style.top = `${Math.random() * 100}%`;
                const size = Math.random() * 3 + 1;
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                star.style.animationDelay = `${Math.random() * 2}s`;
                starSky.appendChild(star);
            }
        }
    } else {
        if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        if (openEyes) openEyes.style.display = 'block';
        if (closedEyes) closedEyes.style.display = 'none';
        
        // Restore denim default outfit
        document.querySelectorAll('.outfit-group').forEach(group => {
            group.style.display = 'none';
        });
        const denim = document.getElementById('dress-denim');
        if (denim) denim.style.display = 'block';
        
        // Set denim card active
        document.querySelectorAll('.outfit-card-btn').forEach(btn => {
            if (btn.getAttribute('data-outfit') === 'dress-denim') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        const starSky = document.getElementById('star-sky');
        if (starSky) {
            starSky.remove();
        }
    }
    
    // Save state
    localStorage.setItem('kittyDarkMode', isDark);
    
    playCuteSound();
    
    // Spawn dark mode transitions sparkles
    for (let i = 0; i < 20; i++) {
        particles.push(new SparkleParticle(
            window.innerWidth / 2 + (Math.random() - 0.5) * 300,
            window.innerHeight / 2 + (Math.random() - 0.5) * 300
        ));
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', toggleDarkMode);
}

// Restore theme on DOMContentLoaded
const savedDark = localStorage.getItem('kittyDarkMode') === 'true';
if (savedDark) {
    document.body.classList.add('dark-theme');
    if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    
    const openEyes = document.getElementById('kitty-eyes-open');
    const closedEyes = document.getElementById('kitty-eyes-closed');
    const pajamasOutfit = document.getElementById('dress-pajamas');
    
    if (openEyes) openEyes.style.display = 'none';
    if (closedEyes) closedEyes.style.display = 'block';
    
    document.querySelectorAll('.outfit-group').forEach(group => {
        group.style.display = 'none';
    });
    if (pajamasOutfit) pajamasOutfit.style.display = 'block';
    
    document.querySelectorAll('.outfit-card-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Star sky
    const starSky = document.createElement('div');
    starSky.className = 'star-sky-bg';
    starSky.id = 'star-sky';
    document.body.appendChild(starSky);
    for (let i = 0; i < 60; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starSky.appendChild(star);
    }
}
