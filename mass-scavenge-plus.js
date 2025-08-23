// ==UserScript==
// @name         Mass Scavenge Plus (BR)
// @namespace    https://github.com/xmavelx/tw/mass-scavenge-plus.js
// @version      1.3
// @description  Envie saques em massa com seleção fácil de vilarejos no Tribal Wars Brasil.
// @author       xmavelx
// @match        https://*.tribalwars.com.br/*
// @grant        OGUN
// @license      MIT
// @icon         https://tribalwars.com.br/favicon.ico
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG = {
        buttonText: '🌾 Saque em Massa',
        modalTitle: 'Saque em Massa',
        instruction: 'Use Ctrl + Click nos vilarejos no mapa para selecionar.',
        inputLabel: 'Porcentagem das tropas (L,E,A,C):',
        startButton: 'Iniciar Saque',
        cancelButton: 'Cancelar',
        defaultRatio: '25,25,25,25', // 25% de cada tropa
        minRatio: 0,
        maxRatio: 100,
        maxVillages: 50, // Limite para evitar spam
        cooldownMs: 300 // Delay entre abas para não sobrecarregar
    };

    // Verifica se estamos na tela do mapa
    if (!window.location.href.includes('screen=map')) {
        return;
    }

    // === Cria o botão no cabeçalho do mapa ===
    function createScavengeButton() {
        const header = document.querySelector('.map_header') ||
                       document.querySelector('#map_header') ||
                       document.querySelector('.header') ||
                       document.querySelector('h2')?.parentElement;

        if (!header || document.getElementById('mass-scavenge-btn')) return;

        const button = document.createElement('button');
        button.id = 'mass-scavenge-btn';
        button.textContent = CONFIG.buttonText;
        button.style.margin = '10px';
        button.style.padding = '8px 14px';
        button.style.fontSize = '14px';
        button.style.backgroundColor = '#27ae60';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '6px';
        button.style.cursor = 'pointer';
        button.style.fontWeight = 'bold';
        button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

        button.addEventListener('click', openScavengeModal);
        header.appendChild(button);
    }

    // === Abre o modal de configuração ===
    function openScavengeModal() {
        const modal = document.createElement('div');
        modal.id = 'mass-scavenge-modal';
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 15%;
                left: 50%;
                transform: translateX(-50%);
                background: #fff;
                border: 2px solid #2c3e50;
                border-radius: 10px;
                padding: 20px;
                width: 90%;
                max-width: 500px;
                z-index: 99999;
                font-family: Arial, sans-serif;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <h3 style="margin-top: 0; color: #2c3e50;">${CONFIG.modalTitle}</h3>
                <p style="color: #555; font-size: 14px;">${CONFIG.instruction}</p>

                <label style="display: block; margin: 10px 0; color: #2c3e50;">
                    ${CONFIG.inputLabel}
                    <input type="text" id="troop-ratio-input" value="${localStorage.getItem('scavengeRatio') || CONFIG.defaultRatio}"
                           placeholder="25,25,25,25"
                           style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">
                </label>

                <div style="margin-top: 20px; text-align: right;">
                    <button id="cancel-btn" style="
                        background: #95a5a6;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">${CONFIG.cancelButton}</button>
                    <button id="start-btn" style="
                        background: #27ae60;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        margin-left: 10px;
                        font-weight: bold;
                    ">${CONFIG.startButton}</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const selectedVillages = [];
        let mapClickListener;

        // Função para fechar o modal
        function closeModal() {
            if (modal && modal.parentNode) {
                document.body.removeChild(modal);
            }
            if (mapClickListener) {
                document.removeEventListener('click', mapClickListener);
            }
        }

        // Captura os cliques no mapa
        mapClickListener = (e) => {
            const link = e.target.closest('a[href*="village="]');
            if (link && e.ctrlKey) {
                const href = link.href;
                const match = href.match(/village=(\d+).*?target=(\d+)/);
                if (match) {
                    const targetId = match[2];
                    if (!selectedVillages.includes(targetId)) {
                        selectedVillages.push(targetId);
                        console.log(`[Mass Scavenge] Vilarejo adicionado: ${targetId}`);
                    }
                }
            }
        };

        document.addEventListener('click', mapClickListener);

        // Botões do modal
        modal.querySelector('#cancel-btn').addEventListener('click', closeModal);

        modal.querySelector('#start-btn').addEventListener('click', async () => {
            const input = document.getElementById('troop-ratio-input').value;
            const ratio = input.split(',').map(r => {
                const num = parseFloat(r.trim());
                return isNaN(num) ? 0 : Math.max(CONFIG.minRatio, Math.min(CONFIG.maxRatio, num));
            });

            if (ratio.length !== 4 || ratio.reduce((a, b) => a + b, 0) === 0) {
                alert('Por favor, insira 4 valores válidos (ex: 25,25,25,25).');
                return;
            }

            if (selectedVillages.length === 0) {
                alert('Selecione ao menos um vilarejo com Ctrl + Click no mapa.');
                return;
            }

            if (selectedVillages.length > CONFIG.maxVillages) {
                alert(`Limite de ${CONFIG.maxVillages} vilarejos excedido.`);
                return;
            }

            // Salva a configuração
            localStorage.setItem('scavengeRatio', input);

            // Abre as janelas com delay para não sobrecarregar
            for (const villageId of selectedVillages) {
                const url = `/game.php?village=${Game.village.id}&screen=place&target=${villageId}&mode=scavenge`;
                window.open(url, '_blank');
                await new Promise(r => setTimeout(r, CONFIG.cooldownMs)); // Delay entre abas
            }

            alert(`✅ Saque iniciado para ${selectedVillages.length} vilarejos.`);
            closeModal();
        });
    }

    // === Inicializa após o carregamento da página ===
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(createScavengeButton, 1500);
        });
    } else {
        setTimeout(createScavengeButton, 1500);
    }

})();
