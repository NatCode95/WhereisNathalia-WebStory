/**
 * Lógica Principal con asistencia, porque de lo contrario funciona diferente
 */

document.addEventListener('DOMContentLoaded', () => {
    const pageConfig = {
        'phase1': { index: 0, next: 'transit.html', prev: null },
        'phase2': { index: 1, next: 'arrival.html', prev: 'index.html' },
        'phase3': { index: 2, next: 'stay.html', prev: 'transit.html' },
        'phase4': { index: 3, next: 'return.html', prev: 'arrival.html' },
        'phase5': { index: 4, next: null, prev: 'stay.html' }
    };

    let currentPhaseId = null;
    for (const id in pageConfig) {
        if (document.getElementById(id)) {
            currentPhaseId = id;
            break;
        }
    }

    const config = currentPhaseId ? pageConfig[currentPhaseId] : { index: 0 };
    const totalPhases = 5;

    /*
    ---> INICIO DE LA LÓGICA <---
    */
    function init() {
        updateUI();
        setupGlobalListeners();
        
        // Ejecutar lógica específica de fase
        if (currentPhaseId === 'phase1') setupPhase1();
        if (currentPhaseId === 'phase2') setupPhase2();
        if (currentPhaseId === 'phase3') setupPhase3();
        if (currentPhaseId === 'phase4') setupPhase4();
        if (currentPhaseId === 'phase5') setupPhase5();
        
        console.log(`Story initialized - ${currentPhaseId}`);
    }

    /*
    ---> ACTUALIZACIÓN DE INTERFAZ <---
    */
    function updateUI() {
        // Highlight active menu item
        const menuBtns = document.querySelectorAll('.menu-btn');
        menuBtns.forEach(btn => {
            const phaseNum = parseInt(btn.dataset.phase);
            if (phaseNum === config.index + 1) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Configurar botón de retorno / Return button logic removed
    }

    /*
    ---> LISTENERS GLOBALES <---
    */
    function setupGlobalListeners() {
        // Menu Navigation
        const menuBtns = document.querySelectorAll('.menu-btn');
        menuBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const phaseNum = parseInt(btn.dataset.phase);
                
                // Map number to file
                let targetFile = 'index.html';
                if (phaseNum === 2) targetFile = 'transit.html';
                if (phaseNum === 3) targetFile = 'arrival.html';
                if (phaseNum === 4) targetFile = 'stay.html';
                if (phaseNum === 5) targetFile = 'return.html';
                
                window.location.href = targetFile;
            });
        });
    }

    /*
    ---> FASE 1: LÓGICA DE EMPAQUE <---
     */
    function setupPhase1() {
        const suitcase = document.getElementById('suitcaseTarget');
        const itemsContainer = document.getElementById('packingItems');
        const nextBtn1 = document.getElementById('nextBtn1');
        const scene = document.getElementById('scene1');
        
        if(!suitcase || !itemsContainer) return;

        const totalItems = 8;
        let packedCount = 0;
        const requiredToPack = 3;

        itemsContainer.innerHTML = '';
        
        const placedItems = [];

        for (let i = 1; i <= totalItems; i++) {
            const img = document.createElement('img');
            img.src = `img/index-1-${i}.png`;
            img.classList.add('pack-item');
            img.alt = `Item ${i}`;
            
            // Posicionamiento aleatorio
            // Utilizar el ancho y alto del contenedor para que el item se coloque dentro del contenedor y no se quede a medias
            const containerWidth = itemsContainer.clientWidth || scene.clientWidth || 300;
            const containerHeight = itemsContainer.clientHeight || scene.clientHeight || 300;
            
            // Determinar el tamaño del item basado en el ancho de la pantalla (matching CSS)
            // CSS: 60px base, 80px si min-width: 768px
            const isDesktop = window.innerWidth >= 768;
            const itemSize = isDesktop ? 80 : 60;
            
            let randomTop, randomLeft;
            let attempts = 0;
            const maxAttempts = 100;
            let overlap = false;
            
            // Zona de la maletín (aproximada)
            // Ancho de la maletín 150px, centrada. Altura aproximada 100px?
            // Izquierda: centro - 75, Derecha: centro + 75. 
            // Abajo: 20px desde el fondo.
            const suitcaseWidth = 160; // ligeramente reforzado
            const suitcaseHeight = 120; // estimado
            const scLeft = (containerWidth / 2) - (suitcaseWidth / 2);
            const scTop = containerHeight - suitcaseHeight - 20;
            
            const suitcaseZone = {
                left: scLeft,
                right: scLeft + suitcaseWidth,
                top: scTop,
                bottom: containerHeight
            };

            do {
                overlap = false;
                
                // Generar posición aleatoria dentro de los límites
                // Asegúrate de que el item esté completamente dentro con: max left = width - itemSize
                // Max top = height - itemSize 
                // Padding 10px 
                const maxLeft = containerWidth - itemSize - 10;
                const maxTop = containerHeight - itemSize - 10;
                
                // Use pixels for calculation
                const pxLeft = Math.floor(Math.random() * (maxLeft - 20)) + 10;
                const pxTop = Math.floor(Math.random() * (maxTop - 20)) + 10;
                
                const proposedRect = {
                    left: pxLeft,
                    right: pxLeft + itemSize,
                    top: pxTop,
                    bottom: pxTop + itemSize
                };
                
                // Revisar Overlap con el maletín
                if (checkRectOverlap(proposedRect, suitcaseZone)) {
                    overlap = true;
                } else {
                    // Revisar Overlap con otros items
                    for (const placed of placedItems) {
                        // Añadir padding para evitar superposiciones
                        const paddedPlaced = {
                            left: placed.left - 5,
                            right: placed.right + 5,
                            top: placed.top - 5,
                            bottom: placed.bottom + 5
                        };
                        if (checkRectOverlap(proposedRect, paddedPlaced)) {
                            overlap = true;
                            break;
                        }
                    }
                }
                
                if (!overlap) {
                    randomLeft = pxLeft;
                    randomTop = pxTop;
                }
                
                attempts++;
            } while (overlap && attempts < maxAttempts);
            
            // Volver a intentar si no se encuentra un lugar (apilar en la esquina superior izquierda)
            if (overlap) {
                randomLeft = 10 + (i * 5);
                randomTop = 10;
            }

            placedItems.push({
                left: randomLeft,
                top: randomTop,
                right: randomLeft + itemSize,
                bottom: randomTop + itemSize
            });
            
            // Escalado constante de todas las imágenes
            const scale = 1.0; 
            
            // Usando px asegura que el lugar calculado libre de colisión, es decir, que NO se apilen entre sí, sea respetado exactamente
            img.style.left = `${randomLeft}px`;
            img.style.top = `${randomTop}px`;
            img.style.transform = `scale(${scale})`; 
            img.style.zIndex = Math.floor(Math.random() * 10) + 20;
            
            img.addEventListener('click', () => {
                packItem(img);
            });
            
            itemsContainer.appendChild(img);
        }

        function checkRectOverlap(r1, r2) {
            return !(r1.right < r2.left || 
                     r1.left > r2.right || 
                     r1.bottom < r2.top || 
                     r1.top > r2.bottom);
        }

        function packItem(element) {
            if (element.classList.contains('packed')) return; // Evita doble clic
            
            // Animate to suitcase
            const suitcaseRect = suitcase.getBoundingClientRect();
            const itemRect = element.getBoundingClientRect();
            
            // Calculate translation to center of suitcase
            // Usamos transform en CSS para el movimiento visual, pero ya que estamos usando posición absoluta, es difícil.
            // Easiest: Add class 'packed' que escala y desvanece.
            
            element.classList.add('packed');
            suitcase.classList.add('packed');
            
            setTimeout(() => suitcase.classList.remove('packed'), 500);
            
            packedCount++;

            if (packedCount >= requiredToPack) {
                // Mostrar botón si no está ya mostrado
                if (nextBtn1.classList.contains('hidden')) {
                    setTimeout(() => {
                        nextBtn1.classList.remove('hidden');
                        nextBtn1.onclick = () => window.location.href = config.next;
                    }, 500);
                }
            }
        }
    }

    /*
    ---> FASE 2: LÓGICA DE TRÁNSITO <---
     */
    function setupPhase2() {
        const character = document.getElementById('travelsuitcase');
        const destination = document.getElementById('transitDestination');
        const scene = document.getElementById('scene2');
        const pathContainer = document.getElementById('pathContainer');
        
        if(!character) return;

        // 1. Aquí se genera la ruta de curva aleatoria
        generateRandomPath();

        function generateRandomPath() {
            if(!pathContainer) return;
            
            // Se obtienen las dimensiones del contenedor
            const width = scene.clientWidth;
            const height = scene.clientHeight;
            
            // Se definen los puntos de inicio y fin de la ruta
            const startX = width * 0.1;
            const startY = height * 0.5;
            
            const endX = width * 0.9;
            const endY = height * 0.5;
            
            // Puntos de control para la curva Bezier
            const cp1x = startX + (width * 0.3);
            const cp1y = Math.random() * height; // Igual para que sea random
            
            const cp2x = startX + (width * 0.6);
            const cp2y = Math.random() * height; // Igual para que sea random
            
            // Se crea el SVG
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            svg.style.position = "absolute";
            svg.style.top = "0";
            svg.style.left = "0";
            
            const path = document.createElementNS(svgNS, "path");
            const d = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
            
            path.setAttribute("d", d);
            path.setAttribute("stroke", "#999756"); // Primary color
            path.setAttribute("stroke-width", "4");
            path.setAttribute("stroke-dasharray", "10, 10"); // Dashed style
            path.setAttribute("fill", "none");
            path.style.opacity = "0.6";
            
            svg.appendChild(path);
            pathContainer.innerHTML = '';
            pathContainer.appendChild(svg);
        }

        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        character.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);

        character.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', endDrag);

        function startDrag(e) {
            isDragging = true;
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            
            startX = clientX;
            startY = clientY;
            
            // Se obtienen las coordenadas iniciales del elemento
            initialLeft = character.offsetLeft;
            initialTop = character.offsetTop;

            character.style.cursor = 'grabbing';
            e.preventDefault();
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            
            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            // Se aplica el movimiento
            character.style.left = `${initialLeft + deltaX}px`;
            character.style.top = `${initialTop + deltaY}px`;
            
            // Feedback visual en el destino
            checkCollision();
        }

        function endDrag(e) {
            if (!isDragging) return;
            isDragging = false;
            character.style.cursor = 'grab';
            
            if(checkCollision()) {
                character.style.pointerEvents = 'none'; // Deshabilitar interacción
                
                // Se obtienen las coordenadas del destino
                const destRect = destination.getBoundingClientRect();
                const sceneRect = scene.getBoundingClientRect();
                
                // Se calcula la posición relativa al contenedor
                
                const destCenterX = destRect.left - sceneRect.left + (destRect.width / 2);
                const destCenterY = destRect.top - sceneRect.top + (destRect.height / 2);
                
                character.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; // que el movimiento sea suave
                character.style.left = `${destCenterX}px`;
                character.style.top = `${destCenterY}px`;
                
                // Se asegura de que no haya otro posicionamiento que interfiera
                character.style.right = ''; 
                character.style.bottom = '';
                
                // Se espera un poco más para que el usuario aprecie el estado de éxito
                setTimeout(() => window.location.href = config.next, 1500);
            }
        }

        function checkCollision() {
            const charRect = character.getBoundingClientRect();
            const destRect = destination.getBoundingClientRect();

            const overlap = !(charRect.right < destRect.left || 
                            charRect.left > destRect.right || 
                            charRect.bottom < destRect.top || 
                            charRect.top > destRect.bottom);
            
            if (overlap) {
                destination.style.backgroundColor = 'rgba(153, 151, 86, 0.5)';
                destination.style.transform = 'translateY(-50%) scale(1.1)';
                return true;
            } else {
                destination.style.backgroundColor = 'transparent';
                destination.style.transform = 'translateY(-50%)';
                return false;
            }
        }
    }

    /*
     ---> FASE 3: LLEGADA <---
     */
    function setupPhase3() {
        const scene = document.getElementById('scene3'); // El scroll del contenedor
        if(!scene) return;

        const text = document.querySelector('.arrival-text');
        
        // Se asegura de que el botón existe (puede ser reutilizado si ya existe o creado)
        let btn = document.querySelector('.next-btn-phase3');
        if (!btn) {
            btn = document.createElement('button');
            btn.textContent = "Dive into the city";
            btn.className = "next-btn next-btn-phase3 hidden";
            // Se agrega al wrapper (padre del scene) para que esté fuera del área de scroll pero dentro de la fase
            document.querySelector('#phase3 .content-wrapper').appendChild(btn);
            
            btn.addEventListener('click', () => {
                window.location.href = config.next;
            });
        }

        scene.addEventListener('scroll', () => {
            const scrollTop = scene.scrollTop;
            const maxScroll = scene.scrollHeight - scene.clientHeight;
            const scrollPercent = scrollTop / maxScroll;

            // Se muestra el texto/botón cerca del final
            if (scrollPercent > 0.9) {
                if(text) text.style.opacity = 1;
                btn.classList.remove('hidden');
            } else {
                if(text) text.style.opacity = 0;
                // Se mantiene el botón visible una vez revelado? o Toggle?
                // Toggle is fine for "scroll to clear" metaphor
                // btn.classList.add('hidden'); 
            }
        });
    }

    /*
     ---> FASE 4: ESTANCIA (Imagen + Interacción) <---
     */
    function setupPhase4() {
        const grid = document.getElementById('communityGrid');
        if(!grid) return;
        
        // items del 1 al 6, que son las imagenes creadas
        const totalHouses = 6;
        let connectedCount = 0;
        const requiredToConnect = 3;
        
        // Se remueve el botón si existe para evitar duplicados al re-ejecutar (aunque innerHTML limpia la cuadrícula)
        // realmente el botón se agrega al content-wrapper, por lo que debemos verificar si existe.
        let btn = document.querySelector('.next-btn-phase4');
        if(!btn) {
             btn = document.createElement('button');
             btn.textContent = "Continue the Journey";
             btn.className = "next-btn next-btn-phase4 hidden";
             document.querySelector('#phase4 .content-wrapper').appendChild(btn);
             
             btn.addEventListener('click', () => {
                window.location.href = config.next;
            });
        }

        grid.innerHTML = '';
        
        for (let i = 1; i <= totalHouses; i++) {
            // Container para la imagen + pseudo-elemento corazón
            const houseContainer = document.createElement('div');
            houseContainer.className = 'house-item'; 
            
            const img = document.createElement('img');
            img.src = `img/stay-${i}.png`;
            img.alt = `Community Home ${i}`;
            img.className = 'house-img';
            
            houseContainer.appendChild(img);
            
            houseContainer.addEventListener('click', () => {
                if(houseContainer.classList.contains('connected')) return;
                
                houseContainer.classList.add('connected');
                connectedCount++;
                
                if (connectedCount >= requiredToConnect) {
                    btn.classList.remove('hidden');
                }
            });
            
            grid.appendChild(houseContainer);
        }
    }

    /*
     ---> FASE 5: RETORNO <---
     */
    function setupPhase5() {
        const stayBtn = document.getElementById('stayBtn');
        const returnBtn = document.getElementById('returnBtn');
        const scene = document.getElementById('scene5');
        
        if(!stayBtn) return;

        stayBtn.addEventListener('click', () => {
            showFinalMessage('New Roots', 'You chose to build a future here, honoring where you came from while embracing the new.<3', { text: 'Restart the Journey', handler: () => window.location.href='index.html' });
            // Botones permanecen activos para permitir re-apertura
        });
        returnBtn.addEventListener('click', () => {
            showFinalMessage('The Return', 'You chose to return, bringing back wisdom and new perspectives to your home.', { text: 'Continue the Journey', handler: () => window.location.href='index.html' });
            // Botones permanecen activos para permitir re-apertura
        });
        
        function showFinalMessage(title, body, action) {
            // Se remueve el mensaje existente si existe
            const existing = document.querySelector('.final-message');
            if(existing) existing.remove();
            
            const msg = document.createElement('div');
            msg.className = 'final-message';
            
            // Botón de cierre
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-msg-btn';
            closeBtn.innerHTML = '&times;';
            closeBtn.ariaLabel = "Close message";
            closeBtn.onclick = () => msg.remove();
            
            const h1 = document.createElement('h1');
            h1.textContent = title;
            
            const p = document.createElement('p');
            p.textContent = body;
            
            const btn = document.createElement('button');
            btn.textContent = action.text;
            btn.className = 'nav-btn';
            btn.onclick = action.handler;
            
            msg.appendChild(closeBtn);
            msg.appendChild(h1);
            msg.appendChild(p);
            msg.appendChild(btn);
            
            // Se agrega al wrapper o escena
             document.querySelector('#phase5 .content-wrapper').appendChild(msg);
        }
    }

    init();
});
