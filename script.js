// ----- Gerenciamento de dados -----
    // Cada card terá: id, titulo, responsavel, horas, status (todo, doing, done)
    let cards = [];

    // Carregar dados salvos no localStorage
    function loadFromStorage() {
        const stored = localStorage.getItem('plannerCards');
        if (stored) {
            try {
                cards = JSON.parse(stored);
            } catch(e) { cards = []; }
        }
        if (!cards.length) {
            // dados de exemplo para demonstração
            cards = [
                { id: '1', title: 'Criar estrutura HTML', assignee: 'Ana', hours: 2, status: 'todo' },
                { id: '2', title: 'Definir paleta de cores', assignee: 'Carlos', hours: 1.5, status: 'todo' },
                { id: '3', title: 'Implementar drag & drop', assignee: 'Mariana', hours: 3, status: 'doing' },
                { id: '4', title: 'Revisar UX do planner', assignee: 'João', hours: 1, status: 'done' },
                { id: '5', title: 'Escrever documentação', assignee: 'Equipe', hours: 2, status: 'doing' }
            ];
        }
    }

    function saveToStorage() {
        localStorage.setItem('plannerCards', JSON.stringify(cards));
    }

    // Gerar ID único
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    }

    // Renderizar todas as colunas
    function renderBoard() {
        // Filtrar cards por status
        const todoCards = cards.filter(c => c.status === 'todo');
        const doingCards = cards.filter(c => c.status === 'doing');
        const doneCards = cards.filter(c => c.status === 'done');

        // Atualizar contadores
        document.getElementById('todo-count').innerText = todoCards.length;
        document.getElementById('doing-count').innerText = doingCards.length;
        document.getElementById('done-count').innerText = doneCards.length;

        // Renderizar containers
        renderColumn('todo-cards', todoCards);
        renderColumn('doing-cards', doingCards);
        renderColumn('done-cards', doneCards);
    }

    function renderColumn(containerId, cardsArray) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (cardsArray.length === 0) {
            container.innerHTML = `<div class="empty-message">✨ Nenhum card aqui<br>Arraste ou crie um novo</div>`;
            return;
        }

        container.innerHTML = '';
        cardsArray.forEach(card => {
            const cardElement = createCardElement(card);
            container.appendChild(cardElement);
        });
    }

    function createCardElement(card) {
        const div = document.createElement('div');
        div.className = 'task-card';
        div.setAttribute('data-id', card.id);
        div.setAttribute('draggable', 'true');
        // cor da borda esquerda baseada no status (opcional)
        let borderColor = '#ffab2e';
        if (card.status === 'doing') borderColor = '#2b88d9';
        if (card.status === 'done') borderColor = '#2c9e6e';
        div.style.borderLeftColor = borderColor;
        
        // título
        const titleSpan = document.createElement('div');
        titleSpan.className = 'card-title';
        titleSpan.innerText = card.title;
        
        // meta informações
        const metaDiv = document.createElement('div');
        metaDiv.className = 'card-meta';
        
        // responsável
        const assigneeSpan = document.createElement('span');
        assigneeSpan.className = 'meta-item';
        assigneeSpan.innerHTML = `👤 ${escapeHtml(card.assignee) || '—'}`;
        
        // horas
        const hoursSpan = document.createElement('span');
        hoursSpan.className = 'meta-item hours-badge';
        const hourValue = card.hours ? parseFloat(card.hours).toFixed(1) : '0';
        hoursSpan.innerHTML = `⏱️ ${hourValue} h`;
        
        metaDiv.appendChild(assigneeSpan);
        metaDiv.appendChild(hoursSpan);
        
        // footer com botão deletar
        const footer = document.createElement('div');
        footer.className = 'card-footer';
        const delBtn = document.createElement('button');
        delBtn.innerText = '🗑️ Excluir';
        delBtn.className = 'delete-card';
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteCardById(card.id);
        });
        footer.appendChild(delBtn);
        
        div.appendChild(titleSpan);
        div.appendChild(metaDiv);
        div.appendChild(footer);
        
        // eventos drag and drop
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);
        return div;
    }

    // escape simples para evitar XSS
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
            return c;
        });
    }

    // deletar card
    function deleteCardById(id) {
        cards = cards.filter(c => c.id !== id);
        saveToStorage();
        renderBoard();
        attachDragDropEvents(); // reatachar eventos nos containers drop
    }

    // ----- Lógica de Drag & Drop -----
    let draggedItemId = null;

    function handleDragStart(e) {
        const cardDiv = e.target.closest('.task-card');
        if (!cardDiv) {
            e.preventDefault();
            return false;
        }
        draggedItemId = cardDiv.getAttribute('data-id');
        e.dataTransfer.setData('text/plain', draggedItemId);
        e.dataTransfer.effectAllowed = 'move';
        cardDiv.classList.add('dragging');
    }

    function handleDragEnd(e) {
        const cardDiv = e.target.closest('.task-card');
        if (cardDiv) cardDiv.classList.remove('dragging');
        draggedItemId = null;
        // remover estilos visuais extras dos containers
        document.querySelectorAll('.cards-container').forEach(cont => {
            cont.style.backgroundColor = '';
        });
    }

    // configurar containers para permitir drop
    function attachDragDropEvents() {
        const containers = document.querySelectorAll('.cards-container');
        containers.forEach(container => {
            // prevenir comportamento padrão para permitir drop
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                container.style.backgroundColor = '#f1f5fe';
            });
            container.addEventListener('dragleave', () => {
                container.style.backgroundColor = '';
            });
            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.style.backgroundColor = '';
                const targetContainer = e.currentTarget;
                // descobrir qual coluna (pai .column)
                const columnDiv = targetContainer.closest('.column');
                if (!columnDiv) return;
                const newStatus = columnDiv.getAttribute('data-status'); // 'todo', 'doing', 'done'
                if (!draggedItemId) return;
                
                // encontrar card no array
                const draggedCard = cards.find(c => c.id === draggedItemId);
                if (draggedCard && draggedCard.status !== newStatus) {
                    // atualizar status
                    draggedCard.status = newStatus;
                    saveToStorage();
                    renderBoard();
                    attachDragDropEvents(); // reaplica eventos após re-render
                } else if (draggedCard && draggedCard.status === newStatus) {
                    // mesmo local, não faz nada
                }
                draggedItemId = null;
            });
        });
    }

    // ----- Modal de criação de card -----
    const modal = document.getElementById('modalOverlay');
    const openBtn = document.getElementById('openModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const confirmBtn = document.getElementById('confirmCardBtn');
    const titleInput = document.getElementById('cardTitle');
    const assigneeInput = document.getElementById('cardAssignee');
    const hoursInput = document.getElementById('cardHours');

    function openModal() {
        modal.classList.add('active');
        titleInput.value = '';
        assigneeInput.value = '';
        hoursInput.value = '';
        titleInput.focus();
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    function createNewCard() {
        const title = titleInput.value.trim();
        if (!title) {
            alert('Por favor, informe um título para o card.');
            titleInput.focus();
            return;
        }
        const assignee = assigneeInput.value.trim() || 'Não definido';
        let hours = parseFloat(hoursInput.value);
        if (isNaN(hours)) hours = 0;
        if (hours < 0) hours = 0;
        
        const newCard = {
            id: generateId(),
            title: title,
            assignee: assignee,
            hours: hours,
            status: 'todo'   // sempre começa em "A fazer"
        };
        cards.push(newCard);
        saveToStorage();
        renderBoard();
        attachDragDropEvents();
        closeModal();
    }

    openBtn.addEventListener('click', openModal);
    cancelBtn.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', createNewCard);
    // fechar modal ao clicar no overlay
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    // tecla Enter no campo título também pode criar
    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') createNewCard();
    });

    // Inicialização
    function init() {
        loadFromStorage();
        renderBoard();
        attachDragDropEvents();
        // Prevenir drag padrão de imagens e links
        window.addEventListener('dragstart', (e) => {
            if (!e.target.closest('.task-card')) {
                e.preventDefault();
                return false;
            }
        });
    }
    
    init();