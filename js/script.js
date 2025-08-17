const translations = {
    'en': {
        'nav_logo': "NEGEV LOVERS",
        'nav_home': "Home",
        'nav_gallery': "Gallery",
        'nav_games': "Games",
        'nav_game_whack': "Whack-a-Negev",
        'main_title': "THE OFFICIAL NEGEV LOVERS SITE",
        'subtitle': "Because in life, there's the Negev, and then there's everything else.",
        'manifesto_title': "Why Negev? Because...",
        'manifesto_items': [
            "150 bullets. Any questions?",
            "Aiming is a bad habit, not a skill.",
            "The most guaranteed way to crush enemy morale.",
            "Your bullets spread on the wall like a work of art.",
            "The king of price/performance."
        ],
        'interactive_title': "Should I Buy a Negev?",
        'interactive_button': "Decıde!",
        'negev_decisions': [
            "YES! It's a mistake to even think about it.",
            "Absolutely! The enemy team isn't ready for this.",
            "Of course! Is there a better investment for that money?",
            "BUY IT! Who needs a silenced M4A1-S anyway?",
            "Just press the trigger, it'll do the rest.",
            "Even if your economy is bad, buy it. At least you'll have plenty of ammo.",
            "Yes, because why not?"
        ],
        'gallery_title': "Negev Skin Gallery",
        'skin_desc_mjolnir': "A pricey but powerful skin, inspired by Norse mythology. A true collector's item.",
        'skin_desc_loudmouth': "This one is for those who want to be seen and heard. As subtle as a rock concert.",
        'skin_desc_powerloader': "Inspired by industrial machinery, this skin means business.",
        'skin_desc_bratatat': "A comic-book style skin that screams action. Pew pew pew!",
        'skin_desc_anodized': "A simple, clean, and elegant blue finish. For the minimalist Negev lover.",
        'skin_desc_desertstrike': "A battle-scarred veteran. Perfect for holding down a dusty chokepoint.",
        'whack_game_title': "Whack-a-Negev",
        'ui_score': "Score",
        'ui_ammo': "Ammo",
        'ui_start_button': "Start Game",
        'ui_game_over': "Game Over! Your score"
    },
    'tr': {
        'nav_logo': 'NEGEV SEVDALILARI',
        'nav_home': 'Ana Sayfa',
        'nav_gallery': 'Galeri',
        'nav_games': 'Oyunlar',
        'nav_game_whack': 'Negev Vurmaca',
        'main_title': 'NEGEV SEVDALILARI RESMİ SİTESİ',
        'subtitle': 'Çünkü hayatta Negev ve diğerleri vardır.',
        'manifesto_title': 'Neden Negev? Çünkü...',
        'manifesto_items': [
            '150 mermi. Sorusu olan?',
            'Nişan almak yetenek değil, alışkanlıktır. Kötü alışkanlık.',
            'Düşmanın moralini bozmanın en garantili yolu.',
            'Mermileriniz duvara bir sanat eseri gibi yayılır.',
            'Fiyat/performansın kralıdır.'
        ],
        'interactive_title': 'Negev Almalı mıyım?',
        'interactive_button': 'Karar Ver!',
        'negev_decisions': [
            'EVET! Düşünmen bile hata.',
            'Kesinlikle! Rakip takımın buna hazır olduğunu sanmıyorum.',
            'Tabii ki! O paraya daha iyi bir yatırım mı var?',
            'AL! Susturuculu M4A1-S de neymiş?',
            'Bas tetiğe, gerisini o halleder.',
            'Ekonomin kötüyse bile al, en azından mermin çok olur.',
            'Evet, çünkü neden olmasın?'
        ],
        'gallery_title': 'Negev Skin Galerisi',
        'skin_desc_mjolnir': 'Pahalı ama güçlü bir skin. İskandinav mitolojisinden esinlenilmiştir. Gerçek bir koleksiyon parçası.',
        'skin_desc_loudmouth': 'Görülmek ve duyulmak isteyenler için. Bir rock konseri kadar dikkat çekici.',
        'skin_desc_powerloader': 'Endüstriyel makinelerden ilham alan bu skin, işini ciddiye aldığını gösterir.',
        'skin_desc_bratatat': 'Aksiyon diye bağıran bir çizgi roman tarzı skin. Piu piu piu!',
        'skin_desc_anodized': 'Basit, temiz ve zarif bir mavi kaplama. Minimalist Negev sevenler için.',
        'skin_desc_desertstrike': 'Savaş görmüş bir gazi. Tozlu bir geçidi tutmak için mükemmel.',
        'whack_game_title': 'Negev Vurmaca',
        'ui_score': 'Puan',
        'ui_ammo': 'Mermi',
        'ui_start_button': 'Oyunu Başlat',
        'ui_game_over': 'Oyun Bitti! Puanın',
        'ui_speed': 'Hız',
        'ui_frequency': 'Sıklık'
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;
    document.getElementById('lang-select').value = lang;
    document.querySelectorAll('[data-i18n-key]').forEach(element => {
        const key = element.getAttribute('data-i18n-key');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Page-specific elements - check if they exist before modifying
    const manifestoList = document.getElementById('manifesto-list');
    if (manifestoList) {
        manifestoList.innerHTML = '';
        translations[lang].manifesto_items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            manifestoList.appendChild(li);
        });
    }
    
    const decisionResult = document.getElementById('decision-result');
    if (decisionResult) {
        decisionResult.textContent = '';
    }
}

function shouldIBuyNegev() {
    const resultElement = document.getElementById('decision-result');
    if (!resultElement) return;
    const decisions = translations[currentLang].negev_decisions;
    const randomIndex = Math.floor(Math.random() * decisions.length);
    resultElement.textContent = decisions[randomIndex];
}

function openLightbox(imgSrc, title, descKey) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');

    lightboxImg.src = imgSrc;
    lightboxTitle.textContent = title;
    lightboxDesc.textContent = translations[currentLang][descKey];

    lightbox.style.display = 'flex';
}

function closeLightbox(event) {
    const lightbox = document.getElementById('lightbox');
    if (event) {
        event.stopPropagation();
    }
    if (lightbox) {
        lightbox.style.display = 'none';
    }
}

// --- GLOBAL INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Set language for all pages
    setLanguage('en');
});