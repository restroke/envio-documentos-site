import { useState } from "react";

export default function UploadDocumentos() {
  const [dados, setDados] = useState({ nome: "", sobrenome: "", contrato: "", email: "" });
  const [files, setFiles] = useState({ rg: null, cpf: null, comprovante: null });
  const [previews, setPreviews] = useState({ rg: null, cpf: null, comprovante: null });
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [popupDoc, setPopupDoc] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const formatted = name === "contrato" ? value.replace(/\D/g, "") : value.toUpperCase();
    setDados({ ...dados, [name]: formatted });
  };

  const handleFileChange = (e, tipo) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFiles({ ...files, [tipo]: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews({ ...previews, [tipo]: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      alert("Por favor, envie um arquivo PDF válido.");
    }
  };

  const handleSubmit = async () => {
    const camposPreenchidos = dados.nome && dados.sobrenome && dados.contrato && dados.email;
    const arquivosPreenchidos = files.rg && files.cpf && files.comprovante;
    if (!camposPreenchidos || !arquivosPreenchidos) {
      alert("Preencha todos os campos e envie os 3 arquivos.");
      return;
    }

    setEnviando(true);
    const formData = new FormData();
    formData.append("nome", dados.nome);
    formData.append("sobrenome", dados.sobrenome);
    formData.append("contrato", dados.contrato);
    formData.append("email", dados.email);
    formData.append("rg", files.rg);
    formData.append("cpf", files.cpf);
    formData.append("comprovante", files.comprovante);

    const res = await fetch("https://backend-render-9kze.onrender.com/api/enviar-documentos/", {
      method: "POST",
      body: formData,
    });

    setEnviando(false);
    if (res.ok) {
      setSucesso(true);
    } else {
      alert("Erro ao enviar os documentos. Tente novamente.");
    }
  };

  const fecharSucesso = () => setSucesso(false);
  const abrirPopup = (tipo) => setPopupDoc(tipo);
  const fecharPopup = () => setPopupDoc(null);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Envio de Documentos</h1>
        <img src="/logo.png" alt="Logo" style={{ height: "125px", marginLeft: "20px" }} />
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>Nome:</label><br />
        <input type="text" name="nome" value={dados.nome} onChange={handleInputChange} style={{ width: "100%", padding: "8px", textTransform: "uppercase" }} />
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>Sobrenome:</label><br />
        <input type="text" name="sobrenome" value={dados.sobrenome} onChange={handleInputChange} style={{ width: "100%", padding: "8px", textTransform: "uppercase" }} />
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>Número do Contrato:</label><br />
        <input type="text" name="contrato" value={dados.contrato} onChange={handleInputChange} style={{ width: "100%", padding: "8px" }} />
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>E-mail para contato:</label><br />
        <input type="email" name="email" value={dados.email} onChange={handleInputChange} style={{ width: "100%", padding: "8px" }} />
      </div>

      {['rg', 'cpf', 'comprovante'].map((tipo) => (
        <div key={tipo} style={{ marginTop: "20px" }}>
          <label>{tipo.toUpperCase()} (PDF):</label><br />
          <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, tipo)} />
          {previews[tipo] && (
            <button style={{ marginTop: "10px" }} onClick={() => abrirPopup(tipo)}>
              Visualizar {tipo.toUpperCase()}
            </button>
          )}
        </div>
      ))}

      <button
        style={{ marginTop: "20px", padding: "10px 20px" }}
        onClick={handleSubmit}
        disabled={!files.rg || !files.cpf || !files.comprovante}
      >
        Finalizar e Enviar
      </button>

      {enviando && (
        <div style={overlayStyle}>
          <div style={popupStyle}>
            <p>Aguarde, enviando os documentos...</p>
          </div>
        </div>
      )}

      {sucesso && (
        <div style={overlayStyle}>
          <div style={popupStyle}>
            <p>✅ Documentos enviados com sucesso!</p>
            <button onClick={fecharSucesso} style={{ marginTop: "10px" }}>OK</button>
          </div>
        </div>
      )}

      {popupDoc && previews[popupDoc] && (
        <div style={overlayStyle}>
          <div style={popupStyle}>
            <h3>{popupDoc.toUpperCase()}</h3>
            <iframe src={previews[popupDoc]} style={{ width: "100%", height: "400px" }} />
            <button onClick={fecharPopup} style={{ marginTop: "10px" }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0, left: 0, width: "100%", height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000
};

const popupStyle = {
  backgroundColor: "#fff",
  padding: "20px 30px",
  borderRadius: "8px",
  textAlign: "center",
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  width: "90%",
  maxWidth: "700px"
};
