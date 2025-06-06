import React, { useEffect, useState } from 'react'
import { useSidebar } from '../Context/SidebarContext';
import axios from 'axios';
import Creatable from 'react-select/creatable';

function Parcours() {
  const [numEtablissement, setNumEtablissement] = useState();
  const { isReduire } = useSidebar();
  const [isclicked, setIsclicked] = useState(false)
  const [isadd, setisadd] = useState(true)
  const [listeParcours, setListeParcours] = useState([]);
  const [listeMention, setListeMention] = useState([]);
  const [originalList, setOriginalList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState()
  const [dataParcours, setDataParcours] = useState({
    nomParcours: "",
    codeParcours: "",
    numMention: null
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [search, setSearch] = useState('')
  const [error, setError] = useState({ status: false, composant: "", message: "" })

  const getNumEtablissement = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/etablissement/");
      if (response.status !== 200) {
        throw new Error('Erreur code : ' + response.status);
      }
      if (response.data.length > 0) {
        setNumEtablissement(parseInt(response.data[0].numEtablissement));
      } else {
        setError({ status: true, composant: "Etablissement", message: "Aucun établissement trouvé !" });
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsLoading(false);
      console.log("Le tache est terminé");
    }
  };
  const sendData = async (ParcoursData) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/parcours/ajouter/", ParcoursData);
      if (response.status !== 201) throw new Error('Erreur code : ' + response.status);
      console.log("ajouter");
      getData();
    } catch (error) {
      console.error("Erreur:", error.response?.data || error.message);
    }
  };

  const putData = async (ParcoursData) => {
    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/parcours/modifier/${id}`, ParcoursData);
      if (response.status !== 200) throw new Error('Erreur code : ' + response.status);
      console.log("modifié");
      getData();
    } catch (error) {
      console.error("Erreur:", error.response?.data || error.message);
    }
  };

  const removeParcours = async (id) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/parcours/supprimer/${parseInt(id)}`)
      if (response.status !== 200 && response.status !== 204) {
        throw new Error(`Erreur lors de la suppression : Code ${response.status}`)
      }
      console.log(`Parcours ${id} supprimé avec succès`);
      getData()
    } catch (error) {
      console.log("Erreur:", error.message)
    }
  }

  const getData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/parcours/");
      if (response.status !== 200) {
        throw new Error('Erreur code : ' + response.status);
      }
      setListeParcours(response.data);
      setOriginalList(response.data);  // ✅ Mise à jour ici
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsLoading(false);
      console.log("Le tache est terminé");
    }
  };
  const getDatamention = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/mention/");
      if (response.status !== 200) {
        throw new Error('Erreur code : ' + response.status);
      }
      setListeMention(response.data);
    } catch (error) {
      console.error(error.message);
    } finally {

      console.log("Le tache est terminé");
    }
  };
  const editParcours = (numParcours) => {
    const selectedParcours = listeParcours.find((item) => item.numParcours === numParcours)
    if (selectedParcours) {
      setDataParcours({ ...dataParcours, nomParcours: selectedParcours.nomParcours, codeParcours: selectedParcours.codeParcours, numMention: selectedParcours.numMention })
      setId(selectedParcours.numParcours)
    }
  }
  const confirmerSuppression = (id) => {
    setId(id);
    setIsConfirmModalOpen(true);
  }

  function handleSearch(e) {
    const value = e.target.value;
    setSearch(value);

    if (value.trim() !== "") {
      const filtered = originalList.filter((Parcours) =>
        Parcours.nomParcours.toLowerCase().includes(value.toLowerCase()) ||
        Parcours.codeParcours.toLowerCase().includes(value.toLowerCase()) ||
        Parcours.numParcours.toString().includes(value)
      );
      setListeParcours(filtered);
    } else {
      setListeParcours(originalList);
    }
  }
  useEffect(() => {

    getData()
    getDatamention()

  }, [])
  const optionsMention = listeMention.map((mention) => ({
    value: mention.numMention,
    label: mention.nomMention
  }));
  const nombreElemParParge = 8;
  const [pageActuel, setPageActuel] = useState(1);

  const totalPages = Math.ceil(listeParcours.length / nombreElemParParge);
  const currentData = listeParcours.slice((pageActuel - 1) * nombreElemParParge, pageActuel * nombreElemParParge);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (pageActuel <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (pageActuel >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', pageActuel, '...', totalPages);
      }
    }
    return pages;
  }

  return (
    <>
      {/* modal */}
      {(isclicked) ? (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[52] flex justify-center items-center"
          tabIndex="-1"
        >
          <div className="bg-white w-[90%] sm:w-[70%] md:w-[50%] lg:w-[30%] max-h-[90%] overflow-y-auto p-5 rounded-lg shadow-lg space-y-4">
            <div className="flex justify-between items-center w-full">
              {isadd ? (<h1 className="text-blue-600 text-xl font-bold">Nouvelle Parcours</h1>) : (<h1 className="text-blue-600 text-xl font-bold">Modification d'une Parcours</h1>)}
              <img
                src="/Icons/annuler.png"
                alt="Quitter"
                className="w-6 h-6 cursor-pointer"
                onClick={() => {
                  setIsclicked(false);
                  setError({ ...error, status: false })
                  setDataParcours({ nomParcours: "", codeParcours: "" })
                }}
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="font-semibold text-sm mb-1">Mention </label>
              <Creatable
                options={optionsMention}
                onChange={(selectedOption) => {
                  setDataParcours((prev) => ({
                    ...prev,
                    numMention: selectedOption ? selectedOption.value : null
                  }));
                }}
                value={
                  optionsMention.find(
                    (option) => option.value === dataParcours.numMention
                  ) || null
                }
                placeholder="Choisir une mention..."
                isClearable
                isValidNewOption={() => false}
              />
              {
                (error.status && error.composant === "numMention") && (<p className='text-red-600 text-sm'>{error.message}</p>)
              }

            </div>
            <div className="flex flex-col w-full">
              <label className="font-semibold text-sm mb-1">Nom  de la Parcours</label>
              <input
                type="text"
                value={dataParcours.nomParcours}
                onChange={(e) => setDataParcours({ ...dataParcours, nomParcours: e.target.value })}
                className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
              {
                (error.status && error.composant === "nomParcours") && (<p className='text-red-600 text-sm'>{error.message}</p>)
              }
            </div>

            <div className="flex flex-col w-full">
              <label className="font-semibold text-sm mb-1">Code de la Parcour</label>
              <input
                type="text"
                value={dataParcours.codeParcours}
                onChange={(e) => setDataParcours({ ...dataParcours, codeParcours: e.target.value })}
                className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
              {
                (error.status && error.composant === "codeParcours") && (<p className='text-red-600 text-sm'>{error.message}</p>)
              }
            </div>
            <input type="hidden" name="id" value={id} onChange={() => setId(e.target.value)} />


            <div className="w-full flex justify-center">
              <button
                className="bg-blue-600 text-white font-semibold px-6 py-2 rounded hover:bg-blue-700 transition duration-200"
                onClick={() => {
                  if (dataParcours.nomParcours.trim() !== "" && dataParcours.codeParcours.trim() !== "") {
                    if (isadd) {
                      const updateParcours = {
                        ...dataParcours,
                      };
                      sendData(updateParcours);
                      setDataParcours({ nomParcours: "", codeParcours: "" });
                    } else {
                      const updateParcours = {
                        ...dataParcours,
                      };
                      putData(updateParcours);
                      setDataParcours({ nomParcours: "", codeMention: "" });
                    }
                    setIsclicked(false);
                  } else {
                    (dataParcours.nomParcours.trim() === "") ? setError({ error, status: true, composant: "nomParcours", message: "Le nom du Parcours ne peut pas etre vide" }) : (!dataParcours.numMention) ? setError({ error, status: true, composant: "numMention", message: "Le mention ne peut pas etre vide" }) : setError({ error, status: true, composant: "codeParcours", message: "Le code du Parcours ne peut pas etre vide" })

                  }
                }}
              >
                {isadd ? "AJOUTER" : "MODIFIER"}
              </button>
            </div>
          </div>
        </div>
      ) : ""}

      {
        (isConfirmModalOpen) && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[52] flex justify-center items-center"
            tabIndex="-1"
          >
            <div className="bg-white w-[90%] sm:w-[70%] md:w-[50%] lg:w-[30%] max-h-[90%] overflow-y-auto p-5 rounded-lg shadow-lg space-y-4">
              <div className="flex justify-between items-center w-full">
                <h1 className="text-blue-600 text-xl font-bold">Suppression Parcours</h1>
                <img
                  src="/Icons/annuler.png"
                  alt="Quitter"
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    setId('')
                  }}
                />
              </div>
              <div className="flex flex-row gap-2">
                <img src="/Icons/attention.png" alt="Attention" />
                <p>Etes vous sur de vouloir supprimer cette parcours ?</p>
              </div>
              <input type="hidden" name="id" value={id} onChange={() => setId(e.target.value)} />
              <div className="w-full flex justify-center">
                <button
                  className="bg-blue-600 text-white font-semibold px-6 py-2 rounded hover:bg-blue-700 transition duration-200"
                  onClick={() => {
                    if (id !== "") {
                      removeParcours(id)
                    }
                    setIsConfirmModalOpen(false);
                  }}

                >
                  VALIDER
                </button>
              </div>
            </div>
          </div >
        )
      }

      {/*Search */}
      <div className="absolute top-0 left-[25%]  w-[60%]  h-14 flex justify-center items-center z-[51]">

        <input
          type="text"
          placeholder='Rechercher ici...'
          value={search}
          onChange={handleSearch}
          className="border p-2 ps-12 relative rounded w-[50%]  focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <img src="/Icons/rechercher.png" alt="Search" className='w-6 absolute left-[26%]' />
      </div>

      {/*Listes*/}
      <div className={`${isReduire ? "fixed h-screen right-0 top-14 left-20 p-5 z-40 flex flex-col gap-3 overflow-auto bg-white rounded  transition-all duration-700" : "fixed h-screen right-0 top-14 left-56 p-5 z-40 flex flex-col gap-3 overflow-auto bg-white rounded  transition-all duration-700"}`}>
        <div className="flex justify-between w-full">
          <h1 className="font-bold">Liste des Parcours enregistrées</h1>
          <button className="button flex gap-3 hover:scale-105 transition duration-200" onClick={() => { setIsclicked(true); setisadd(true); }}>
            <img src="/Icons/plus-claire.png" alt="Plus" className='w-6 h-6' /> Nouveau
          </button>
        </div>
        {
          isLoading ? (
            <div className="w-full h-40 flex flex-col items-center  justify-center mt-[10%]">
              <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-2">Chargement des données...</p>
            </div>
          ) : listeParcours.length === 0 ? (
            <div className="w-full h-40 flex flex-col items-center justify-center mt-[10%]">
              <img src="/Icons/vide.png" alt="Vide" className='w-14' />
              <p className='text-gray-400'>Aucun données trouvé</p>
            </div>
          ) : (<div>
            <div className="w-full border rounded-t-lg overflow-hidden">
              <table className="table-auto w-full border-collapse">
                <thead>
                  <tr className="bg-blue-500 text-white text-sm">
                    <th className="px-4 py-4">#</th>
                    <th className="px-4 py-4">Nom de la Parcours</th>
                    <th className="px-4 py-4">Code de la Parcours</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {currentData.map((Parcours, index) => (
                    <tr key={index} className="border-b transition-all duration-300  hover:bg-gray-100">
                      <td className="px-4 py-2 text-center">{Parcours.numParcours}</td>
                      <td className="px-4 py-2 text-center">{Parcours.nomParcours}</td>
                      <td className="px-4 py-2 text-center">{Parcours.codeParcours}</td>

                      <td className="px-4 py-2 flex justify-center items-center gap-2">
                        <button className="p-1 rounded hover:bg-gray-200">
                          <img src="/Icons/modifier.png" alt="Modifier" className="w-5" onClick={() => { setIsclicked(true); setisadd(false); editParcours(Parcours.numParcours) }} />
                        </button>
                        <button className="p-1 rounded hover:bg-gray-200" onClick={() => confirmerSuppression(Parcours.numParcours)}>
                          <img src="/Icons/supprimer.png" alt="Supprimer" className="w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="w-full flex justify-center gap-2 p-4">
              {/* Flèche précédente */}
              <button
                onClick={() => setPageActuel((prev) => Math.max(prev - 1, 1))}
                disabled={pageActuel === 1}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 hover:scale-105 transition duration-200 disabled:opacity-50"
              >
                <img src="/Icons/vers-le-bas.png" alt="Précédent" className="w-5 rotate-90" />
              </button>

              {/* Numéros de page */}
              {getPageNumbers().map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof page === 'number' && setPageActuel(page)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition duration-200 ${page === pageActuel ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:scale-105'
                    }`}
                >
                  {page}
                </button>
              ))}

              {/* Flèche suivante */}
              <button
                onClick={() => setPageActuel((prev) => Math.min(prev + 1, totalPages))}
                disabled={pageActuel === totalPages}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 hover:scale-105 transition duration-200 disabled:opacity-50"
              >
                <img src="/Icons/vers-le-bas.png" alt="Suivant" className="w-5 rotate-[270deg]" />
              </button>
            </footer>
          </div>)
        }


      </div>
    </>
  )
}

export default Parcours