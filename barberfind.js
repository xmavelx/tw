/*
 * Script Name: Barbs Finder
 * Version: v2.0.2
 * Last Updated: 2025-08-15
 * Author: RedAlert
 * Author URL: https://twscripts.dev/
 * Author Contact: redalert_tw (Discord)
 * Approved: t13981993
 * Approved Date: 2020-05-27
 * Mod: JawJaw
 */

// Copyright (c) RedAlert
// Script License Notice
// -----------------------------------------------------------------------------------
// This script is provided "AS IS", without warranty of any kind, express or implied,
// including but not limited to the warranties of merchantability, fitness for a
// particular purpose, and noninfringement. In no event shall the author be liable
// for any claim, damages, or other liability arising from, out of, or in connection
// with the script or the use or other dealings in the script.
//
// The author grants InnoGames GmbH a royalty-free, non-transferable right to use,
// integrate, and modify this script for the purposes of the game "Tribal Wars".
// All modifications and integrations may be made by InnoGames without further permission.
// Authorship credit shall remain with the original author in all derivative works,
// including versions integrated into the game.
//
// Except for versions directly integrated into the game "Tribal Wars", any modified
// or derivative versions of this script must include this license notice. No other
// person or entity is permitted to modify, adapt, translate, reverse-engineer, sell,
// redistribute, sublicense, or otherwise alter this script in any form or for any
// purpose. All rights not expressly granted to InnoGames GmbH are reserved by the
// author.
// -----------------------------------------------------------------------------------

// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;

