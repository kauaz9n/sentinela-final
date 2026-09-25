const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;


// =====================================================
// CONFIGURAÇÕES
// =====================================================

app.use(cors());

app.use(express.json());


// =====================================================
// FRONTEND
// =====================================================

const FRONTEND_PATH = path.join(__dirname, "../frontend");

app.use(express.static(FRONTEND_PATH));


// =====================================================
// BANCO DE DADOS
// =====================================================

const DB_FILE = path.join(__dirname, "db.json");


// =====================================================
// LER BANCO
// =====================================================

function readDB() {

    const bancoPadrao = {

        usuarios: [],

        pacientes: [],

        triagens: [],

        consultas: [],

        altas: [],

        tv_chamada: null,

        tv_historico: []

    };


    if (!fs.existsSync(DB_FILE)) {

        return bancoPadrao;

    }


    try {

        const conteudo =
            fs.readFileSync(
                DB_FILE,
                "utf8"
            );


        if (!conteudo.trim()) {

            return bancoPadrao;

        }


        const db =
            JSON.parse(conteudo);


        if (!Array.isArray(db.usuarios)) {

            db.usuarios = [];

        }


        if (!Array.isArray(db.pacientes)) {

            db.pacientes = [];

        }


        if (!Array.isArray(db.triagens)) {

            db.triagens = [];

        }


        if (!Array.isArray(db.consultas)) {

            db.consultas = [];

        }


        if (!Array.isArray(db.altas)) {

            db.altas = [];

        }


        if (!Array.isArray(db.tv_historico)) {

            db.tv_historico = [];

        }


        if (
            !db.tv_chamada
        ) {

            db.tv_chamada = null;

        }


        return db;


    } catch (erro) {

        console.error(
            "Erro ao ler db.json:",
            erro
        );


        return bancoPadrao;

    }

}


// =====================================================
// GRAVAR BANCO
// =====================================================

function writeDB(data) {

    fs.writeFileSync(

        DB_FILE,

        JSON.stringify(
            data,
            null,
            2
        ),

        "utf8"

    );

}


// =====================================================
// TESTE DO SERVIDOR
// =====================================================

app.get("/status", (req, res) => {

    res.json({

        online: true,

        sistema:
            "Sistema Hospitalar",

        servidor:
            "Node.js / Express",

        porta:
            PORT

    });

});


// =====================================================
// LOGIN
// =====================================================

app.post("/login", (req, res) => {

    try {

        const db = readDB();


        const usuario =
            String(
                req.body.usuario || ""
            ).trim();


        const senha =
            String(
                req.body.senha || ""
            );


        const user =
            db.usuarios.find(
                u =>

                    String(
                        u.usuario || ""
                    ).trim() === usuario

                    &&

                    String(
                        u.senha || ""
                    ) === senha
            );


        if (!user) {

            return res.status(401).json({

                sucesso: false,

                erro:
                    "Usuário ou senha inválidos."

            });

        }


        if (!user.tipo) {

            return res.status(500).json({

                sucesso: false,

                erro:
                    "Usuário sem tipo definido no banco de dados."

            });

        }


        return res.json({

            sucesso: true,

            usuario:
                user.usuario,

            tipo:
                String(
                    user.tipo
                )
                .trim()
                .toLowerCase()

        });


    } catch (erro) {

        console.error(
            "Erro no login:",
            erro
        );


        return res.status(500).json({

            sucesso: false,

            erro:
                "Erro interno no servidor."

        });

    }

});


// =====================================================
// ATENDIMENTO
// =====================================================

