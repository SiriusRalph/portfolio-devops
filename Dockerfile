# Image de base officielle : serveur web Nginx sur Alpine Linux (légère)
FROM nginx:alpine

# Métadonnées de l'image
LABEL org.opencontainers.image.title="portfolio-devops" \
      org.opencontainers.image.description="Portfolio HTML/CSS servi par Nginx"

# Copie du site dans le dossier servi par Nginx
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/

# Correctif : rendre les fichiers lisibles par l'utilisateur nginx
# (sinon erreur 403 Forbidden / Permission denied)
RUN chmod -R a+rX /usr/share/nginx/html

# Port écouté par Nginx à l'intérieur du conteneur
EXPOSE 80