// Script Config
var scriptConfig = {
    scriptData: {
        prefix: 'barbsFinder',
        name: 'Barbs Finder',
        version: 'v2.0.2',
        author: 'RedAlert',
        authorUrl: 'https://twscripts.dev/',
        helpLink:
            'https://forum.tribalwars.net/index.php?threads/barb-finder-with-filtering.285289/',
    },
    translations: {
        en_DK: {
            'Barbs Finder': 'Barbs Finder',
            'Min Points:': 'Min Points:',
            'Max Points:': 'Max Points:',
            'Radius:': 'Radius:',
            'Barbs found:': 'Barbs found:',
            'Coordinates:': 'Coordinates:',
            'Error while fetching "village.txt"!':
                'Error while fetching "village.txt"!',
            Coords: 'Coords',
            Points: 'Points',
            'Dist.': 'Dist.',
            Attack: 'Attack',
            Filter: 'Filter',
            Reset: 'Reset',
            'No barbarian villages found!': 'No barbarian villages found!',
            'Current Village:': 'Current Village:',
            'Sequential Scout Script:': 'Sequential Scout Script:',
            Help: 'Help',
            'There was an error!': 'There was an error!',
        },
        sk_SK: {
            'Barbs Finder': 'Hľadač barbariek',
            'Min Points:': 'Min bodov:',
            'Max Points:': 'Max bodov:',
            'Radius:': 'Vzdialenosť:',
            'Barbs found:': 'Nájdené barbarky:',
            'Coordinates:': 'Súradnice:',
            'Error while fetching "village.txt"!':
                'Chyba pri načítaní "village.txt"!',
            Coords: 'Súradnice',
            Points: 'Body',
            'Dist.': 'Vzdial.',
            Attack: 'Útok',
            Filter: 'Filter',
            Reset: 'Reset',
            'No barbarian villages found!':
                'Neboli nájdené žiadne dediny barbarov!',
            'Current Village:': 'Súčasná dedina:',
            'Sequential Scout Script:': 'Sequential Scout Script:',
            Help: 'Pomoc',
            'There was an error!': 'There was an error!',
        },
        fr_FR: {
            'Barbs Finder': 'Recherche de Barbares',
            'Min Points:': 'Points Min.:',
            'Max Points:': 'Points Max.:',
            'Radius:': 'Radius:',
            'Barbs found:': 'Barbs found:',
            'Coordinates:': 'Coordinates:',
            'Error while fetching "village.txt"!':
                'Error while fetching "village.txt"!',
            Coords: 'Coords',
            Points: 'Points',
            'Dist.': 'Dist.',
            Attack: 'Attaquer',
            Filter: 'Filtrer',
            Reset: 'Réinitialiser',
            'No barbarian villages found!': 'No barbarian villages found!',
            'Current Village:': 'Village Actuel:',
            'Sequential Scout Script:': 'Sequential Scout Script:',
            Help: 'Help',
            'There was an error!': 'There was an error!',
        },
        pt_PT: {
            'Barbs Finder': 'Procurador de Bárbaras',
            'Min Points:': 'Pontos mínimos:',
            'Max Points:': 'Pontos máximos:',
            'Radius:': 'Raio:',
            'Barbs found:': 'Bárbaras encontradas:',
            'Coordinates:': 'Coordenadas:',
            'Error while fetching "village.txt"!':
                'Erro ao procurar "village.txt"!',
            Coords: 'Coords',
            Points: 'Pontos',
            'Dist.': 'Dist.',
            Attack: 'Attack',
            Filter: 'Filtro',
            Reset: 'Reset',
            'No barbarian villages found!': 'Não foram encontradas bárbaras!',
            'Current Village:': 'Aldeia Atual:',
            'Sequential Scout Script:': 'Sequential Scout Script:',
            Help: 'Ajuda',
            'There was an error!': 'There was an error!',
        },
        pt_BR: {
            'Barbs Finder': 'Procurador de Bárbaras',
            'Min Points:': 'Pontos mínimos:',
            'Max Points:': 'Pontos máximos:',
            'Radius:': 'Campo:',
            'Barbs found:': 'Bárbaras encontradas:',
            'Coordinates:': 'Coordenadas:',
            'Error while fetching "village.txt"!':
                'Erro ao procurar "village.txt"!',
            Coords: 'Coords',
            Points: 'Pontos',
            'Dist.': 'Dist.',
            Attack: 'Attack',
            Filter: 'Filtro',
            Reset: 'Reset',
            'No barbarian villages found!': 'Não foram encontradas bárbaras!',
            'Current Village:': 'Aldeia Atual:',
            'Sequential Scout Script:': 'Sequential Scout Script:',
            Help: 'Ajuda',
            'There was an error!': 'There was an error!',
        },
        hu_HU: {
            'Barbs Finder': 'Barbi kereső',
            'Min Points:': 'Min pontszám:',
            'Max Points:': 'Max pontszám:',
            'Radius:': 'Hatókör:',
            'Barbs found:': 'Megtalált barbik:',
            'Coordinates:': 'Koordináták:',
            'Error while fetching "village.txt"!':
                'Hiba a "village.txt" beolvasása során!',
            Coords: 'Koordináták',
            Points: 'Pontszám',
            'Dist.': 'Távolság',
            Attack: 'Támadás',
            Filter: 'Szűrés',
            Reset: 'Reset',
            'No barbarian villages found!': 'Nem találtam barbit!',
            'Current Village:': 'Jelenlegi falu:',
            'Sequential Scout Script:': 'Teljes script a kikémleléshez:',
            Help: 'Segítség',
            'There was an error!': 'There was an error!',
        },
        hr_HR: {
            'Barbs Finder': 'Barbari Koordinati',
            'Min Points:': 'Minimalno Poena:',
            'Max Points:': 'Maksimalno Poena:',
            'Radius:': 'Radius:',
            'Barbs found:': 'Barbara pronađeno:',
            'Coordinates:': 'Koordinati:',
            'Error while fetching "village.txt"!':
                'Greška u dohvaćanju podataka "village.txt"!',
            Coords: 'Koordinati',
            Points: 'Poeni',
            'Dist.': 'Distanca.',
            Attack: 'Napad',
            Filter: 'Filter',
            Reset: 'Reset',
            'No barbarian villages found!': 'Nisu pronađena barbarska sela!',
            'Current Village:': 'Trenutno Selo:',
            'Sequential Scout Script:': 'Sekvencijalna izviđačka skripta:',
            Help: 'Pomoć',
            'There was an error!': 'There was an error!',
        },
        pl_PL: {
            'Barbs Finder': 'Znajdz wioski opuszczone',
            'Min Points:': 'Minimalna ilość punktów:',
            'Max Points:': 'Maksymalna ilość punktów:',
            'Radius:': 'Promień:',
            'Barbs found:': 'Znaleziono wiosek:',
            'Coordinates:': 'Kordynaty:',
            'Error while fetching "village.txt"!':
                'Błąd podczas wyszukiwania pliku” village.txt ”!',
            Coords: 'Koordy',
            Points: 'Punkty',
            'Dist.': 'Odległość',
            Attack: 'Atak',
            Filter: 'Znajdź',
            Reset: 'Reset',
            'No barbarian villages found!':
                'Nie znaleziono wiosek barbarzyńskich',
            'Current Village:': 'Obecna wioska:',
            'Sequential Scout Script:': 'Sequential Scout Script:',
            Help: 'Pomoc',
            'There was an error!': 'There was an error!',
        },
        sv_SE: {
            'Barbs Finder': 'Hitta Barbarby',
            'Min Points:': 'Min Poäng:',
            'Max Points:': 'Max Poäng:',
            'Radius:': 'Radius:',
            'Barbs found:': 'Barbarby hittade:',
            'Coordinates:': 'Koordinater:',
            'Error while fetching "village.txt"!':
                'Fel vid hämtning av "village.txt”!',
            Coords: 'Kords',
            Points: 'Poäng',
            'Dist.': 'Avstånd',
            Attack: 'Attackera',
            Filter: 'Filter',
            Reset: 'Återställ',
            'No barbarian villages found!': 'Inga barbarbyar hittade!',
            'Current Village:': 'Nuvarande by:',
            'Sequential Scout Script:': 'Sequential Scout Script:',
            Help: 'Hjälp',
            'There was an error!': 'There was an error!',
        },
        tr_TR: {
            'Barbs Finder': 'Barbar Bulucu',
            'Min Points:': 'Minimum Puan:',
            'Max Points:': 'Maksimum Puan:',
            'Radius:': 'Alan:',
            'Barbs found:': 'Bulunan barbarlar:',
            'Coordinates:': 'Koordinatlar:',
            'Error while fetching "village.txt"!':
                'Arama hatası oluştu "village.txt"!',
            Coords: 'Koordinatlar',
            Points: 'Puanlar',
            'Dist.': 'Uzaklık',
            Attack: 'Saldır',
            Filter: 'Filtre',
            Reset: 'Reset',
            'No barbarian villages found!': 'Barbar bulunamadı!',
            'Current Village:': 'Geçerli Köy',
            'Sequential Scout Script:': 'Sıralı Casus Scripti',
            Help: 'Yardım',
            'There was an error!': 'There was an error!',
        },
        cs_CZ: {
            'Barbs Finder': 'Barbs Finder',
            'Min Points:': 'Min body:',
            'Max Points:': 'Max body:',
            'Radius:': 'Radius:',
            'Barbs found:': 'Nalezené barbarské vesnice:',
            'Coordinates:': 'Souřadnice:',
            'Error while fetching "village.txt"!':
                'Error while fetching "village.txt"!',
            Coords: 'Souřadnice',
            Points: 'Body',
            'Dist.': 'Vzdálenost',
            Attack: 'Útok',
            Filter: 'Filter',
            Reset: 'Reset',
            'No barbarian villages found!':
                'Žádné barbarské vesnice nenalezeny!',
            'Current Village:': 'Aktuální vesnice:',
            'Sequential Scout Script:': 'Skript na špehy:',
            Help: 'Pomoc',
            'There was an error!': 'There was an error!',
        },
    },
    allowedMarkets: [],
    allowedScreens: [],
    allowedModes: [],
    isDebug: DEBUG,
    enableCountApi: true,
};

