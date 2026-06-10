# syntax=docker/dockerfile:1
# Frontend — copy pre-built dist into nginx
#
# Build the frontend on the host first:
#   npm install --legacy-peer-deps && npm run build
# Then build this image:
#   docker build -t ai-chatbot-frontend:0.1.0 .

FROM public.ecr.aws/docker/library/nginx:1.27-alpine AS runtime
COPY dist/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/index.html || exit 1
CMD ["nginx", "-g", "daemon off;"]
