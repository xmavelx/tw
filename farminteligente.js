// ==UserScript==
// @name         Auto Farm Inteligente - xmavelx v4.0
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Farm automático com filtros. Criado por xmavelx.
// @author       xmavelx
// @match        *://*.tribalwars.*/game.php*page=am_farm*
// @grant        none
// @icon         https://i.imgur.com/8qyP9lV.png
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    console.log('%c[Auto Farm - xmavelx] Script carregado!', 'color: #43b581; font-weight: bold;');

    // Configurações
    const CONFIG = {
        minTotal: 1000,     // Soma mínima de recursos
        maxLoss: 15,        // Máximo de % de tropas perdidas
        minLoot: 10,        // Mínimo de % de saque
        minLevel: 5,        // Nível mínimo da aldeia
        delayMin: 1500,     // Delay entre ataques (ms)
        delayMax: 3000,
        autoStart: false    // Iniciar automaticamente?
    };

    // Extrai número de texto (ex: "1.234" → 1234)
    function parseNum(str) {
        return parseInt(str.replace(/\D/g, ''), 10) || 0;
    }

    // Delay aleatório
    function wait() {
        const min = CONFIG.delayMin;
        const max = CONFIG.delayMax;
        return new Promise(r => setTimeout(r, min + Math.random() * (max - min)));
    }

    // Notificação na tela
    function notify(msg, type = 'info') {
        const colors = { info: '#17a2b8', success: '#28a745', warn: '#ffc107', error: '#dc3545' };
        const div = document.createElement('div');
        div.innerHTML = `
            <div style="
                position: fixed; top: 30px; right: 30px; background: white;
                border-left: 6px solid ${colors[type]}; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                padding: 12px 20px; border-radius: 6px; font-family: Arial, sans-serif;
                z-index: 99999; max-width: 350px; transition: opacity 0.5s;
            "><b>Farm - xmavelx</b><br>${msg}</div>
        `;
        document.body.appendChild(div);
        setTimeout(() => { div.style.opacity = '0'; setTimeout(() => div.remove(), 500); }, 5000);
    }

    // Extrai dados do alvo
    function getTargetData(target) {
        const resText = target.querySelector('.village_resources')?.textContent || '';
        const statsText = target.querySelector('.village_stats')?.textContent || '';

        const wood = parseNum(resText.match(/wood\D*(\d+)/)?.[1] || '0');
        const clay = parseNum(resText.match(/clay\D*(\d+)/)?.[1] || '0');
        const iron = parseNum(resText.match(/iron\D*(\d+)/)?.[1] || '0');
        const total = wood + clay + iron;

        const level = parseNum(statsText.match(/Nível (\d+)/)?.[1] || '0');
        const loot = parseNum(statsText.match(/(\d+)% saque/)?.[1] || '0');
        const loss = parseNum(statsText.match(/(\d+)% tropas perdidas/)?.[1] || '100');

        return { wood, clay, iron, total, level, loot, loss };
    }

    // Verifica se passa nos filtros
    function passesFilters(data) {
        return (
            data.total >= CONFIG.minTotal &&
            data.loss <= CONFIG.maxLoss &&
            data.loot >= CONFIG.minLoot &&
            data.level >= CONFIG.minLevel
        );
    }

    // Função principal
    async function startFarming() {
        const targets = document.querySelectorAll('.village_list_entry');
        if (targets.length === 0) {
            notify('❌ Nenhum alvo encontrado.', 'error');
            return;
        }

        let sent = 0, skipped = 0;

        for (const target of targets) {
            const data = getTargetData(target);
            const attackBtn = target.querySelector('button[data-command="attack"]');

            if (!attackBtn) {
                skipped++;
                continue;
            }

            if (passesFilters(data)) {
                attackBtn.click();
                sent++;
                console.log(`✅ Ataque enviado: ${data.total} recursos | Nível ${data.level} | Perda: ${data.loss}%`);
                await wait();
            } else {
                skipped++;
                console.log(`❌ Ignorado: ${data.total} | Nível ${data.level} | Perda: ${data.loss}%`);
            }
        }

        notify(`✅ Farm concluído!<br>Enviados: ${sent} | Ignorados: ${skipped}`, 'success');
    }

    // Botão flutuante
    function createButton() {
        const btn = document.createElement('button');
        btn.textContent = '🚀 Iniciar Farm (xmavelx)';
        btn.style.cssText = `
            position: fixed; bottom: 30px; right: 30px; background: #7289da; color: white;
            border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;
            cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 99998;
            transition: all 0.2s;
        `;
        btn.onmouseenter = () => btn.style.background = '#5b6ee1';
        btn.onmouseleave = () => btn.style.background = '#7289da';
        btn.onclick = () => {
            btn.disabled = true;
            btn.textContent = '✅ Executando...';
            startFarming().finally(() => {
                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = '🚀 Iniciar Farm (xmavelx)';
                }, 2000);
            });
        };
        document.body.appendChild(btn);
    }

    // Inicializa
    window.addEventListener('load', () => {
        console.log('%c[Auto Farm - xmavelx] Página carregada. Pronto para uso.', 'color: #7289da');
        createButton();

        // Opcional: iniciar automaticamente
        // if (CONFIG.autoStart) setTimeout(startFarming, 1000);
    });

})();
