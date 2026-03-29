(function () {
  function get(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce(function (acc, key) { return acc == null ? undefined : acc[key]; }, obj);
  }

  function setText(el, value) {
    if (el && value !== undefined && value !== null) el.textContent = value;
  }

  function setHTML(el, value) {
    if (el && value !== undefined && value !== null) el.innerHTML = value;
  }

  function setHref(el, value) {
    if (el && value) el.setAttribute('href', value);
  }

  function setSrc(el, value) {
    if (el && value) {
      el.setAttribute('src', value);
      if (el.hasAttribute('srcset')) el.setAttribute('srcset', value);
    }
  }

  function fetchJson(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('Failed to load ' + url);
      return r.json();
    });
  }

  function updateMeta(meta) {
    if (!meta) return;
    if (meta.title) document.title = meta.title;
    var mappings = [
      ['meta[name="description"]', meta.description],
      ['meta[property="og:title"]', meta.og_title || meta.title],
      ['meta[property="og:description"]', meta.og_description || meta.description],
      ['meta[property="og:image"]', meta.og_image],
      ['meta[property="twitter:title"]', meta.twitter_title || meta.title],
      ['meta[property="twitter:description"]', meta.twitter_description || meta.description],
      ['meta[property="twitter:image"]', meta.twitter_image || meta.og_image]
    ];
    mappings.forEach(function (pair) {
      var el = document.querySelector(pair[0]);
      if (el && pair[1]) el.setAttribute('content', pair[1]);
    });
  }

  function resolvePage() {
    var p = location.pathname.replace(/\/$/, '');
    if (!p || p === '') return { kind: 'page', slug: 'home' };
    var parts = p.split('/').filter(Boolean);
    var last = (parts[parts.length - 1] || '').replace(/\.html$/, '');
    if (parts[0] === 'works' && parts.length >= 2) return { kind: 'work', slug: last };
    return { kind: 'page', slug: last || 'home' };
  }

  function applyGlobal(settings) {
    if (!settings) return;
    var navLogoLinks = document.querySelectorAll('.logo-link-wrapper');
    navLogoLinks.forEach(function (a) { if (a.classList.contains('w-nav-brand')) setHref(a, settings.nav.logo.href); });
    document.querySelectorAll('img.logo').forEach(function (img) { setSrc(img, settings.nav.logo.src); if (settings.nav.logo.alt) img.alt = settings.nav.logo.alt; });

    var navWrappers = document.querySelectorAll('.nav-menu .nav-link-wrapper');
    settings.nav.items.forEach(function (item, idx) {
      var wrap = navWrappers[idx];
      if (!wrap) return;
      wrap.querySelectorAll('a').forEach(function (a) { setHref(a, item.href); setText(a, item.label); });
    });

    var footerLogoLink = document.querySelector('.footer-logo-link-wrapper');
    setHref(footerLogoLink, settings.footer.logo.href);
    var footerLogo = document.querySelector('img.footer-logo');
    setSrc(footerLogo, settings.footer.logo.src);
    if (footerLogo && settings.footer.logo.alt) footerLogo.alt = settings.footer.logo.alt;
    setText(document.querySelector('.footer-block p'), settings.footer.tagline);

    var footerUtilityWrappers = document.querySelectorAll('.footer-right-flex .footer-wrapper:nth-of-type(3) .footer-link-wrapper');
    if (footerUtilityWrappers[0]) { var a = footerUtilityWrappers[0].querySelector('a.footer-link'); setHref(a, settings.footer.address.href); setText(a, settings.footer.address.label); }
    if (footerUtilityWrappers[1]) { var a = footerUtilityWrappers[1].querySelector('a.footer-link'); setHref(a, settings.footer.phone.href); setText(a, settings.footer.phone.label); }
    if (footerUtilityWrappers[2]) { var a = footerUtilityWrappers[2].querySelector('a.footer-link'); setHref(a, settings.footer.email.href); setText(a, settings.footer.email.label); }
    if (footerUtilityWrappers[3]) { var a = footerUtilityWrappers[3].querySelector('a.footer-link'); setText(a, settings.footer.hours); }
    setText(document.querySelector('.footer-bottom p'), settings.footer.copyright);
  }

  function applyShared(shared) {
    if (!shared) return;
    document.querySelectorAll('.cta-block').forEach(function (block) {
      setText(block.querySelector('.cta-text-block h5'), shared.cta.label);
      var large = block.querySelectorAll('.cta-text-block .cta-large');
      if (large[0]) setText(large[0], shared.cta.line_1);
      if (large[1]) setText(large[1], shared.cta.line_2);
      setHref(block.querySelector('a.button-with-circle-icon'), shared.cta.button_href);
      var buttonTexts = block.querySelectorAll('.button-text, .button-text-absolute');
      buttonTexts.forEach(function (el) { setText(el, shared.cta.button_label); });
    });

    var serviceCards = document.querySelectorAll('.services-card');
    if (serviceCards.length && shared.services && shared.services.cards) {
      setText(document.querySelector('.services-wrapper.slide-from-right-animation h5'), shared.services.eyebrow);
      setText(document.querySelector('.services-title'), shared.services.title);
      setText(document.querySelector('.services-wrapper.slide-from-left-animation > p'), shared.services.tagline);
      shared.services.cards.forEach(function (card, idx) {
        var el = serviceCards[idx];
        if (!el) return;
        setText(el.querySelector('h4'), card.title);
        setText(el.querySelector('.services-text-block p'), card.body);
        setSrc(el.querySelector('img.services-image'), card.image);
      });
    }

    var faqSection = document.querySelector('.faq-wrapper');
    if (faqSection && shared.faq) {
      var titleFlex = faqSection.parentElement.querySelector('.title-flex');
      if (titleFlex) {
        setText(titleFlex.querySelector('h1'), shared.faq.title);
        setText(titleFlex.querySelector('h5'), shared.faq.subtitle);
      }
      var items = faqSection.querySelectorAll('.faq-dropdown');
      shared.faq.items.forEach(function (item, idx) {
        var el = items[idx];
        if (!el) return;
        setText(el.querySelector('.faq-question'), item.question);
        setText(el.querySelector('.dropdown-answer p'), item.answer);
      });
    }

    var metricsEls = document.querySelectorAll('.stats-number-block, .stats-item, .stats-block');
    if (metricsEls.length && shared.metrics) {
      shared.metrics.forEach(function (m, idx) {
        var el = metricsEls[idx];
        if (!el) return;
        var num = el.querySelector('h2');
        var label = el.querySelector('p, h5');
        setText(num, m.value);
        if (label) setText(label, m.label);
      });
    }
  }

  function applyHome(page) {
    setHref(document.querySelector('.hero-wrapper a.arrow-border-wrapper'), page.hero.cta_href);
    var brandImgs = document.querySelectorAll('.brands-grid .logos-wrapper img');
    (page.brands || []).forEach(function (b, idx) { if (brandImgs[idx]) setSrc(brandImgs[idx], b.src); });
    document.querySelectorAll('.works-title-wrapper h2').forEach(function (el) { setText(el, page.works_title); });
    var cards = document.querySelectorAll('.works-block');
    (page.featured_works || []).forEach(function (work, idx) {
      var card = cards[idx];
      if (!card) return;
      setHref(card.querySelector('a.works-link-wrapper'), work.href);
      setSrc(card.querySelector('.works-image-wrapper img'), work.image);
      setText(card.querySelector('.works-text-block h3'), work.title);
      var badges = card.querySelectorAll('.works-badge h5');
      if (badges[0]) setText(badges[0], work.badge_1);
      if (badges[1]) setText(badges[1], work.badge_2);
    });
    var slides = document.querySelectorAll('.reviews-slide');
    (page.testimonials || []).forEach(function (item, idx) {
      var slide = slides[idx];
      if (!slide) return;
      setText(slide.querySelector('h4'), item.quote);
      var nameBlock = slide.querySelectorAll('.review-name-block h5');
      if (nameBlock[0]) setText(nameBlock[0], item.name);
      if (nameBlock[1]) setText(nameBlock[1], item.role);
      var imgs = slide.querySelectorAll('img');
      if (imgs.length) setSrc(imgs[imgs.length - 1], item.image);
    });
  }

  function applyAbout(page) {
    setText(document.querySelector('.about-hero-wrapper h5'), page.hero.eyebrow);
    setText(document.querySelector('.about-hero-block h1'), page.hero.heading);
    setHTML(document.querySelector('.about-hero-wrapper p'), page.hero.body_html);
    setSrc(document.querySelector('.about-hero-flex > img'), page.hero.image);

    var storyWrap = document.querySelector('.story-title-wrapper');
    if (storyWrap && page.story) {
      setText(storyWrap.querySelector('.title-flex-wrapper h5'), page.story.title_prefix);
      setText(storyWrap.querySelector('.title-flex-wrapper h2'), page.story.title);
      setText(storyWrap.querySelector('.story-text-block h5'), page.story.eyebrow);
      setText(storyWrap.querySelector('.story-text-block p'), page.story.summary);
    }
    var rich = document.querySelector('.sticky-rich-text.w-richtext, .story-rich-text.w-richtext, .w-richtext');
    if (rich && page.story && page.story.body_html) setHTML(rich, page.story.body_html);
    if (page.story && page.story.image) setSrc(document.querySelector('img.parallax-image'), page.story.image);

    var slides = document.querySelectorAll('.reviews-slide');
    (page.testimonials || []).forEach(function (item, idx) {
      var slide = slides[idx];
      if (!slide) return;
      setText(slide.querySelector('h4'), item.quote);
      var names = slide.querySelectorAll('.review-name-block h5');
      if (names[0]) setText(names[0], item.name);
      if (names[1]) setText(names[1], item.role);
      var imgs = slide.querySelectorAll('img');
      if (imgs.length) setSrc(imgs[imgs.length - 1], item.image);
    });
  }

  function applyWorksPage(page) {
    var titleFlex = document.querySelector('.title-flex');
    if (titleFlex) {
      setText(titleFlex.querySelector('h1'), page.header.title);
      setText(titleFlex.querySelector('h5'), page.header.subtitle);
    }
    var cards = document.querySelectorAll('.works-block');
    (page.works || []).forEach(function (work, idx) {
      var card = cards[idx];
      if (!card) return;
      setHref(card.querySelector('a.works-link-wrapper'), work.href);
      setSrc(card.querySelector('.works-image-wrapper img'), work.image);
      setText(card.querySelector('.works-text-block h3'), work.title);
      var badges = card.querySelectorAll('.works-badge h5');
      if (badges[0]) setText(badges[0], work.badge_1);
      if (badges[1]) setText(badges[1], work.badge_2);
    });
  }

  function applyContact(page) {
    var titleFlex = document.querySelector('.title-flex');
    if (titleFlex) {
      setText(titleFlex.querySelector('h1'), page.header.title);
      setText(titleFlex.querySelector('h5'), page.header.subtitle);
    }
    var labels = document.querySelectorAll('.field-label');
    var inputs = document.querySelectorAll('input.text-field, textarea.message-area');
    if (labels[0]) setText(labels[0], page.form.name_label);
    if (inputs[0]) inputs[0].setAttribute('placeholder', page.form.name_placeholder);
    if (labels[1]) setText(labels[1], page.form.email_label);
    if (inputs[1]) inputs[1].setAttribute('placeholder', page.form.email_placeholder);
    if (labels[2]) setText(labels[2], page.form.phone_label);
    if (inputs[2]) inputs[2].setAttribute('placeholder', page.form.phone_placeholder);
    if (labels[3]) setText(labels[3], page.form.message_label);
    if (inputs[3]) inputs[3].setAttribute('placeholder', page.form.message_placeholder);
    var submit = document.querySelector('input.button.w-button');
    if (submit) submit.value = page.form.submit_label;
    setText(document.querySelector('.contact-success-message div'), page.form.success_message);
    setText(document.querySelector('.contact-error-message div'), page.form.error_message);
  }

  function applyLegal(page) {
    var title = document.querySelector('h2');
    setText(title, page.header.title);
    var body = document.querySelector('.rich-text.w-richtext, .w-richtext');
    if (body) setHTML(body, page.body_html);
  }

  function applyWorkDetail(work) {
    setText(document.querySelector('.flex-title h3'), work.title);
    setText(document.querySelector('.works-description'), work.summary);
    var infos = document.querySelectorAll('.works-details-info p');
    if (infos[0]) setText(infos[0], work.client);
    if (infos[1]) setText(infos[1], work.category);
    if (infos[2]) setText(infos[2], work.date);
    setSrc(document.querySelector('.image-parallax-curve'), work.hero_image);
    setHTML(document.querySelector('.works-rich-text'), work.body_html);
    var thumbs = document.querySelectorAll('.thumbnails');
    (work.gallery || []).forEach(function (src, idx) { if (thumbs[idx]) setSrc(thumbs[idx], src.image || src); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Promise.all([
      fetchJson('/content/settings.json').catch(function () { return null; }),
      fetchJson('/content/shared.json').catch(function () { return null; })
    ]).then(function (common) {
      var settings = common[0], shared = common[1];
      applyGlobal(settings);
      applyShared(shared);
      var ref = resolvePage();
      if (ref.kind === 'work') {
        fetchJson('/content/works/' + ref.slug + '.json').then(function (work) {
          updateMeta(work.meta);
          applyWorkDetail(work);
        }).catch(function () {});
      } else {
        fetchJson('/content/pages/' + ref.slug + '.json').then(function (page) {
          updateMeta(page.meta);
          if (ref.slug === 'home') applyHome(page);
          else if (ref.slug === 'about') applyAbout(page);
          else if (ref.slug === 'works') applyWorksPage(page);
          else if (ref.slug === 'contact') applyContact(page);
          else if (ref.slug === 'privacy-policy' || ref.slug === 'terms-conditions') applyLegal(page);
        }).catch(function () {});
      }
    });
  });
})();
