import React, { useState, useEffect } from "react";
import { Button, Spacer, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import Games from "./Library/Games/GamesGet";
import { AddGamesIcon } from "./Library/Games/svg/AddGame";
import Downloads from "./Library/DownloadManager/DownloadManager";
import NewLibrary from "./Library/NewLibrary";
import GamesAddModal from "./Library/Games/GamesAdd";

const Library = () => {
  const [games, setGames] = useState([]);
  const [downloadingGames, setDownloadingGames] = useState([]);
  const [customGames, setCustomGames] = useState([]);
  const [isGamesModalOpen, setIsGamesModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const gamesPerPage = 6;

  const toggleGamesModal = () => {
    if (!window.electron.getDownloadDirectory()) {
      setShowDirectoryModal(true);
    } else {
      setIsGamesModalOpen(!isGamesModalOpen);
    }
  };

  const getGames = async () => {
    try {
      const gamesData = await window.electron.getGames();
      if (Array.isArray(gamesData)) {
        const installedGames = [];
        const downloadingGames = [];
        gamesData.forEach((game) => {
          if (game.downloadingData) {
            downloadingGames.push(game); 
          } else {
            installedGames.push(game);
          }
        });
        setGames(installedGames);
        setDownloadingGames(downloadingGames);
      } else {
        console.error("Invalid data format received:", gamesData);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const fetchCustomGames = async () => {
    try {
      const customGamesData = await window.electron.getCustomGames();
      if (Array.isArray(customGamesData)) {
        setCustomGames(customGamesData);
      } else {
        console.error("Invalid data format received:", customGamesData);
      }
    } catch (error) {
      console.error("Error fetching custom games:", error);
    }
  };

  useEffect(() => {
    getGames();
    const intervalId = setInterval(getGames, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchCustomGames();
    const intervalId = setInterval(fetchCustomGames, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const displayedGames = games.length > 0 
   ? games.slice((currentPage - 1) * gamesPerPage, currentPage * gamesPerPage) 
    : customGames.slice((currentPage - 1) * gamesPerPage, currentPage * gamesPerPage);

  const totalPages = Math.ceil((games.length > 0? games.length : customGames.length) / gamesPerPage);

  return (
    <div className="library">
      <GamesAddModal isOpen={isGamesModalOpen} onOpenChange={toggleGamesModal} />
      <Modal
        hideCloseButton
        isOpen={showDirectoryModal}
        onClose={() => setShowDirectoryModal(false)}
        size="md"
        className="fixed arial"
        classNames={{
          body: "py-6",
          backdrop: "bg-[#292f46]/50",
          base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] fixedarial",
        }}
      >
        <ModalContent>
          <ModalHeader>You can't do that yet...</ModalHeader>
          <ModalBody>
            <p>
              You need to set a directory for Ascendara to work with! Please set a games directory by clicking the
              settings button on the bottom left, then click on the Download Directory input.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              color="success"
              onClick={() => setShowDirectoryModal(false)}
            >
              Okay
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Spacer y={20} />
      {games.length === 0 && customGames.length === 0 && downloadingGames.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
          <NewLibrary />
          <Spacer y={5} />
          <Button variant="ghost" onClick={toggleGamesModal}>
            Add a Game
          </Button>
        </div>
      )}
        <div className="library-games-header">
        <h1>
          Your Library
          <Button className="translate-y-1" isIconOnly variant="none" onClick={toggleGamesModal}>
            <AddGamesIcon width={20} height={20} />
          </Button>
        </h1>
        </div>

      {(games.length > 0 || customGames.length > 0) && (
        <div className="library-container">
          <Spacer y={5} />
          <Games games={displayedGames} />
        </div>
      )}
      {downloadingGames.length > 0 && (
        <div className="queue-container">
          <Spacer y={20} />
          <h1 className="text-large">
            Downloads
          </h1>
          <Spacer y={5} />
          <Downloads games={downloadingGames} />
          <Spacer y={20} />
        </div>
      )}
    </div>
  );
};

export default Library;