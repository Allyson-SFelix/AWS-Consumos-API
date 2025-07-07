import React, { useState, useEffect } from 'react';

// Componente principal da aplicação
function App() {
  const REACT_APP_API_URL = "CONFIDENCIAL";

  // === ESTADOS DO COMPONENTE ===
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // === FUNÇÕES DE LÓGICA ===

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

  const listFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(REACT_APP_API_URL);
      if (!res.ok) {
        throw new Error(`Erro ao buscar arquivos: ${res.statusText}`);
      }
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar a lista de arquivos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSuccessMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Por favor, selecione um arquivo para enviar.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const base64Content = await toBase64(selectedFile);

      const res = await fetch(REACT_APP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile.name,
          fileContent: base64Content
        })
      });

      if (!res.ok) {
        throw new Error(`Falha no upload: ${res.statusText}`);
      }
      
      const responseData = await res.json();
      setSuccessMessage(responseData.message);

      setSelectedFile(null);
      document.getElementById('fileInput').value = null;
      await listFiles();

    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao enviar o arquivo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    listFiles();
  }, []);

  // === RENDERIZAÇÃO DO COMPONENTE (JSX) ===
  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center p-6 font-sans">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Card de Upload */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Upload para S3</h1>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              id="fileInput"
              type="file"
              onChange={handleFileSelect}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 w-full text-gray-400 cursor-pointer"
            />
            <button
              onClick={handleUpload}
              disabled={isLoading || !selectedFile}
              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
          {error && <p className="text-red-400 mt-3 text-center sm:text-left">{error}</p>}
          {successMessage && <p className="text-green-400 mt-3 text-center sm:text-left">{successMessage}</p>}
        </div>

        {/* Card da Lista de Arquivos */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Arquivos no Bucket</h2>
          <div className="max-h-80 overflow-y-auto pr-2">
            {isLoading && files.length === 0 ? (
              <p className="text-gray-400">Carregando lista de arquivos...</p>
            ) : (
              <ul className="space-y-2">
                {files.length > 0 ? files.map((fileName) => (
                  <li key={fileName} className="bg-gray-700 p-3 rounded-md text-sm truncate hover:bg-gray-600 transition-colors">
                    {fileName}
                  </li>
                )) : (
                  <li className="text-gray-500">Nenhum arquivo encontrado.</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;