$.getScript(
    `https://twscripts.dev/scripts/twSDK.js?url=${document.currentScript.src}`,
    async function () {
        // Initialize Library
        await twSDK.init(scriptConfig);
        const scriptInfo = twSDK.scriptInfo();

        const { villages } = await fetchWorldData();

        // Entry point
        try {
            buildUI();
            handleFilterBarbs();
            handleResetFilters();
        } catch (error) {
            UI.ErrorMessage(twSDK.tt('There was an error!'));
            console.error(`${scriptInfo} Error:`, error);
        }

        // === Função para carregar configurações salvas ===
        function loadSavedOptions() {
            const saved = localStorage.getItem(`${scriptConfig.scriptData.prefix}_options`);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.warn(`${scriptInfo} Failed to parse saved options.`);
                }
            }
            return null;
        }

        // === Função para salvar configurações ===
        function saveOptions() {
            const options = {
                currentVillage: $('#raCurrentVillage').val().trim(),
                minPoints: $('#minPoints').val().trim(),
                maxPoints: $('#maxPoints').val().trim(),
                radius: $('#radius_choser').val()
            };
            localStorage.setItem(`${scriptConfig.scriptData.prefix}_options`, JSON.stringify(options));
        }

        // === Render: Build the user interface (modificado) ===
        function buildUI() {
            // Carrega opções salvas
            const savedOptions = loadSavedOptions();

            // Define valores padrão ou usa os salvos
            const defaultVillage = game_data.village.coord;
            const currentVillage = savedOptions?.currentVillage || defaultVillage;
            const minPoints = savedOptions?.minPoints || '26';
            const maxPoints = savedOptions?.maxPoints || '12154';
            const radius = savedOptions?.radius || '50';

            const content = `
                <div class="ra-grid ra-grid-4">
                    <div class="ra-mb15">
                        <label for="raCurrentVillage" class="ra-label">${twSDK.tt('Current Village:')}</label>
                        <input type="text" id="raCurrentVillage" value="${currentVillage}" class="ra-input">
                    </div>
                    <div class="ra-mb15">
                        <label for="radius" class="ra-label">${twSDK.tt('Radius:')}</label>
                        <select id="radius_choser" class="ra-input">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="40">40</option>
                            <option value="50">50</option>
                            <option value="60">60</option>
                            <option value="70">70</option>
                            <option value="80">80</option>
                            <option value="90">90</option>
                            <option value="100">100</option>
                            <option value="110">110</option>
                            <option value="120">120</option>
                            <option value="130">130</option>
                            <option value="140">140</option>
                            <option value="150">150</option>
                            <option value="999">999</option>
                        </select>
                    </div>
                    <div class="ra-mb15">
                        <label for="minPoints" class="ra-label">${twSDK.tt('Min Points:')}</label>
                        <input type="text" id="minPoints" value="${minPoints}" class="ra-input">
                    </div>
                    <div class="ra-mb15">
                        <label for="maxPoints" class="ra-label">${twSDK.tt('Max Points:')}</label>
                        <input type="text" id="maxPoints" value="${maxPoints}" class="ra-input">
                    </div>
                </div>
                <div class="ra-mb15">
                    <a href="javascript:void(0);" id="btnFilterBarbs" class="btn btn-confirm-yes">
                        ${twSDK.tt('Filter')}
                    </a>
                    <a href="javascript:void(0);" id="btnResetFilters" class="btn btn-confirm-no">
                        ${twSDK.tt('Reset')}
                    </a>
                </div>
                <div class="ra-mb15">
                    <strong>${twSDK.tt('Barbs found:')}</strong>
                    <span id="barbsCount">0</span>
                </div>
                <div class="ra-grid ra-grid-2">
                    <div>
                        <label for="barbCoordsList" class="ra-label">${twSDK.tt('Coordinates:')}</label>
                        <textarea id="barbCoordsList" class="ra-textarea" readonly></textarea>
                    </div>
                    <div>
                        <label for="barbScoutScript" class="ra-label">${twSDK.tt('Sequential Scout Script:')}</label>
                        <textarea id="barbScoutScript" class="ra-textarea" readonly></textarea>
                    </div>
                </div>
                <div id="barbariansTable" style="display:none;" class="ra-table-container ra-mt15"></div>
            `;

            const customStyle = `
                .ra-label { display: block; font-weight: 600; margin-bottom: 5px; }
                .ra-input { padding: 5px; width: 100%; display: block; line-height: 1; font-size: 14px; }
                .ra-grid { display: grid; gap: 15px; }
                .ra-grid-2 { grid-template-columns: 1fr 1fr; }
                .ra-grid-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
                .btn-already-sent { padding: 3px; }
                .already-sent-command { opacity: 0.6; }
            `;

            twSDK.renderBoxWidget(
                content,
                scriptConfig.scriptData.prefix,
                'ra-barbs-finder',
                customStyle
            );

            // Aplica o valor salvo no select
            $('#radius_choser').val(radius);
        }

        // === Action Handler: Handle filter barbs event (modificado) ===
        function handleFilterBarbs() {
            jQuery('#btnFilterBarbs').on('click', function (e) {
                e.preventDefault();

                const currentVillage = $('#raCurrentVillage').val().trim();
                const minPoints = parseInt($('#minPoints').val().trim());
                const maxPoints = parseInt($('#maxPoints').val().trim());
                const radius = parseInt($('#radius_choser').val());

                // Validação simples
                if (!currentVillage || isNaN(minPoints) || isNaN(maxPoints) || isNaN(radius)) {
                    UI.ErrorMessage('Invalid input values!');
                    return;
                }

                const barbarians = villages.filter((village) => parseInt(village[4]) === 0);

                // Filtra por pontos
                const filteredBarbs = barbarians.filter((barbarian) => {
                    const points = parseInt(barbarian[5]);
                    return points >= minPoints && points <= maxPoints;
                });

                // Filtra por raio
                const filteredByRadiusBarbs = filteredBarbs.filter((barbarian) => {
                    let barbCoord = barbarian[2] + '|' + barbarian[3];
                    let distance = twSDK.calculateDistance(currentVillage, barbCoord);
                    return distance <= radius;
                });

                // Atualiza resultados
                if (filteredByRadiusBarbs.length > 0) {
                    let barbariansCoordsArray = filteredByRadiusBarbs.map((village) => village[2] + '|' + village[3]);
                    let barbariansCount = barbariansCoordsArray.length;
                    let barbariansCoordsList = barbariansCoordsArray.join(' ');
                    let scoutScript = `javascript:coords='${barbariansCoordsList}';var doc=document;if(window.frames.length>0 && window.main!=null)doc=window.main.document;url=doc.URL;if(url.indexOf('screen=place')==-1)alert('Use the script in the rally point page!');coords=coords.split(' ');index=0;farmcookie=document.cookie.match('(^|;) ?farm=([^;]*)(;|$)');if(farmcookie!=null)index=parseInt(farmcookie[2]);if(index>=coords.length)alert('All villages were extracted, now start from the first!');if(index>=coords.length)index=0;coords=coords[index];coords=coords.split('|');index=index+1;cookie_date=new Date(2030,1,1);document.cookie ='farm='+index+';expires='+cookie_date.toGMTString();doc.forms[0].x.value=coords[0];doc.forms[0].y.value=coords[1];$('#place_target').find('input').val(coords[0]+'|'+coords[1]);doc.forms[0].spy.value=1;`;

                    $('#barbsCount').text(barbariansCount);
                    $('#barbCoordsList').val(barbariansCoordsList);
                    $('#barbScoutScript').val(scoutScript);

                    // Gera tabela (supondo que você tenha essa função)
                    $('#barbariansTable').html(generateBarbariansTable(filteredByRadiusBarbs)).show();
                } else {
                    $('#barbsCount').text('0');
                    $('#barbCoordsList').val('');
                    $('#barbScoutScript').val('');
                    $('#barbariansTable').hide();
                    UI.InfoMessage(twSDK.tt('No barbarian villages found!'));
                }

                // ✅ Salva as opções após filtrar
                saveOptions();
            });
        }

        // === Reset Filters (com limpeza de localStorage) ===
        function handleResetFilters() {
            jQuery('#btnResetFilters').on('click', function (e) {
                e.preventDefault();

                // Restaura valores padrão
                $('#raCurrentVillage').val(game_data.village.coord);
                $('#minPoints').val('26');
                $('#maxPoints').val('12154');
                $('#radius_choser').val('50');

                // Limpa resultados
                $('#barbsCount').text('0');
                $('#barbCoordsList').val('');
                $('#barbScoutScript').val('');
                $('#barbariansTable').hide();

                // ❌ Remove as opções salvas
                localStorage.removeItem(`${scriptConfig.scriptData.prefix}_options`);
            });
        }

        // Função auxiliar (caso use tabela)
        function generateBarbariansTable(barbarians) {
            const currentVillage = $('#raCurrentVillage').val().trim();
            const table = `
                <table class="vis" style="width:100%;">
                    <thead>
                        <tr>
                            <th>${twSDK.tt('Coords')}</th>
                            <th>${twSDK.tt('Points')}</th>
                            <th>${twSDK.tt('Dist.')}</th>
                            <th>${twSDK.tt('Attack')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${barbarians.map(barb => {
                            const coord = `${barb[2]}|${barb[3]}`;
                            const points = barb[5];
                            const distance = twSDK.calculateDistance(currentVillage, coord).toFixed(2);
                            const attackLink = `/game.php?village=${game_data.village.id}&screen=place&target=${coord}`;
                            return `
                                <tr>
                                    <td>${coord}</td>
                                    <td>${points}</td>
                                    <td>${distance}</td>
                                    <td><a href="${attackLink}" target="_blank">${twSDK.tt('Attack')}</a></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
            return table;
        }

        async function fetchWorldData() {
            try {
                const response = await fetch('/interface.php?func=get_map_data');
                const data = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, 'text/xml');
                const villages = Array.from(xmlDoc.getElementsByTagName('village')).map(v => [
                    v.getAttribute('id'),
                    v.getAttribute('player'),
                    v.getAttribute('x'),
                    v.getAttribute('y'),
                    v.getAttribute('tribe'),
                    v.getAttribute('points')
                ]);
                return { villages };
            } catch (error) {
                console.error('Error fetching village data:', error);
                UI.ErrorMessage(twSDK.tt('Error while fetching "village.txt"!'));
                return { villages: [] };
            }
        }
    }
);