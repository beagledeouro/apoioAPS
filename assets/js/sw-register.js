/**
 * ApoioAPS — Gerenciador de Registro do Service Worker & Status Offline
 * Responsável por registrar o cache no navegador e gerenciar a interface offline.
 */

(function () {
    'use strict';

    const isSubfolder = window.location.pathname.includes('/Arquivos/');
    const swPath = isSubfolder ? '../sw.js' : './sw.js';
    const basePath = isSubfolder ? '../' : './';

    // Cria e exibe toast flutuante
    function mostrarToast(mensagem, tipo = 'info', duracao = 4500) {
        let toast = document.querySelector('.offline-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'offline-toast';
            document.body.appendChild(toast);
        }

        const iconMap = {
            success: 'check_circle',
            warning: 'wifi_off',
            info: 'cloud_done'
        };

        toast.className = `offline-toast ${tipo}`;
        toast.innerHTML = `
            <span class="material-icons">${iconMap[tipo] || 'info'}</span>
            <div>${mensagem}</div>
        `;

        if (window._toastTimeout) clearTimeout(window._toastTimeout);
        window._toastTimeout = setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity .3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, duracao);
    }

    // Modal amigável para serviços externos quando sem conexão
    function exibirModalServicoExterno(titulo, url) {
        const antigo = document.querySelector('.offline-modal-backdrop');
        if (antigo) antigo.remove();

        const backdrop = document.createElement('div');
        backdrop.className = 'offline-modal-backdrop';
        backdrop.innerHTML = `
            <div class="offline-modal" role="dialog" aria-modal="true">
                <div class="offline-modal-icon">
                    <span class="material-icons">cloud_off</span>
                </div>
                <h3>Serviço Externo Requer Conexão</h3>
                <p>O item <strong>"${titulo}"</strong> depende de conexão ativa com servidores externos (G-MUS, CADSUS ou Google Drive).<br><br>
                Todas as ferramentas locais do ApoioAPS (Receitas, Atestados, Folha de Ponto, Declarações e Calculadoras) continuam funcionando normalmente offline.</p>
                <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
                    <button id="btnFecharModalOffline">Entendi</button>
                    <a href="${url}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; justify-content:center; padding:10px 18px; border-radius:8px; border:1px solid #cbd5e1; color:#475569; text-decoration:none; font-size:0.88rem; font-weight:600;">Tentar Abrir</a>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        backdrop.querySelector('#btnFecharModalOffline').addEventListener('click', () => backdrop.remove());
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) backdrop.remove();
        });
    }

    // Atualiza a interface baseada no status de rede
    function atualizarStatusRede() {
        const estaOnline = navigator.onLine;
        const body = document.body;
        const badge = document.getElementById('statusRedeBadge');

        if (estaOnline) {
            body.classList.remove('is-offline');
            if (badge) {
                badge.className = 'offline-pill online';
                badge.innerHTML = '<span class="material-icons">cloud_done</span> 100% Offline Pronto';
                badge.title = 'ApoioAPS está salvo no cache do navegador e pronto para uso sem internet.';
            }
        } else {
            body.classList.add('is-offline');
            if (badge) {
                badge.className = 'offline-pill';
                badge.innerHTML = '<span class="material-icons">cloud_off</span> Modo Offline Ativo';
                badge.title = 'Você está sem conexão. As ferramentas clínicas locais continuam 100% disponíveis.';
            }
            mostrarToast('Você está offline. Todas as ferramentas clínicas locais estão liberadas para uso.', 'warning', 4000);
        }
    }

    // Interceptação de links externos quando offline na página inicial
    function interceptarLinksExternosOffline() {
        const linksExternos = document.querySelectorAll('a[data-external="true"], .card-item[data-external="true"], a[target="_blank"]');
        linksExternos.forEach(link => {
            // Não intercepta links relativos para PDFs locais
            const href = link.getAttribute('href') || '';
            if (href.startsWith('http://') || href.startsWith('https://')) {
                link.dataset.external = "true";
                link.addEventListener('click', function (e) {
                    if (!navigator.onLine) {
                        e.preventDefault();
                        const titulo = this.querySelector('strong') ? this.querySelector('strong').textContent.trim() : this.textContent.trim();
                        exibirModalServicoExterno(titulo, href);
                    }
                });
            }
        });
    }

    // Inicia registro do Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(swPath)
                .then(registration => {
                    // Detecta se é o primeiro carregamento ou se já foi ativado
                    if (registration.installing) {
                        registration.installing.addEventListener('statechange', function () {
                            if (this.state === 'installed' && navigator.serviceWorker.controller) {
                                mostrarToast('✓ ApoioAPS baixado! O sistema agora funciona 100% offline.', 'success', 5000);
                            }
                        });
                    }

                    // Verifica atualizações em segundo plano
                    registration.onupdatefound = () => {
                        const installingWorker = registration.installing;
                        if (installingWorker) {
                            installingWorker.onstatechange = () => {
                                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    mostrarToast('Nova versão do ApoioAPS baixada. As alterações já estão disponíveis.', 'info', 4000);
                                }
                            };
                        }
                    };
                })
                .catch(err => {
                    console.warn('[ApoioAPS] Não foi possível registrar o Service Worker:', err);
                });

            // Monitora eventos online/offline do navegador
            window.addEventListener('online', () => {
                atualizarStatusRede();
                mostrarToast('Conexão com a internet restabelecida.', 'success', 3000);
            });
            window.addEventListener('offline', () => {
                atualizarStatusRede();
            });

            atualizarStatusRede();
            interceptarLinksExternosOffline();
        });
    } else {
        console.info('[ApoioAPS] Navegador sem suporte nativo a Service Workers.');
    }
})();
