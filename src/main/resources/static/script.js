/**
 * URL base do ComponenteController no backend Spring Boot.
 * Todas as requisições HTTP utilizarão este endpoint como ponto de partida.
 */
const API_BASE_URL = "http://localhost:8080/componente";

// Variável para armazenar em memória o último computador encontrado na busca,
// facilitando as ações rápidas de atualizar ou deletar a partir do card de resultado.
let computadorEncontradoAtual = null;

// =============================================================================
// FUNÇÕES UTILITÁRIAS DE INTERFACE
// =============================================================================

/**
 * Exibe um alerta visual na parte superior da tela para dar feedback claro
 * ao usuário após cada operação HTTP (sucesso, erro, aviso ou informação).
 *
 * @param {string} mensagem - Texto a ser exibido no alerta.
 * @param {string} tipo - Classe de cor do Bootstrap ('success', 'danger', 'warning', 'info').
 */
function exibirAlerta(mensagem, tipo = "info") {
    const alertContainer = document.getElementById("alert-container");

    const icones = {
        success: "bi-check-circle-fill",
        danger: "bi-exclamation-triangle-fill",
        warning: "bi-exclamation-circle-fill",
        info: "bi-info-circle-fill"
    };

    const iconeSelecionado = icones[tipo] || icones.info;

    alertContainer.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show d-flex align-items-center shadow-sm" role="alert">
            <i class="bi ${iconeSelecionado} me-2 fs-5"></i>
            <div>${mensagem}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
        </div>
    `;
}

/**
 * Converte um campo de texto opcional do formulário de atualização:
 * - Se o usuário deixar o campo vazio (ou só com espaços), retorna `null`
 *   para que o backend mantenha o valor antigo do banco de dados.
 * - Caso contrário, retorna o texto digitado.
 */
function textoOuNull(valor) {
    const textoLimpo = valor.trim();
    return textoLimpo === "" ? null : textoLimpo;
}

/**
 * Converte o valor do <select> booleano na tela de atualização:
 * - "" (Manter atual) -> retorna `null`
 * - "true" (Sim)      -> retorna `true`
 * - "false" (Não)     -> retorna `false`
 */
function booleanoOuNull(valorSelect) {
    if (valorSelect === "true") return true;
    if (valorSelect === "false") return false;
    return null;
}

// =============================================================================
// 1. CADASTRAR COMPUTADOR — REQUISIÇÃO HTTP POST
// =============================================================================

document.getElementById("form-cadastrar").addEventListener("submit", async function (event) {
    event.preventDefault(); // Evita o recarregamento padrão da página

    // Monta o objeto JSON exatamente com os atributos esperados pela entidade Componente
    // (sem enviar idPC, pois ele é gerado automaticamente pelo PostgreSQL).
    const novoComputador = {
        nome: document.getElementById("cad-nome").value.trim(),
        gabinete: document.getElementById("cad-gabinete").value.trim(),
        cpu: document.getElementById("cad-cpu").value.trim(),
        gpu: document.getElementById("cad-gpu").value.trim(),
        ram: document.getElementById("cad-ram").value.trim(),
        dualchannel: document.getElementById("cad-dualchannel").checked,
        armazenamento: document.getElementById("cad-armazenamento").value.trim(),
        bluetooth: document.getElementById("cad-bluetooth").checked
    };

    try {
        /**
         * Envia uma requisição HTTP POST para http://localhost:8080/componente.
         * - method: 'POST' indica criação de um novo recurso no servidor.
         * - headers: 'Content-Type: application/json' informa ao Spring Boot que o corpo está em JSON.
         * - body: JSON.stringify() serializa o objeto JavaScript em texto JSON.
         */
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(novoComputador)
        });

        // Verifica se o status HTTP está na faixa de sucesso (200-299)
        if (!response.ok) {
            throw new Error(`Erro HTTP ao cadastrar: status ${response.status}`);
        }

        // Como o backend retorna ResponseEntity<Void> (status 200 OK com corpo vazio),
        // NÃO chamamos response.json() aqui.
        exibirAlerta(`Computador <strong>"${novoComputador.nome}"</strong> cadastrado com sucesso!`, "success");
        event.target.reset(); // Limpa o formulário após o cadastro
    } catch (error) {
        console.error("Erro na requisição POST:", error);
        exibirAlerta("Não foi possível cadastrar o computador. Verifique se o servidor backend está ativo.", "danger");
    }
});

// =============================================================================
// 2. BUSCAR COMPUTADOR POR ARMAZENAMENTO — REQUISIÇÃO HTTP GET
// =============================================================================

document.getElementById("form-buscar").addEventListener("submit", async function (event) {
    event.preventDefault();

    const armazenamentoInput = document.getElementById("busca-armazenamento").value.trim();
    const cardResultado = document.getElementById("resultado-busca");

    // encodeURIComponent garante que espaços e caracteres especiais (ex: "SSD 512GB")
    // sejam codificados corretamente na URL como query parameter (?armazenamento=...)
    const urlBusca = `${API_BASE_URL}?armazenamento=${encodeURIComponent(armazenamentoInput)}`;

    try {
        /**
         * Envia uma requisição HTTP GET (método padrão do fetch) para consultar dados.
         * Requisições GET não possuem corpo (body); o filtro vai na própria URL.
         */
        const response = await fetch(urlBusca, {
            method: "GET"
        });

        // Quando o armazenamento não é encontrado, o backend lança RuntimeException (status 500).
        if (!response.ok) {
            computadorEncontradoAtual = null;
            cardResultado.classList.add("d-none");

            if (response.status === 500) {
                exibirAlerta(`Nenhum computador foi encontrado com o armazenamento <strong>"${armazenamentoInput}"</strong>.`, "warning");
                return;
            }
            throw new Error(`Erro HTTP na busca: status ${response.status}`);
        }

        // Converte o JSON retornado pelo backend em um objeto JavaScript Componente
        const componente = await response.json();
        computadorEncontradoAtual = componente;

        // Preenche os elementos visuais do card com os dados recebidos
        document.getElementById("res-id").textContent = `ID: #${componente.idPC}`;
        document.getElementById("res-nome").textContent = componente.nome;
        document.getElementById("res-gabinete").textContent = componente.gabinete;
        document.getElementById("res-cpu").textContent = componente.cpu;
        document.getElementById("res-gpu").textContent = componente.gpu;
        document.getElementById("res-ram").textContent = componente.ram;
        document.getElementById("res-armazenamento").textContent = componente.armazenamento;

        // Converte os valores booleanos (true/false) para texto amigável ("Sim"/"Não")
        document.getElementById("res-dualchannel").textContent = componente.dualchannel ? "Sim" : "Não";
        document.getElementById("res-bluetooth").textContent = componente.bluetooth ? "Sim" : "Não";

        // Exibe o card de resultado e mostra alerta de sucesso
        cardResultado.classList.remove("d-none");
        exibirAlerta(`Computador <strong>"${componente.nome}"</strong> (ID #${componente.idPC}) localizado com sucesso!`, "success");
    } catch (error) {
        console.error("Erro na requisição GET:", error);
        cardResultado.classList.add("d-none");
        exibirAlerta("Erro ao buscar computador. Verifique a conexão com o backend em http://localhost:8080.", "danger");
    }
});

