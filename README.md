# 📋 Planner Kanban

Um quadro de tarefas simples e funcional, inspirado no Microsoft Planner, onde você pode organizar suas atividades nas colunas **A fazer**, **Fazendo** e **Finalizado**.

## ✨ Funcionalidades

- **Criar cards** com título, responsável e horas estimadas
- **Arrastar e soltar** cards entre as colunas (drag & drop)
- **Excluir cards** que não são mais necessários
- **Persistência local** - os dados são salvos no navegador (localStorage)
- **Contador visual** de quantos cards existem em cada coluna

## 🚀 Como usar

1. Abra o arquivo `index.html` no seu navegador
2. Clique no botão **"+ Criar novo card"** para adicionar uma tarefa
3. Preencha:
   - **Título** (obrigatório)
   - **Responsável** (quem vai executar)
   - **Horas estimadas**
4. O card será criado na coluna **A fazer**
5. **Arraste** o card para movê-lo entre as colunas
6. Clique em **"🗑️ Excluir"** para remover um card

## 📁 Estrutura
planner/
├── index.html # Estrutura HTML
├── style.css # Estilização do Projeto
├── script.js # Lógica de toda a página
└── README.md # Este arquivo

## 🛠️ Tecnologias

- HTML5
- CSS3 (Flexbox, Grid, animações)
- JavaScript puro (Drag & Drop nativo, localStorage)

## 💾 Dados

Os cards são salvos automaticamente no **localStorage** do navegador. Ao fechar e reabrir a página, suas tarefas continuarão lá.

## 📱 Responsivo

Funciona em telas de computador, tablets e smartphones. Em dispositivos menores, as colunas são empilhadas verticalmente.

---

Desenvolvido como um projeto simples e funcional de organização de tarefas.
