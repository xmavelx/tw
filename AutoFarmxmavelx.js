// ==UserScript==
// @name         TW Auto Farm Assistant BR (UI + Pause + Double Counter + AutoReload)
// @author       xmavelx
// @version      4.4.0
// @grant        none
// @description  Auto farm com contador confiável, auto-reload, auto-retry e UI para Tribal Wars BR.
// @include      http*://*.tribalwars.com.br/*screen=am_farm*
// @namespace    https://greasyfork.org/users/xmavelx
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // Requisitos básicos
    if (document.URL.indexOf('screen=am_farm') === -1) {
        console.log('⚠️ Execute no Assistente de Saque (am_farm).');
        return;
    }
    if ($('body').data('bot-protect') !== undefined) {
        alert('⚠️ Captcha detectado! Pare imediatamente.');
        return;
    }

    // ==========================
    // ⚙️ Configurações padrão
    // ==========================
    const DEFAULTS = {
        attackMin: 300,            // >= 220ms para ficar < 5/s
        attackMax: 800,
        changeVillage: true,
        changeVillageMin: 150000,  // 2.5 min
        changeVillageMax: 240000,  // 4 min
        minUnitNumber: 6,
        maxWallLv: 10,
        autoReload: true,          // recarregar periodicamente
        autoReloadMin: 240000,     // 4 min
        autoReloadMax: 420000,     // 7 min
        idleRestartMs: 60000,      // se ficar 60s sem ataque, tenta novo ciclo
        autoStart: true            // iniciar automaticamente após reload
    };

    let config = Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem("twAutoFarmConfig") || "{}"));

    // Elementos/estado
    const menu_a = '#plunder_list a.farm_icon_a';
    const menu_b = '#plunder_list a.farm_icon_b';

    let farmingActive = false;
    let attackTimeout = null;
    let changeVillageTimeout = null;
    let captchaTimer = null;
    let idleTimer = null;
    let reloadTimer = null;
    let unitPollTimer = null;

    // Contadores persistentes por sessão (sobrevivem a reload)
    let attackCount = parseInt(sessionStorage.getItem('twAutoFarm_attackCount') || '0', 10);
    let villageCount = parseInt(sessionStorage.getItem('twAutoFarm_villageCount') || '0', 10);
    let lastAttackAt = parseInt(sessionStorage.getItem('twAutoFarm_lastAttackAt') || String(Date.now()), 10);

    // Labels UI
    let attackLabel = null;
    let villageLabel = null;
    let statusLabel  = null;

    // Utils
    const rt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

    function shuffle(arr) {
        let a = arr.slice(), i = a.length, t, r;
        while (i) { r = Math.floor(Math.random() * i--); t = a[i]; a[i] = a[r]; a[r] = t; }
        return a;
    }

    function saveCounters() {
        sessionStorage.setItem('twAutoFarm_attackCount', String(attackCount));
        sessionStorage.setItem('twAutoFarm_villageCount', String(villageCount));
        sessionStorage.setItem('twAutoFarm_lastAttackAt', String(lastAttackAt));
    }

    function updateCountersUI() {
        if (attackLabel) attackLabel.textContent = "⚔️ Ataques enviados: " + attackCount;
        if (villageLabel) villageLabel.textContent = "🏰 Aldeias trocadas: " + villageCount;
    }

    function setStatus(text) {
        if (statusLabel) statusLabel.textContent = "📡 Status: " + text;
    }

    // ==========================
    // Captcha dinâmico
    // ==========================
    function startCaptchaWatch() {
        stopCaptchaWatch();
        captchaTimer = setInterval(function () {
            if ($('#bot_check').length) {
                alert('⚠️ Captcha detectado! Pausando.');
                stopAll();
            }
        }, 300);
    }
    function stopCaptchaWatch() {
        if (captchaTimer) clearInterval(captchaTimer);
        captchaTimer = null;
    }

    // ==========================
    // Carregar todas as páginas do assistente
    // ==========================
    function showAllBarbs() {
        if (game_data.screen !== 'am_farm') return;
        function modify_table(data) {
            const result = $('<div>').html(data).contents();
            const rows = result.find('#plunder_list tr:not(:first-child)');
            $('#plunder_list').append(rows);
        }
        $('.paged-nav-item:not(:first-child)').each(function () {
            $.ajax({
                url: $(this).attr('href'),
                type: "get",
                async: false,
                success: modify_table,
                error: function () {
                    UI.ErrorMessage('Erro ao carregar dados. Recarregue a página.', 5000);
                    throw new Error('interrupted script');
                }
            });
            $(this).remove();
        });
        window.scrollTo(0, 0);
    }

    // ==========================
    // Checagens auxiliares
    // ==========================
    function enoughUnits(menu) {
        if (menu === menu_a) return parseInt($('#light').text() || '0', 10) >= config.minUnitNumber;
        return parseInt($('#heavy').text() || '0', 10) >= config.minUnitNumber;
    }

    function checkWall(maxWallLv, idx) {
        const cell = $('#plunder_list tr:not(:first)').eq(idx + 1).find('td').eq(6).text();
        const wallLv = parseInt(cell, 10);
        return (isNaN(wallLv) || wallLv < maxWallLv);
    }

    // ==========================
    // Contagem “somente sucesso”
    // - Intercepta ajax/fetch
    // - Fallback: MutationObserver por linha
    // ==========================
    function hookSuccessCounting() {
        // jQuery ajax
        $(document).off('ajaxSuccess.twaf').on('ajaxSuccess.twaf', function (_e, xhr, settings) {
            if (!settings || !settings.url) return;
            const u = settings.url;
            // Heurística: ações do assistente de saque costumam bater em am_farm / ajax / plunder
            if (/am_farm|plunder|action|ajax/i.test(u) && xhr && xhr.status >= 200 && xhr.status < 300) {
                countedSuccess();
            }
        });

        // fetch
        if (!window._twaf_fetchPatched) {
            const _fetch = window.fetch;
            window.fetch = function (...args) {
                const req = args[0];
                const url = req && (req.url || req.toString ? req.toString() : String(req));
                return _fetch.apply(this, args).then(res => {
                    try {
                        if (url && /am_farm|plunder|action|ajax/i.test(url) && res && res.ok) {
                            countedSuccess();
                        }
                    } catch (e) { /* ignore */ }
                    return res;
                });
            };
            window._twaf_fetchPatched = true;
        }
    }

    function countedSuccess() {
        attackCount++;
        lastAttackAt = Date.now();
        saveCounters();
        updateCountersUI();
    }

    function safeClickAndCount(targetEl) {
        // Fallback por mutação de linha (conta apenas se a linha mudar)
        try {
            const row = $(targetEl).closest('tr')[0];
            if (row) {
                const before = row.innerHTML;
                let counted = false;
                const obs = new MutationObserver(() => {
                    if (!counted && row.innerHTML !== before) {
                        counted = true;
                        countedSuccess();
                        obs.disconnect();
                    }
                });
                obs.observe(row, { childList: true, subtree: true, characterData: true });
                $(targetEl).trigger('click');
                // timeout de segurança (se não mudar, não conta)
                setTimeout(() => { try { obs.disconnect(); } catch(e){} }, 2500);
                return;
            }
        } catch (e) { /* segue normal */ }
        // Fallback final: clique simples
        $(targetEl).trigger('click');
    }

    // ==========================
    // Loop de ataques
    // ==========================
    let attackingNow = false;

    function startFarming() {
        if (!farmingActive) return;
        if (attackingNow) return; // evita paralelismo
        attackingNow = true;

        setStatus('preparando alvos…');
        showAllBarbs();

        const menu = (parseInt($('#light').text() || '0', 10) < parseInt($('#heavy').text() || '0', 10)) ? menu_b : menu_a;
        let targets = $(menu).toArray();
        targets = shuffle(targets);

        let i = 0;
        function attackNext() {
            if (!farmingActive) { attackingNow = false; return; }
            if (i >= targets.length) { attackingNow = false; setStatus('ocioso'); return; }

            if (checkWall(config.maxWallLv, i) && enoughUnits(menu)) {
                safeClickAndCount(targets[i]);
                setStatus('atacando…');
            }
            i++;
            const min = clamp(config.attackMin, 220, 60000);
            const max = clamp(Math.max(config.attackMax, min + 50), 220, 60000);
            attackTimeout = setTimeout(attackNext, rt(min, max));
        }
        attackNext();
    }

    // ==========================
    // Troca de aldeia
    // ==========================
    function scheduleVillageChange() {
        if (!config.changeVillage) return;
        function loop() {
            if (!farmingActive) return;
            const delay = rt(config.changeVillageMin, config.changeVillageMax);
            changeVillageTimeout = setTimeout(function () {
                $('.arrowRight, .groupRight').click();
                villageCount++;
                saveCounters();
                updateCountersUI();
                setTimeout(startFarming, rt(3000, 8000));
                loop();
            }, delay);
        }
        loop();
    }

    // ==========================
    // Auto-retry quando ocioso
    // - Se passar muito tempo sem ataques, tenta novo ciclo.
    // ==========================
    function startIdleWatch() {
        stopIdleWatch();
        idleTimer = setInterval(function () {
            if (!farmingActive) return;
            const idleFor = Date.now() - lastAttackAt;
            if (idleFor >= config.idleRestartMs && !attackingNow) {
                setStatus('ocioso – tentando retomar…');
                startFarming();
            }
        }, 5000 + Math.floor(Math.random() * 4000));
    }
    function stopIdleWatch() {
        if (idleTimer) clearInterval(idleTimer);
        idleTimer = null;
    }

    // ==========================
    // Auto-reload periódico
    // ==========================
    function scheduleAutoReload() {
        clearTimeout(reloadTimer);
        if (!config.autoReload) return;
        const delay = rt(config.autoReloadMin, config.autoReloadMax);
        reloadTimer = setTimeout(function () {
            setStatus('recarregando…');
            location.reload();
        }, delay);
    }

    // ==========================
    // Poll de tropas (retomada automática)
    // - Fica checando de tempos em tempos se já tem tropas mínimas.
    // ==========================
    function startUnitPoll() {
        stopUnitPoll();
        function loop() {
            if (!farmingActive) return;
            const menu = (parseInt($('#light').text() || '0', 10) < parseInt($('#heavy').text() || '0', 10)) ? menu_b : menu_a;
            if (enoughUnits(menu) && !attackingNow) {
                setStatus('tropas disponíveis – retomando…');
                startFarming();
            }
            unitPollTimer = setTimeout(loop, rt(12000, 20000));
        }
        loop();
    }
    function stopUnitPoll() {
        if (unitPollTimer) clearTimeout(unitPollTimer);
        unitPollTimer = null;
    }

    // ==========================
    // START / STOP
    // ==========================
    function startAll(resetCounters = false) {
        if (resetCounters) {
            attackCount = 0;
            villageCount = 0;
            saveCounters();
            updateCountersUI();
        }
        farmingActive = true;
        hookSuccessCounting();
        startCaptchaWatch();
        startFarming();
        scheduleVillageChange();
        startIdleWatch();
        startUnitPoll();
        scheduleAutoReload();
        setStatus('rodando');
    }

    function stopAll() {
        farmingActive = false;
        attackingNow = false;
        clearTimeout(attackTimeout);
        clearTimeout(changeVillageTimeout);
        clearTimeout(reloadTimer);
        stopCaptchaWatch();
        stopIdleWatch();
        stopUnitPoll();
        setStatus('pausado');
    }

    // ==========================
    // UI
    // ==========================
    function createUI() {
        const panel = document.createElement("div");
        panel.id = "autoFarmUI";
        panel.style.position = "fixed";
        panel.style.top = "80px";
        panel.style.right = "20px";
        panel.style.background = "rgba(0,0,0,0.85)";
        panel.style.color = "white";
        panel.style.padding = "10px";
        panel.style.border = "2px solid #555";
        panel.style.borderRadius = "8px";
        panel.style.zIndex = 9999;
        panel.style.fontSize = "12px";
        panel.style.width = "260px";

        panel.innerHTML = `
            <b>⚙️ AutoFarm Config</b><br><br>
            <div style="line-height:1.5">
              <div>Intervalo ataque (ms):</div>
              Min: <input id="afMin" type="number" value="${config.attackMin}" style="width:70px;"> 
              Max: <input id="afMax" type="number" value="${config.attackMax}" style="width:70px;"><br><br>

              <div>Troca de aldeia (ms):</div>
              Min: <input id="cvMin" type="number" value="${config.changeVillageMin}" style="width:90px;"> 
              Max: <input id="cvMax" type="number" value="${config.changeVillageMax}" style="width:90px;"><br><br>

              Tropas mínimas: <input id="afUnits" type="number" value="${config.minUnitNumber}" style="width:70px;"><br>
              Muralha máx.: <input id="afWall" type="number" value="${config.maxWallLv}" style="width:70px;"><br><br>

              <label><input id="afChange" type="checkbox" ${config.changeVillage?'checked':''}> Trocar de aldeia</label><br>
              <label><input id="afAR" type="checkbox" ${config.autoReload?'checked':''}> Auto-reload</label><br>
              Auto-reload (ms):<br>
              Min: <input id="arMin" type="number" value="${config.autoReloadMin}" style="width:90px;">
              Max: <input id="arMax" type="number" value="${config.autoReloadMax}" style="width:90px;"><br><br>
              Idle retry (ms): <input id="idleMs" type="number" value="${config.idleRestartMs}" style="width:100px;"><br>
              <label><input id="afAS" type="checkbox" ${config.autoStart?'checked':''}> Auto-start após reload</label>
            </div>
            <br>
            <button id="afSave">Salvar</button>
            <button id="afStart">▶️ Iniciar</button>
            <button id="afStop">⏸️ Parar</button>
            <button id="afReset">🔄 Zerar contadores</button>
            <div id="afCounter" style="margin-top:8px; font-weight:bold;">⚔️ Ataques enviados: ${attackCount}</div>
            <div id="afVillageCounter" style="margin-top:4px; font-weight:bold;">🏰 Aldeias trocadas: ${villageCount}</div>
            <div id="afStatus" style="margin-top:6px; opacity:.9;">📡 Status: parado</div>
        `;
        document.body.appendChild(panel);

        // labels
        attackLabel  = document.getElementById("afCounter");
        villageLabel = document.getElementById("afVillageCounter");
        statusLabel  = document.getElementById("afStatus");

        // handlers
        document.getElementById("afSave").onclick = function () {
            const min = parseInt(document.getElementById("afMin").value, 10);
            const max = parseInt(document.getElementById("afMax").value, 10);
            const cvMin = parseInt(document.getElementById("cvMin").value, 10);
            const cvMax = parseInt(document.getElementById("cvMax").value, 10);
            const arMin = parseInt(document.getElementById("arMin").value, 10);
            const arMax = parseInt(document.getElementById("arMax").value, 10);

            config.attackMin = clamp(min, 220, 60000);
            config.attackMax = clamp(Math.max(max, config.attackMin + 50), 220, 60000);
            config.changeVillageMin = Math.max(30000, cvMin);
            config.changeVillageMax = Math.max(config.changeVillageMin + 1000, cvMax);
            config.autoReloadMin = Math.max(60000, arMin);
            config.autoReloadMax = Math.max(config.autoReloadMin + 1000, arMax);

            config.minUnitNumber = Math.max(1, parseInt(document.getElementById("afUnits").value, 10));
            config.maxWallLv = Math.max(0, parseInt(document.getElementById("afWall").value, 10));
            config.changeVillage = document.getElementById("afChange").checked;
            config.autoReload = document.getElementById("afAR").checked;
            config.idleRestartMs = Math.max(5000, parseInt(document.getElementById("idleMs").value, 10));
            config.autoStart = document.getElementById("afAS").checked;

            localStorage.setItem("twAutoFarmConfig", JSON.stringify(config));
            alert("✅ Configurações salvas!");
            if (farmingActive) scheduleAutoReload(); // reprograma reload com novos tempos
        };

        document.getElementById("afStart").onclick = function () {
            startAll(true); // reseta contadores ao iniciar manualmente
            alert("🚀 AutoFarm iniciado!");
        };

        document.getElementById("afStop").onclick = function () {
            stopAll();
            alert("⏸️ AutoFarm pausado!");
        };

        document.getElementById("afReset").onclick = function () {
            attackCount = 0; villageCount = 0; saveCounters(); updateCountersUI();
        };
    }

    createUI();

    // Auto-start após reload (opcional)
    if (config.autoStart) {
        // dá um respiro para o jogo montar a página
        setTimeout(() => { startAll(false); }, rt(1200, 2500));
    } else {
        setStatus('parado');
    }

    // Aviso amistoso: respeite as regras do servidor
    // (mantido curto para não atrapalhar a UI)
})();