// =============================================================================
// 3. ATUALIZAR COMPUTADOR POR ID — REQUISIÇÃO HTTP PUT
// =============================================================================

document.getElementById("form-atualizar").addEventListener("submit", async function (event) {
    event.preventDefault();

    const idPC = parseInt(document.getElementById("upd-id").value, 10);

    // Na URL o parâmetro se chama "id" (?id=...), enquanto no JSON o atributo é "idPC".
    // Campos em branco ou "Manter atual" são enviados como `null` para não sobrescrever dados antigos.
    const dadosAtualizacao = {
        idPC: idPC,
        nome: textoOuNull(document.getElementById("upd-nome").value),
        gabinete: textoOuNull(document.getElementById("upd-gabinete").value),
        cpu: textoOuNull(document.getElementById("upd-cpu").value),
        gpu: textoOuNull(document.getElementById("upd-gpu").value),
        ram: textoOuNull(document.getElementById("upd-ram").value),
        dualchannel: booleanoOuNull(document.getElementById("upd-dualchannel").value),
        armazenamento: textoOuNull(document.getElementById("upd-armazenamento").value),
        bluetooth: booleanoOuNull(document.getElementById("upd-bluetooth").value)
    };

    const urlAtualizacao = `${API_BASE_URL}?id=${encodeURIComponent(idPC)}`;

    try {
        /**
         * Envia uma requisição HTTP PUT para http://localhost:8080/componente?id={idPC}.
         * - method: 'PUT' indica atualização de um registro existente.
         * - headers: 'Content-Type: application/json' define o formato do payload.
         * - body: envia o JSON contendo os campos alterados e `null` nos campos mantidos.
         */
        const response = await fetch(urlAtualizacao, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosAtualizacao)
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP ao atualizar: status ${response.status}`);
        }

        // O backend retorna status 200 OK com corpo vazio; não executamos response.json().
        exibirAlerta(`Computador de <strong>ID #${idPC}</strong> atualizado com sucesso!`, "success");
        event.target.reset();
    } catch (error) {
        console.error("Erro na requisição PUT:", error);
        exibirAlerta(`Não foi possível atualizar o computador de ID #${idPC}. Verifique se o ID existe no banco.`, "danger");
    }
});