app.post("/atendimento", (req, res) => {

    try {

        const db = readDB();


        const paciente = {

            id:
                Date.now(),

            nome:
                req.body.nome || "",

            cpf:
                req.body.cpf || "",

            telefone:
                req.body.telefone || "",

            idade:
                req.body.idade || "",

            responsavel:
                req.body.responsavel || "",

            tipo:
                req.body.tipo || "",

            status:
                "triagem",

            createdAt:
                new Date().toISOString()

        };


        db.pacientes.push(
            paciente
        );


        writeDB(db);


        return res.status(201).json({

            sucesso: true,

            mensagem:
                "Paciente enviado para triagem.",

            paciente:
                paciente

        });


    } catch (erro) {

        console.error(
            "Erro no atendimento:",
            erro
        );


        return res.status(500).json({

            sucesso: false,

            erro:
                "Erro ao cadastrar atendimento."

        });

    }

});


// =====================================================
// LISTAR PACIENTES
// =====================================================

app.get("/pacientes", (req, res) => {

    try {

        const db = readDB();

        res.json(
            db.pacientes
        );


    } catch (erro) {

        console.error(
            "Erro ao listar pacientes:",
            erro
        );


        res.status(500).json({

            erro:
                "Erro ao carregar pacientes."

        });

    }

});


// =====================================================
// TRIAGEM
// =====================================================

app.post("/triagem", (req, res) => {

    try {

        const db = readDB();


        let risco =
            req.body.risco;


        const temperatura =
            Number(
                req.body.temperatura
            );


        if (
            !isNaN(temperatura) &&
            temperatura >= 39
        ) {

            risco = "vermelho";

        }

        else if (
            !isNaN(temperatura) &&
            temperatura >= 38
        ) {

            risco = "amarelo";

        }

        else if (!risco) {

            risco = "verde";

        }


        const triagem = {

            id:
                Date.now(),

            nome:
                req.body.nome || "",

            sintoma:
                req.body.sintoma || "",

            temperatura:
                req.body.temperatura || "",

            alergia:
                req.body.alergia || "",

            observacao:
                req.body.observacao || "",

            risco:
                risco,

            status:
                "aguardando_medico",

            createdAt:
                new Date().toISOString()

        };


        db.triagens.push(
            triagem
        );


        writeDB(db);


        return res.status(201).json({

            sucesso: true,

            mensagem:
                "Triagem registrada.",

            triagem:
                triagem

        });


    } catch (erro) {

        console.error(
            "Erro na triagem:",
            erro
        );


        return res.status(500).json({

            sucesso: false,

            erro:
                "Erro ao registrar triagem."

        });

    }

});


// =====================================================
// LISTAR TRIAGENS
// =====================================================

app.get("/triagens", (req, res) => {

    try {

        const db = readDB();

        res.json(
            db.triagens
        );


    } catch (erro) {

        console.error(
            "Erro ao listar triagens:",
            erro
        );


        res.status(500).json({

            erro:
                "Erro ao carregar triagens."

        });

    }

});


// =====================================================
// TV - CHAMAR PACIENTE
// =====================================================

app.post("/tv/chamar", (req, res) => {

    try {

        const db = readDB();


        const chamada = {

            id:
                Date.now().toString(),

            localTipo:
                req.body.localTipo || "",

            localNumero:
                req.body.localNumero || "",

            paciente:
                req.body.paciente || "",

            hora:
                new Date()
                    .toLocaleTimeString(
                        "pt-BR",
                        {
                            hour:
                                "2-digit",

                            minute:
                                "2-digit"
                        }
                    )

        };


        db.tv_chamada =
            chamada;


        db.tv_historico.unshift(
            chamada
        );


        if (
            db.tv_historico.length > 5
        ) {

            db.tv_historico.pop();

        }


        writeDB(db);


        res.json({

            sucesso: true,

            chamada:
                chamada

        });


    } catch (erro) {

        console.error(
            "Erro na chamada da TV:",
            erro
        );


        res.status(500).json({

            erro:
                "Erro ao chamar paciente."

        });

    }

});


// =====================================================
// TV - CONSULTAR CHAMADA
// =====================================================

