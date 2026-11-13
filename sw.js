/**
 * ApoioAPS — Service Worker Offline & Cache Manager
 * Unidade ESF CDI 2 — Sete Lagoas / MG
 * Garante disponibilidade 100% offline de todas as ferramentas locais do sistema.
 */

const CACHE_NAME = 'apoioaps-cache-v1.0.1';

// Lista completa de todos os recursos locais essenciais para funcionamento offline
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './manifest.webmanifest',
    './assets/css/common.css',
    './assets/css/home.css',
    './assets/css/calculadoras.css',
    './assets/css/atestados.css',
    './assets/css/folha_ponto.css',
    './assets/css/receita.css',
    './assets/css/calendario_vacinal.css',
    './assets/css/declaracao_vinculo.css',
    './assets/css/relatorios.css',
    './assets/css/encaminhamento.css',
    './assets/css/whatsapp-marcacao.css',
    './assets/fonts/MaterialIcons-Regular.woff2',
    './assets/icons/icon.svg',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/logo.png',
    './assets/js/sw-register.js',
    './assets/js/calculadoras.js',
    './assets/js/calendario_vacinal.js',
    './assets/js/relatorios.js',
    './assets/js/receita.js',
    './assets/js/atestados.js',
    './assets/js/folha_ponto_template.js',
    './assets/js/folha_ponto.js',
    './assets/js/exportar-pdf.js',
    './assets/js/whatsapp-marcacao.js',
    './assets/js/encaminhamento.js',
    './assets/js/declaracao_vinculo.js',
    './assets/js/vendor/html2canvas.min.js',
    './assets/js/vendor/jspdf.umd.min.js',
    './assets/js/vendor/pdf-lib.min.js',
    './Arquivos/calculadoras.html',
    './Arquivos/calendario_vacinal.html',
    './Arquivos/declaracao_vinculo.html',
    './Arquivos/encaminhamento.html',
    './Arquivos/folha_ponto.html',
    './Arquivos/gerador_atestados.html',
    './Arquivos/prontuario.html',
    './Arquivos/receita.html',
    './Arquivos/relatorios_funcionarios.html',
    './Arquivos/whatsapp-marcacao.html',
    './Arquivos/capa_de_prontuario.pdf',
    './Arquivos/Folha_de_Ponto_Preenchivel.pdf'
];

// Instalação do Service Worker: baixa todos os assets para o CacheStorage
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            console.log('[SW ApoioAPS] Baixando recursos para funcionamento offline...');
            await Promise.all(
                PRECACHE_ASSETS.map(async url => {
                    try {
                        const response = await fetch(url, { cache: 'no-cache' });
                        if (response.ok) {
                            await cache.put(url, response);
                        } else {
                            console.warn('[SW ApoioAPS] Resposta não-OK para:', url, response.status);
                        }
                    } catch (err) {
                        console.warn('[SW ApoioAPS] Erro ao pré-cachear:', url, err);
                    }
                })
            );
            console.log('[SW ApoioAPS] Todos os recursos locais foram salvos com sucesso.');
        }).then(() => self.skipWaiting())
    );
});

// Ativação: remove caches legados e assume controle imediato
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW ApoioAPS] Removendo cache legado:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Interceptação de requisições: Cache-First com Stale-While-Revalidate para recursos locais
self.addEventListener('fetch', event => {
    const request = event.request;

    // Apenas requisições GET
    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    // Serviços externos (G-MUS, Google Docs, CADSUS, APIs externas): Rede direta
    if (url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        caches.match(request, { ignoreSearch: true }).then(cachedResponse => {
            // Se já está no cache, retorna imediatamente e atualiza em segundo plano se houver conexão
            const fetchPromise = fetch(request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => null);

            if (cachedResponse) {
                return cachedResponse;
            }

            // Se não estava no cache, aguarda a rede
            return fetchPromise.then(response => {
                if (response) return response;

                // Fallback para navegação HTML quando offline
                if (request.mode === 'navigate' || (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
                    return caches.match('./index.html', { ignoreSearch: true });
                }

                return new Response('Recurso indisponível offline.', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
                });
            });
        })
    );
});

// Comunicação com a interface (notificações e atualizações)
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