// =============================================================================
// 4. DELETAR COMPUTADOR POR ARMAZENAMENTO — REQUISIÇÃO HTTP DELETE
// =============================================================================

/**
 * Função reutilizável que executa a requisição HTTP DELETE pelo armazenamento.
 * Pode ser chamada tanto pelo formulário da aba "Deletar" quanto pelo botão rápido
 * do card de resultado da busca.
 *
 * @param {string} armazenamento - Valor do campo armazenamento do registro a ser deletado.
 */
async function deletarComputadorPorArmazenamento(armazenamento) {
    const urlDelete = `${API_BASE_URL}?armazenamento=${encodeURIComponent(armazenamento)}`;

    try {
        /**
         * Envia uma requisição HTTP DELETE para http://localhost:8080/componente?armazenamento={valor}.
         * - method: 'DELETE' solicita a remoção do recurso identificado pelo query parameter.
         */
        const response = await fetch(urlDelete, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP ao deletar: status ${response.status}`);
        }

        // O backend retorna 200 OK com corpo vazio; não executamos response.json().
        exibirAlerta(`Computador com armazenamento <strong>"${armazenamento}"</strong> deletado com sucesso!`, "success");

        // Se o registro deletado era o que estava exibido na aba de busca, oculta o card
        if (computadorEncontradoAtual && computadorEncontradoAtual.armazenamento === armazenamento) {
            document.getElementById("resultado-busca").classList.add("d-none");
            computadorEncontradoAtual = null;
        }
    } catch (error) {
        console.error("Erro na requisição DELETE:", error);
        exibirAlerta(`Erro ao deletar o computador com armazenamento "${armazenamento}". Verifique se o registro existe.`, "danger");
    }
}

// Listener do formulário da aba "Deletar"
document.getElementById("form-deletar").addEventListener("submit", async function (event) {
    event.preventDefault();

    const armazenamentoInput = document.getElementById("del-armazenamento").value.trim();
    await deletarComputadorPorArmazenamento(armazenamentoInput);
    event.target.reset();
});

// =============================================================================
// BOTÕES DE AÇÃO RÁPIDA NO CARD DE RESULTADO DA BUSCA
// =============================================================================

// Botão 1: Preenche automaticamente o ID na aba de atualização e navega até ela
document.getElementById("btn-rapido-atualizar").addEventListener("click", function () {
    if (!computadorEncontradoAtual) return;

    // Preenche o campo de ID do formulário de atualização
    document.getElementById("upd-id").value = computadorEncontradoAtual.idPC;

    // Ativa a aba "Atualizar" usando a API de abas do Bootstrap 5
    const tabAtualizarBtn = document.getElementById("tab-atualizar");
    const tabInstance = bootstrap.Tab.getOrCreateInstance(tabAtualizarBtn);
    tabInstance.show();

    exibirAlerta(`ID <strong>#${computadorEncontradoAtual.idPC}</strong> preenchido no formulário de atualização. Altere apenas os campos desejados.`, "info");
});

// Botão 2: Deleta diretamente o computador exibido no resultado da busca
document.getElementById("btn-rapido-deletar").addEventListener("click", async function () {
    if (!computadorEncontradoAtual) return;

    const confirmacao = confirm(
        `Deseja realmente deletar o computador "${computadorEncontradoAtual.nome}" (Armazenamento: ${computadorEncontradoAtual.armazenamento})?`
    );

    if (confirmacao) {
        await deletarComputadorPorArmazenamento(computadorEncontradoAtual.armazenamento);
    }
});