app.get("/tv/chamada", (req, res) => {

    try {

        const db = readDB();


        res.json({

            chamada:
                db.tv_chamada,

            historico:
                db.tv_historico

        });


    } catch (erro) {

        console.error(
            "Erro na TV:",
            erro
        );


        res.status(500).json({

            erro:
                "Erro ao carregar chamada."

        });

    }

});


// =====================================================
// LISTA DE MEDICAÇÕES
// =====================================================

app.get(
    "/lista-medicacoes",
    (req, res) => {

        res.json([

            "Dipirona",

            "Paracetamol",

            "Ibuprofeno",

            "Amoxicilina",

            "Azitromicina",

            "Loratadina",

            "Omeprazol",

            "Buscopan",

            "Dramin",

            "Soro fisiológico"

        ]);

    }
);


// =====================================================
// CONSULTA MÉDICA
// =====================================================

app.post("/consulta", (req, res) => {

    try {

        const db = readDB();


        const consulta = {

            id:
                Date.now(),

            paciente:
                req.body.paciente || "",

            diagnostico:
                req.body.diagnostico || "",

            medicacao:
                req.body.medicacao || "",

            obs:
                req.body.obs || "",

            createdAt:
                new Date().toISOString()

        };


        db.consultas.push(
            consulta
        );


        writeDB(db);


        res.status(201).json({

            sucesso: true,

            consulta:
                consulta

        });


    } catch (erro) {

        console.error(
            "Erro na consulta:",
            erro
        );


        res.status(500).json({

            erro:
                "Erro ao salvar consulta."

        });

    }

});


// =====================================================
// MEDICAÇÕES PRESCRITAS
// =====================================================

app.get("/medicacoes", (req, res) => {

    try {

        const db = readDB();

        res.json(
            db.consultas
        );


    } catch (erro) {

        console.error(
            "Erro nas medicações:",
            erro
        );


        res.status(500).json({

            erro:
                "Erro ao carregar medicações."

        });

    }

});


// =====================================================
// ALTA HOSPITALAR
// =====================================================

