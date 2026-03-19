#!/bin/sh
# Substitui o placeholder pela variável de ambiente real em runtime
find /usr/share/nginx/html/assets -name "*.js" -exec \
  sed -i "s|__VITE_API_URL__|${VITE_API_URL}|g" {} \;

nginx -g "daemon off;"
