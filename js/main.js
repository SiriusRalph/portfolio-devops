// Portfolio — animations et menu mobile.
// Amélioration progressive : sans ce script, tout le contenu reste visible et lisible.
(function () {
  var racine = document.documentElement;
  racine.classList.add('js');
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var observe = 'IntersectionObserver' in window;

  // --- Menu « burger » sur téléphone ---
  var menu = document.querySelector('.menu');
  var burger = document.querySelector('.burger');
  if (menu && burger) {
    var fermer = function () {
      menu.classList.remove('ouvert');
      burger.setAttribute('aria-expanded', 'false');
    };
    burger.addEventListener('click', function () {
      var ouvert = menu.classList.toggle('ouvert');
      burger.setAttribute('aria-expanded', String(ouvert));
    });
    menu.querySelectorAll('ul a').forEach(function (lien) { lien.addEventListener('click', fermer); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fermer(); });
  }

  // --- En-tête, barre de progression et bouton « haut » ---
  var entete = document.querySelector('.entete');
  var barre = document.querySelector('.progression');
  var haut = document.querySelector('.haut');
  var enAttente = false;
  function majDefilement() {
    enAttente = false;
    var y = window.scrollY;
    var max = racine.scrollHeight - window.innerHeight;
    if (entete) entete.classList.toggle('defile', y > 10);
    if (barre) barre.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    if (haut) haut.classList.toggle('visible', y > 600);
  }
  window.addEventListener('scroll', function () {
    if (!enAttente) { enAttente = true; window.requestAnimationFrame(majDefilement); }
  }, { passive: true });
  majDefilement();

  // --- Compteurs animés (7, 96 %, 88,17 %, 4,5…) ---
  function compter(el) {
    var m = el.textContent.trim().match(/^(\d+)(?:,(\d+))?(.*)$/);
    if (!m || el.children.length) return;
    var decimales = m[2] ? m[2].length : 0;
    var cible = parseFloat(m[1] + '.' + (m[2] || '0'));
    var suite = m[3];
    var final = el.textContent;
    var debut = null;
    var duree = 1300;
    var termine = false;
    function etape(t) {
      if (termine) return;
      if (debut === null) debut = t;
      var p = Math.min((t - debut) / duree, 1);
      var v = cible * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toFixed(decimales).replace('.', ',') + suite;
      if (p < 1) window.requestAnimationFrame(etape);
    }
    window.requestAnimationFrame(etape);
    // Filet de sécurité : la valeur exacte s'affiche même si l'animation est interrompue.
    window.setTimeout(function () { termine = true; el.textContent = final; }, duree + 150);
  }
  var compteurs = document.querySelectorAll('.stat strong, .tuile-chiffre, .duo-jaune strong, .chiffres strong');

  // --- Apparition au défilement, en cascade ---
  var cibles = document.querySelectorAll(
    '.bloc > h2, .bloc-tete, .intro-texte, .faits > div, .groupe, .projet, .contact-grille,' +
    ' .fiche, .etape, .certif, .langues li, .frise, .sommaire'
  );

  if (calme || !observe) {
    document.querySelectorAll('.frise').forEach(function (f) { f.classList.add('vu'); });
  } else {
    cibles.forEach(function (el) {
      var freres = Array.prototype.filter.call(el.parentNode.children, function (c) {
        return c.tagName === el.tagName;
      });
      var rang = Math.min(freres.indexOf(el), 5);
      el.classList.add('reveal');
      el.style.setProperty('--d', (rang * 0.08) + 's');
    });
    var apparition = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('vu');
        window.setTimeout(function () { el.classList.add('fini'); }, 1200);
        apparition.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    cibles.forEach(function (el) { apparition.observe(el); });

    var comptage = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        compter(e.target);
        comptage.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    compteurs.forEach(function (el) { comptage.observe(el); });
  }

  // --- Mots qui défilent (« Je conçois … ») ---
  var mot = document.querySelector('.mot[data-mots]');
  if (mot && !calme) {
    var mots = mot.getAttribute('data-mots').split('|');
    var i = 0;
    window.setInterval(function () {
      mot.classList.add('change');
      window.setTimeout(function () {
        i = (i + 1) % mots.length;
        mot.textContent = mots[i];
        mot.classList.remove('change');
      }, 350);
    }, 2600);
  }

  // --- Sommaire des pages intérieures : section active ---
  var liens = document.querySelectorAll('.sommaire a[href^="#"]');
  if (liens.length && observe) {
    var parId = {};
    liens.forEach(function (a) { parId[a.getAttribute('href').slice(1)] = a; });
    var actif = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        liens.forEach(function (a) { a.classList.remove('actif'); });
        var lien = parId[e.target.id];
        if (lien) lien.classList.add('actif');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(parId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) actif.observe(section);
    });
  }
})();
