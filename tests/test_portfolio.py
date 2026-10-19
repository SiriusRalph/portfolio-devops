"""Tests automatisés du portfolio (bibliothèque standard Python uniquement)."""
import unittest
from html.parser import HTMLParser
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent


class Analyseur(HTMLParser):
    """Collecte les id, les liens CSS et les titres h1 de la page."""

    def __init__(self):
        super().__init__()
        self.ids, self.css, self.h1, self.title = set(), [], 0, False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "link" and a.get("rel") == "stylesheet":
            self.css.append(a.get("href"))
        if tag == "h1":
            self.h1 += 1
        if tag == "title":
            self.title = True


def analyser():
    p = Analyseur()
    p.feed((RACINE / "index.html").read_text(encoding="utf-8"))
    return p


class TestFichiers(unittest.TestCase):
    def test_fichiers_indispensables(self):
        for f in ["index.html", "css/style.css", "Dockerfile", "compose.yaml"]:
            with self.subTest(fichier=f):
                self.assertTrue((RACINE / f).is_file(), f"Fichier manquant : {f}")

    def test_dockerfile_utilise_nginx(self):
        contenu = (RACINE / "Dockerfile").read_text(encoding="utf-8")
        self.assertIn("FROM nginx", contenu)
        self.assertIn("/usr/share/nginx/html", contenu)


class TestStructureHTML(unittest.TestCase):
    def setUp(self):
        self.page = analyser()

    def test_sections_obligatoires(self):
        for section in ["accueil", "apropos", "competences", "projets", "contact"]:
            with self.subTest(section=section):
                self.assertIn(section, self.page.ids, f"Section absente : #{section}")

    def test_feuille_de_style_liee(self):
        self.assertIn("css/style.css", self.page.css)

    def test_un_seul_titre_principal(self):
        self.assertEqual(self.page.h1, 1)

    def test_balise_title(self):
        self.assertTrue(self.page.title)


if __name__ == "__main__":
    unittest.main(verbosity=2)