app.post("/alta", (req, res) => {

    try {

        const db = readDB();


        if (!Array.isArray(db.altas)) {

            db.altas = [];

        }


        const dados =
            req.body || {};


        // -----------------------------
        // VALIDAÇÕES
        // -----------------------------

        const paciente =
            String(
                dados.paciente || ""
            ).trim();


        const diagnostico =
            String(
                dados.diagnostico || ""
            ).trim();


        const houveInternacao =
            String(
                dados.houveInternacao || ""
            ).trim();


        if (!paciente) {

            return res.status(400).json({

                sucesso: false,

                erro:
                    "Informe o nome do paciente."

            });

        }


        if (!diagnostico) {

            return res.status(400).json({

                sucesso: false,

                erro:
                    "Informe o diagnóstico da alta."

            });

        }


        if (!houveInternacao) {

            return res.status(400).json({

                sucesso: false,

                erro:
                    "Informe se houve internação."

            });

        }


        if (
            houveInternacao === "sim" &&
            !dados.internacao
        ) {

            return res.status(400).json({

                sucesso: false,

                erro:
                    "Informe a data da internação."

            });

        }


        // -----------------------------
        // CRIA ALTA
        // -----------------------------

        const alta = {

            id:
                Date.now(),

            paciente:
                paciente,

            cpf:
                String(
                    dados.cpf || ""
                ).trim(),

            prontuario:
                String(
                    dados.prontuario || ""
                ).trim(),

            nascimento:
                dados.nascimento || "",

            sexo:
                dados.sexo || "",


            // INTERNAÇÃO

            houveInternacao:
                houveInternacao,

            internacao:
                dados.internacao || "",

            alta:
                dados.alta || "",

            setor:
                String(
                    dados.setor || ""
                ).trim(),

            leito:
                String(
                    dados.leito || ""
                ).trim(),

            motivo:
                String(
                    dados.motivo || ""
                ).trim(),

            diagnostico:
                diagnostico,

            evolucao:
                String(
                    dados.evolucao || ""
                ).trim(),


            // CONDIÇÃO

            estado:
                dados.estado || "",

            temperatura:
                dados.temperatura || "",

            pressao:
                String(
                    dados.pressao || ""
                ).trim(),

            condicao:
                String(
                    dados.condicao || ""
                ).trim(),


            // MEDICAÇÕES

            medicamentos:
                String(
                    dados.medicamentos || ""
                ).trim(),

            cuidados:
                String(
                    dados.cuidados || ""
                ).trim(),


            // RETORNO

            retorno:
                dados.retorno || "",

            especialidade:
                String(
                    dados.especialidade || ""
                ).trim(),

            acompanhamento:
                String(
                    dados.acompanhamento || ""
                ).trim(),


            // SINAIS

            sinais:
                String(
                    dados.sinais || ""
                ).trim(),


            // PROFISSIONAL

            profissional:
                String(
                    dados.profissional || ""
                ).trim(),

            crm:
                String(
                    dados.crm || ""
                ).trim(),


            createdAt:
                new Date().toISOString()

        };


        // -----------------------------
        // SALVA A ALTA
        // -----------------------------

        db.altas.push(
            alta
        );


        // -----------------------------
        // PROCURA PACIENTE
        // -----------------------------

        let pacienteEncontrado =
            null;


        const cpf =
            String(
                dados.cpf || ""
            ).trim();


        if (cpf) {

            pacienteEncontrado =
                db.pacientes.find(
                    pacienteBanco =>

                        String(
                            pacienteBanco.cpf || ""
                        ).trim() === cpf
                );

        }


        // Se não encontrou pelo CPF,
        // procura pelo nome

        if (!pacienteEncontrado) {

            pacienteEncontrado =
                db.pacientes.find(
                    pacienteBanco =>

                        String(
                            pacienteBanco.nome || ""
                        )
                        .trim()
                        .toLowerCase() ===

                        paciente
                        .trim()
                        .toLowerCase()
                );

        }


        // -----------------------------
        // ATUALIZA STATUS
        // -----------------------------

        if (pacienteEncontrado) {

            pacienteEncontrado.status =
                "alta";


            pacienteEncontrado.alta =
                alta.alta ||
                new Date()
                    .toISOString();

        }


        // -----------------------------
        // GRAVA DB.JSON
        // -----------------------------

        writeDB(db);


        console.log(
            "✅ Alta salva:",
            alta.paciente
        );


        // -----------------------------
        // RESPONDE FRONTEND
        // -----------------------------

        return res.status(201).json({

            sucesso: true,

            mensagem:
                "Alta hospitalar salva com sucesso.",

            alta:
                alta

        });


    } catch (erro) {

        console.error(
            "❌ ERRO AO SALVAR ALTA:",
            erro
        );


        return res.status(500).json({

            sucesso: false,

            erro:
                "Erro interno ao salvar a alta."

        });

    }

});


// =====================================================
// LISTAR ALTAS
// =====================================================

app.get("/altas", (req, res) => {

    try {

        const db = readDB();


        if (!Array.isArray(db.altas)) {

            db.altas = [];

        }


        res.json(
            db.altas
        );


    } catch (erro) {

        console.error(
            "Erro ao listar altas:",
            erro
        );


        res.status(500).json({

            erro:
                "Erro ao carregar altas."

        });

    }

});


// =====================================================
// ROTA PRINCIPAL
// =====================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            FRONTEND_PATH,
            "index.html"
        )
    );

});


// =====================================================
// ERRO 404
// =====================================================

app.use((req, res) => {

    res.status(404).json({

        erro:
            "Rota não encontrada.",

        rota:
            req.method + " " + req.originalUrl

    });

});


// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `🏥 Sistema Hospitalar rodando na porta ${PORT}`
        );

        console.log(
            `📁 Frontend: ${FRONTEND_PATH}`
        );

        console.log(
            `💾 Banco: ${DB_FILE}`
        );

    }
);
